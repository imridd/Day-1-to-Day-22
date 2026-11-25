
import {
  Inject,
  Controller
} from '@nestjs/common';

import bcrypt from 'bcryptjs';

import { HelpdeskService } from '../services/helpdesk.service.js';

export class HelpdeskController {
  constructor(service, db) {
    this.s = service;
    this.db = db;
  }

  // BASIC / AUTH

  async health() {
    return {
      status: 'ok',
      service: 'helpdesk-api'
    };
  }

  async login(req, body) {
    return this.s.login(body);
  }

  async register(req, body) {
    return this.s.register(body);
  }

  async me(req) {
    const user = await this.s.identity(req);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  async logout(req) {
    const user = await this.s.identity(req);
    return this.s.logout(user);
  }

  async heartbeat(req) {
    return this.s.heartbeat(
      await this.s.identity(req)
    );
  }

  // TICKETS

  async tickets(req, query) {
    const user = await this.s.identity(req);
    return this.s.listTickets(user, query);
  }

  async createTicket(req, body) {
    const user = await this.s.identity(req);
    return this.s.createTicket(user, body);
  }

  async ticket(req, params) {
    const user = await this.s.identity(req);
    const id = Number(params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      this.s.fail(400, 'Invalid issue ID');
    }

    const ticket = await this.s.ticketAccess(user, id);

    const canChat =
      user.role === 'CUSTOMER'
        ? Number(ticket.customer_id) === Number(user.id)
        : user.role === 'AGENT'
          ? Number(ticket.assigned_agent_id) === Number(user.id)
          : false;

    const canViewInternalChat =
      user.role === 'MANAGER' ||
      (
        user.role === 'AGENT' &&
        Number(ticket.assigned_agent_id) === Number(user.id)
      );

    const messages = canChat
      ? await this.s.getMessages(user, id)
      : [];

    const internalMessages = canViewInternalChat
      ? await this.s.getInternalMessages(user, id)
      : [];

    const activities = await this.s.rows(
      `SELECT
          a.id,
          a.activity,
          a.created_at,
          u.name AS actor_name
       FROM ticket_activities a
       JOIN users u ON u.id = a.actor_id
       WHERE a.ticket_id = ?
       ${
         user.role === 'CUSTOMER'
           ? "AND a.activity LIKE 'Status changed:%'"
           : ''
       }
       ORDER BY a.id DESC`,
      [id]
    );

    return {
      ticket,
      messages,
      activities,
      canChat,
      internalMessages,
      canViewInternalChat
    };
  }

  async claim(req, params) {
    const user = await this.s.identity(req);
    const id = Number(params.id);

    return this.s.claim(user, id);
  }

  async assign(req, params, body) {
    const user = await this.s.identity(req);
    const id = Number(params.id);

    const agentId =
      body.agentId === null ||
      body.agentId === undefined ||
      body.agentId === ''
        ? null
        : Number(body.agentId);

    return this.s.assign(
      user,
      id,
      agentId,
      body.priority
    );
  }

  async status(req, params, body) {
    const user = await this.s.identity(req);
    const id = Number(params.id);

    return this.s.changeStatus(
      user,
      id,
      body.status,
      body
    );
  }

  async activity(req, params, body) {
    const user = await this.s.identity(req);
    const id = Number(params.id);

    return this.s.addActivity(
      user,
      id,
      body.activity
    );
  }

  // CUSTOMER REQUEST SUBMISSION

  async createTicketRequest(req, body) {
    const user = await this.s.identity(req);
    return this.s.createTicketRequest(user, body);
  }

  // MANAGER REQUEST REVIEW

  async ticketRequests(req, query) {
    const user = await this.s.identity(req);

    return this.s.listTicketRequests(
      user,
      query.status || 'PENDING'
    );
  }

  async approveTicketRequest(req, params, body) {
    const user = await this.s.identity(req);
    const requestId = Number(params.id);

    if (!Number.isSafeInteger(requestId) || requestId <= 0) {
      this.s.fail(400, 'Invalid request ID');
    }

    return this.s.approveTicketRequest(
      user,
      requestId,
      body
    );
  }

  async rejectTicketRequest(req, params, body) {
    const user = await this.s.identity(req);
    const requestId = Number(params.id);

    if (!Number.isSafeInteger(requestId) || requestId <= 0) {
      this.s.fail(400, 'Invalid request ID');
    }

    return this.s.rejectTicketRequest(
      user,
      requestId,
      body.reason
    );
  }

  // PRIVATE MESSAGES

  async messages(req, params) {
    return this.s.getMessages(
      await this.s.identity(req),
      Number(params.id)
    );
  }

  async sendMessage(req, params, body) {
    return this.s.postMessage(
      await this.s.identity(req),
      Number(params.id),
      body.message
    );
  }

  // INTERNAL MESSAGES

  async internalMessages(req, params) {
    return this.s.getInternalMessages(
      await this.s.identity(req),
      Number(params.id)
    );
  }

  async sendInternalMessage(req, params, body) {
    return this.s.postInternalMessage(
      await this.s.identity(req),
      Number(params.id),
      body.message
    );
  }

  // CONVERSATIONS

  async conversations(req) {
    const user = await this.s.identity(req);
    return this.s.listConversations(user);
  }

  // AGENTS

  async agents(req) {
    const user = await this.s.identity(req);
    this.s.allow(user, 'MANAGER');

    return this.s.rows(
      `SELECT
          id,
          name,
          email,
          is_active,
          CASE
            WHEN is_active = 1
             AND is_online = 1
             AND last_seen_at IS NOT NULL
             AND last_seen_at >= DATE_SUB(NOW(), INTERVAL 45 SECOND)
            THEN 1
            ELSE 0
          END AS is_online,
          last_seen_at,
          created_at
       FROM users
       WHERE role = 'AGENT'
       ORDER BY name`
    );
  }

  async createAgent(req, body) {
    const user = await this.s.identity(req);
    this.s.allow(user, 'MANAGER');

    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (
      name.length < 2 ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      password.length < 8
    ) {
      this.s.fail(
        400,
        'Enter a valid name, email and password (8+ characters)'
      );
    }

    try {
      const result = await this.s.run(
        `INSERT INTO users
          (name, email, password_hash, role)
         VALUES (?, ?, ?, 'AGENT')`,
        [
          name,
          email,
          await bcrypt.hash(password, 10)
        ]
      );

      return {
        id: result.insertId,
        name,
        email,
        role: 'AGENT'
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        this.s.fail(409, 'Email already exists');
      }

      throw error;
    }
  }

  async updateAgent(req, params, body) {
    const user = await this.s.identity(req);
    this.s.allow(user, 'MANAGER');

    const agentId = Number(params.id);

    if (!Number.isSafeInteger(agentId) || agentId <= 0) {
      this.s.fail(400, 'Invalid agent ID');
    }

    const name = body.name !== undefined
      ? String(body.name).trim()
      : null;

    const email = body.email !== undefined
      ? String(body.email).trim().toLowerCase()
      : null;

    if (name !== null && name.length < 2) {
      this.s.fail(
        400,
        'Agent name must contain at least 2 characters'
      );
    }

    if (
      email !== null &&
      !/^\S+@\S+\.\S+$/.test(email)
    ) {
      this.s.fail(400, 'Enter a valid email address');
    }

    if (
      body.isActive !== undefined &&
      typeof body.isActive !== 'boolean'
    ) {
      this.s.fail(400, 'isActive must be true or false');
    }

    try {
      const result = await this.s.run(
        `UPDATE users
         SET name = COALESCE(?, name),
             email = COALESCE(?, email),
             is_active = COALESCE(?, is_active),
             is_online = IF(? = 0, 0, is_online)
         WHERE id = ?
           AND role = 'AGENT'`,
        [
          name || null,
          email || null,
          typeof body.isActive === 'boolean'
            ? Number(body.isActive)
            : null,
          typeof body.isActive === 'boolean'
            ? Number(body.isActive)
            : 1,
          agentId
        ]
      );

      if (!result.affectedRows) {
        this.s.fail(404, 'Agent not found');
      }

      if (body.isActive === false) {
        await this.s.run(
          `UPDATE user_sessions
           SET revoked_at = NOW()
           WHERE user_id = ?
             AND revoked_at IS NULL`,
          [agentId]
        );
      }

      return { ok: true };

    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        this.s.fail(409, 'Email already exists');
      }

      throw error;
    }
  }

  // CUSTOMERS

  async customers(req) {
    const user = await this.s.identity(req);
    this.s.allow(user, 'MANAGER');

    return this.s.rows(
      `SELECT
          id,
          name,
          email,
          IF(
            is_online = 1
            AND last_seen_at IS NOT NULL
            AND last_seen_at >= DATE_SUB(NOW(), INTERVAL 45 SECOND),
            1,
            0
          ) AS is_online,
          last_seen_at
       FROM users
       WHERE role = 'CUSTOMER'
       ORDER BY name`
    );
  }

  // NOTIFICATIONS

  async notifications(req) {
    const user = await this.s.identity(req);

    return this.s.rows(
      `SELECT *
       FROM notifications
       WHERE user_id = ?
       ORDER BY id DESC
       LIMIT 100`,
      [user.id]
    );
  }

  async readNotification(req, params) {
    const user = await this.s.identity(req);
    const notificationId = Number(params.id);

    if (
      !Number.isSafeInteger(notificationId) ||
      notificationId <= 0
    ) {
      this.s.fail(400, 'Invalid notification ID');
    }

    await this.s.run(
      `UPDATE notifications
       SET is_read = 1
       WHERE id = ?
         AND user_id = ?`,
      [notificationId, user.id]
    );

    return { ok: true };
  }

  // REPORTS

  async reports(req) {
    const user = await this.s.identity(req);

    this.s.allow(
      user,
      'MANAGER',
      'AGENT',
      'CUSTOMER'
    );

    let where = '';
    const values = [];

    if (user.role === 'AGENT') {
      where = `
        AND (
          assigned_agent_id = ?
          OR (
            last_agent_id = ?
            AND status = 'REOPENED'
          )
        )
      `;

      values.push(user.id, user.id);
    }

    if (user.role === 'CUSTOMER') {
      where = ' AND customer_id = ?';
      values.push(user.id);
    }

    const counts = await this.s.rows(
      `SELECT
          status,
          COUNT(*) AS total
       FROM tickets
       WHERE 1 = 1
       ${where}
       GROUP BY status`,
      values
    );

    const trend = await this.s.rows(
      `SELECT
          DATE(created_at) AS day,
          COUNT(*) AS total
       FROM tickets
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
       ${where}
       GROUP BY DATE(created_at)
       ORDER BY day`,
      values
    );

    return {
      counts,
      trend
    };
  }
}

// REGISTER CONTROLLER AND DEPENDENCIES

Controller('api')(HelpdeskController);

Inject(HelpdeskService)(
  HelpdeskController,
  undefined,
  0
);

Inject('DB')(
  HelpdeskController,
  undefined,
  1
);
