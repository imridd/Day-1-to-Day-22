
import 'dotenv/config';
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import {
  Module,
  Injectable,
  Controller,
  Get,
  Post,
  Patch,
  Req,
  Body,
  Param,
  Query,
  Inject,
  HttpException
} from '@nestjs/common';

import { createPool } from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

import { canTransition } from './ticket-policy.js';

// =====================================================
// CONFIGURATION
// =====================================================

const env = (key, fallback) => process.env[key] ?? fallback;

const JWT_SECRET = env(
  'JWT_SECRET',
  'dev-only-change-this-secret'
);

const pool = createPool({
  host: env('DB_HOST', '127.0.0.1'),
  port: Number(env('DB_PORT', 3306)),
  user: env('DB_USER', 'root'),
  password: env('DB_PASSWORD', ''),
  database: env('DB_NAME', 'helpdesk'),
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: false,
  timezone: 'Z'
});

const VALID_PRIORITIES = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
];

const VALID_REQUEST_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'ALL'
];

// =====================================================
// SERVICE
// =====================================================

class HelpdeskService {
  constructor(db) {
    this.db = db;
  }
  async isCustomerOnline(customerId) {
    const [customer] = await this.rows(
      `SELECT
       CASE
         WHEN is_online = 1
          AND last_seen_at IS NOT NULL
          AND last_seen_at >= DATE_SUB(NOW(), INTERVAL 45 SECOND)
         THEN 1
         ELSE 0
       END AS online
     FROM users
     WHERE id = ?`,
      [customerId]
    );

    return Number(customer?.online) === 1;
  }

  async rows(sql, values = []) {
    const [rows] = await this.db.execute(sql, values);
    return rows;
  }

  async run(sql, values = []) {
    const [result] = await this.db.execute(sql, values);
    return result;
  }

  fail(status, message) {
    throw new HttpException({ message }, status);
  }

  allow(user, ...roles) {
    if (!roles.includes(user.role)) {
      this.fail(403, 'You do not have permission');
    }
  }

  // ===================================================
  // AUTHENTICATION
  // ===================================================

  async identity(req) {
    const token = req.headers.authorization?.replace(
      /^Bearer\s+/i,
      ''
    );

    if (!token) {
      this.fail(401, 'Please sign in');
    }

    let payload;

    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      this.fail(401, 'Session expired. Please sign in again');
    }

    const [user] = await this.rows(
      `SELECT id, name, email, role, is_active
       FROM users
       WHERE id = ?`,
      [payload.id]
    );

    if (!user || !user.is_active) {
      this.fail(401, 'Account is inactive');
    }

    const [session] = await this.rows(
      `SELECT id
       FROM user_sessions
       WHERE user_id = ?
         AND session_token = ?
         AND revoked_at IS NULL
         AND expires_at > NOW()`,
      [payload.id, payload.jti]
    );

    if (!session) {
      this.fail(401, 'This session is no longer active');
    }

    return {
      ...user,
      session_jti: payload.jti
    };
  }

  async login(data = {}) {
    const email = String(data.email || '')
      .trim()
      .toLowerCase();

    const password = String(data.password || '');

    const [user] = await this.rows(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (
      !user ||
      !user.is_active ||
      !(await bcrypt.compare(password, user.password_hash))
    ) {
      this.fail(401, 'Invalid email or password');
    }

    const jti = randomUUID();
    const hours = Number(env('SESSION_HOURS', 12));

    if (!Number.isFinite(hours) || hours <= 0) {
      this.fail(500, 'Invalid session configuration');
    }

    await this.run(
      `INSERT INTO user_sessions
        (user_id, session_token, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))`,
      [user.id, jti, hours]
    );

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        jti
      },
      JWT_SECRET,
      {
        expiresIn: `${hours}h`
      }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async register(data = {}) {
    const name = String(data.name || '').trim();

    const email = String(data.email || '')
      .trim()
      .toLowerCase();

    const password = String(data.password || '');

    if (
      name.length < 2 ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      password.length < 8
    ) {
      this.fail(
        400,
        'Enter a valid name, email and password (8+ characters)'
      );
    }

    try {
      const result = await this.run(
        `INSERT INTO users
          (name, email, password_hash, role)
         VALUES (?, ?, ?, 'CUSTOMER')`,
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
        role: 'CUSTOMER'
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        this.fail(409, 'An account with this email already exists');
      }

      throw error;
    }
  }

  // ===================================================
  // TICKET ACCESS
  // ===================================================

  async ticketAccess(user, id) {
    const [ticket] = await this.rows(
      `SELECT
       t.*,
       c.name AS customer_name,
       IF(
         c.is_online = 1
         AND c.last_seen_at IS NOT NULL
         AND c.last_seen_at >= DATE_SUB(NOW(), INTERVAL 45 SECOND),
         1,
         0
       ) AS customer_online,
       a.name AS agent_name
     FROM tickets t
     JOIN users c ON c.id = t.customer_id
     LEFT JOIN users a ON a.id = t.assigned_agent_id
     WHERE t.id = ?`,
      [id]
    );

    if (!ticket) {
      this.fail(404, 'Ticket not found');
    }

    if (
      user.role === 'CUSTOMER' &&
      Number(ticket.customer_id) !== Number(user.id)
    ) {
      this.fail(403, 'Not your ticket');
    }

    if (
      user.role === 'AGENT' &&
      Number(ticket.assigned_agent_id) !== Number(user.id) &&
      Number(ticket.last_agent_id) !== Number(user.id) &&
      !['OPEN', 'REOPENED', 'ON_HOLD'].includes(ticket.status)
    ) {
      this.fail(403, 'Ticket is not assigned to you');
    }

    return ticket;
  }

  // ===================================================
  // PRIVATE CHAT ACCESS
  // ===================================================

  async chatAccess(user, id) {
    if (user.role === 'MANAGER') {
      this.fail(
        403,
        'Managers cannot access private conversations'
      );
    }

    const ticket = await this.ticketAccess(user, id);

    if (
      user.role === 'AGENT' &&
      Number(ticket.assigned_agent_id) !== Number(user.id)
    ) {
      this.fail(
        403,
        'Only the currently assigned agent can access this conversation'
      );
    }

    if (
      user.role === 'CUSTOMER' &&
      Number(ticket.customer_id) !== Number(user.id)
    ) {
      this.fail(403, 'You cannot access this conversation');
    }

    if (!['AGENT', 'CUSTOMER'].includes(user.role)) {
      this.fail(403, 'You cannot access this conversation');
    }

    return ticket;
  }

  // ===================================================
  // INTERNAL CHAT ACCESS
  // ===================================================

  async internalChatAccess(user, id) {
    const [ticket] = await this.rows(
      `SELECT
          id,
          ticket_no,
          title,
          status,
          customer_id,
          assigned_agent_id
       FROM tickets
       WHERE id = ?`,
      [id]
    );

    if (!ticket) {
      this.fail(404, 'Ticket not found');
    }

    if (user.role === 'MANAGER') {
      return ticket;
    }

    if (
      user.role === 'AGENT' &&
      Number(ticket.assigned_agent_id) === Number(user.id)
    ) {
      return ticket;
    }

    this.fail(
      403,
      'Only the manager and currently assigned agent can access internal discussions'
    );
  }

  // ===================================================
  // NOTIFICATIONS
  // ===================================================

  async notifyManagers(ticketId, title, body) {
    await this.run(
      `INSERT INTO notifications
        (user_id, ticket_id, title, body)
       SELECT id, ?, ?, ?
       FROM users
       WHERE role = 'MANAGER'
         AND is_active = 1`,
      [ticketId, title, body]
    );
  }

  async notifyCustomer(ticketId, customerId, title, body) {
    await this.run(
      `INSERT INTO notifications
        (user_id, ticket_id, title, body)
       VALUES (?, ?, ?, ?)`,
      [customerId, ticketId, title, body]
    );
  }

  async notifyManagersAboutRequest(requestId, title, body) {
    await this.run(
      `INSERT INTO notifications
        (user_id, request_id, title, body)
       SELECT id, ?, ?, ?
       FROM users
       WHERE role = 'MANAGER'
         AND is_active = 1`,
      [requestId, title, body]
    );
  }

  async notifyRequestCustomer(
    requestId,
    customerId,
    title,
    body,
    ticketId = null
  ) {
    await this.run(
      `INSERT INTO notifications
        (user_id, request_id, ticket_id, title, body)
       VALUES (?, ?, ?, ?, ?)`,
      [customerId, requestId, ticketId, title, body]
    );
  }

  // ===================================================
  // CUSTOMER PRESENCE NOTIFICATIONS
  // ===================================================

  async notifyAssignedAgentsCustomerOffline(
    connection,
    customerId,
    customerName
  ) {
    const [tickets] = await connection.execute(
      `SELECT
         id,
         ticket_no,
         assigned_agent_id
       FROM tickets
       WHERE customer_id = ?
         AND assigned_agent_id IS NOT NULL
         AND status NOT IN ('COMPLETED', 'RESOLVED', 'CLOSED')`,
      [customerId]
    );

    for (const ticket of tickets) {
      await connection.execute(
        `INSERT INTO notifications
          (user_id, ticket_id, title, body)
         VALUES (?, ?, ?, ?)`,
        [
          ticket.assigned_agent_id,
          ticket.id,
          'Customer is offline',
          `${customerName} is offline for ${ticket.ticket_no}.`
        ]
      );
    }
  }

  async notifyManagersCustomerOnline(
    connection,
    customerId,
    customerName
  ) {
    const [tickets] = await connection.execute(
      `SELECT id, ticket_no
       FROM tickets
       WHERE customer_id = ?
         AND status NOT IN ('COMPLETED', 'RESOLVED', 'CLOSED')`,
      [customerId]
    );

    for (const ticket of tickets) {
      await connection.execute(
        `INSERT INTO notifications
          (user_id, ticket_id, title, body)
         SELECT
           id,
           ?,
           'Customer is back online',
           ?
         FROM users
         WHERE role = 'MANAGER'
           AND is_active = 1`,
        [
          ticket.id,
          `${customerName} is online for ${ticket.ticket_no}.`
        ]
      );
    }
  }

  // Find customers whose heartbeat has expired.
  // The row locks ensure concurrent heartbeat requests
  // cannot generate duplicate offline notifications.

  async processStaleCustomerPresence(connection) {
    const [customers] = await connection.execute(
      `SELECT id, name
       FROM users
       WHERE role = 'CUSTOMER'
         AND is_online = 1
         AND (
           last_seen_at IS NULL
           OR last_seen_at < DATE_SUB(NOW(), INTERVAL 45 SECOND)
         )
       FOR UPDATE`
    );

    for (const customer of customers) {
      const [result] = await connection.execute(
        `UPDATE users
         SET is_online = 0
         WHERE id = ?
           AND is_online = 1
           AND (
             last_seen_at IS NULL
             OR last_seen_at < DATE_SUB(NOW(), INTERVAL 45 SECOND)
           )`,
        [customer.id]
      );

      // Notify only if this request actually changed
      // the customer from online to offline.
      if (result.affectedRows > 0) {
        await this.notifyAssignedAgentsCustomerOffline(
          connection,
          customer.id,
          customer.name
        );
      }
    }
  }


  // ===================================================
  // CUSTOMER: CREATE TICKET REQUEST
  // ===================================================

  async createTicketRequest(user, data = {}) {
    this.allow(user, 'CUSTOMER');

    const title = String(data.title || '').trim();
    const description = String(data.description || '').trim();

    if (!title || title.length > 180) {
      this.fail(
        400,
        'Title is required and cannot exceed 180 characters'
      );
    }

    if (!description) {
      this.fail(400, 'Description is required');
    }

    // Prevent duplicate pending requests with the same title.
    const [existing] = await this.rows(
      `SELECT id
       FROM ticket_requests
       WHERE customer_id = ?
         AND title = ?
         AND status = 'PENDING'
       LIMIT 1`,
      [user.id, title]
    );

    if (existing) {
      this.fail(
        409,
        'You already have a pending request with this title'
      );
    }

    const result = await this.run(
      `INSERT INTO ticket_requests
        (customer_id, title, description, status)
       VALUES (?, ?, ?, 'PENDING')`,
      [user.id, title, description]
    );

    const requestId = result.insertId;

    await this.notifyManagersAboutRequest(
      requestId,
      'New ticket request',
      `${user.name} submitted a new request: ${title}`
    );

    return {
      id: requestId,
      title,
      description,
      status: 'PENDING',
      message: 'Your request has been submitted for manager review'
    };
  }

  // ===================================================
  // MANAGER: LIST TICKET REQUESTS
  // ===================================================

  async listTicketRequests(user, status = 'PENDING') {
    this.allow(user, 'MANAGER');

    const selectedStatus = String(status || 'PENDING')
      .toUpperCase();

    if (!VALID_REQUEST_STATUSES.includes(selectedStatus)) {
      this.fail(400, 'Invalid request status');
    }

    const values = [];
    let where = '';

    if (selectedStatus !== 'ALL') {
      where = 'WHERE r.status = ?';
      values.push(selectedStatus);
    }

    return this.rows(
      `SELECT
          r.id,
          r.customer_id,
          r.title,
          r.description,
          r.status,
          r.reviewed_by,
          r.reviewed_at,
          r.rejection_reason,
          r.ticket_id,
          r.created_at,
          r.updated_at,
          c.name AS customer_name,
          c.email AS customer_email,
          reviewer.name AS reviewer_name,
          t.ticket_no
       FROM ticket_requests r
       JOIN users c ON c.id = r.customer_id
       LEFT JOIN users reviewer ON reviewer.id = r.reviewed_by
       LEFT JOIN tickets t ON t.id = r.ticket_id
       ${where}
       ORDER BY
         CASE WHEN r.status = 'PENDING' THEN 0 ELSE 1 END,
         r.created_at DESC`,
      values
    );
  }

  // ===================================================
  // MANAGER: APPROVE TICKET REQUEST
  // ===================================================

  async approveTicketRequest(user, requestId, data = {}) {
    this.allow(user, 'MANAGER');

    if (!Number.isSafeInteger(requestId) || requestId <= 0) {
      this.fail(400, 'Invalid request ID');
    }

    const category = String(data.category || '').trim();
    const priority = String(data.priority || 'MEDIUM')
      .toUpperCase();

    if (!category || category.length > 80) {
      this.fail(400, 'Choose a valid category');
    }

    if (!VALID_PRIORITIES.includes(priority)) {
      this.fail(400, 'Invalid priority');
    }

    const agentId =
      data.agentId === null ||
        data.agentId === undefined ||
        data.agentId === ''
        ? null
        : Number(data.agentId);

    if (
      agentId !== null &&
      (!Number.isSafeInteger(agentId) || agentId <= 0)
    ) {
      this.fail(400, 'Invalid agent ID');
    }

    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const [requests] = await connection.execute(
        `SELECT *
         FROM ticket_requests
         WHERE id = ?
         FOR UPDATE`,
        [requestId]
      );

      const request = requests[0];

      if (!request) {
        this.fail(404, 'Ticket request not found');
      }

      if (request.status !== 'PENDING') {
        this.fail(409, 'This request has already been reviewed');
      }

      if (agentId !== null) {
        const [agents] = await connection.execute(
          `SELECT id
           FROM users
           WHERE id = ?
             AND role = 'AGENT'
             AND is_active = 1`,
          [agentId]
        );

        if (!agents.length) {
          this.fail(400, 'Choose an active agent');
        }
      }

      const [duplicates] = await connection.execute(
        `SELECT id
         FROM tickets
         WHERE customer_id = ?
           AND title = ?
           AND status NOT IN ('RESOLVED', 'CLOSED')
         LIMIT 1`,
        [request.customer_id, request.title]
      );

      if (duplicates.length) {
        this.fail(
          409,
          'An active ticket with this title already exists. Review the existing ticket before approving.'
        );
      }

      const ticketNo =
        `HD-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 90 + 10)}`;

      const initialStatus = agentId === null
        ? 'OPEN'
        : 'IN_PROGRESS';

      const [ticketResult] = await connection.execute(
        `INSERT INTO tickets
          (
            ticket_no,
            customer_id,
            assigned_agent_id,
            last_agent_id,
            title,
            description,
            category,
            priority,
            status
          )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ticketNo,
          request.customer_id,
          agentId,
          agentId,
          request.title,
          request.description,
          category,
          priority,
          initialStatus
        ]
      );

      const ticketId = ticketResult.insertId;

      await connection.execute(
        `INSERT INTO ticket_activities
          (ticket_id, actor_id, activity)
         VALUES (?, ?, ?)`,
        [
          ticketId,
          user.id,
          'Ticket created after manager approval'
        ]
      );

      await connection.execute(
        `UPDATE ticket_requests
         SET status = 'APPROVED',
             reviewed_by = ?,
             reviewed_at = NOW(),
             ticket_id = ?
         WHERE id = ?`,
        [user.id, ticketId, requestId]
      );

      await connection.execute(
        `INSERT INTO notifications
          (user_id, request_id, ticket_id, title, body)
         VALUES (?, ?, ?, ?, ?)`,
        [
          request.customer_id,
          requestId,
          ticketId,
          'Request approved',
          `${ticketNo}: Your request has been approved. Current status: ${initialStatus}.`
        ]
      );

      if (agentId !== null) {
        await connection.execute(
          `INSERT INTO notifications
            (user_id, ticket_id, title, body)
           VALUES (?, ?, ?, ?)`,
          [
            agentId,
            ticketId,
            'Issue assigned',
            `${ticketNo} has been assigned to you`
          ]
        );
      }

      await connection.commit();

      return {
        requestId,
        ticketId,
        ticketNo,
        status: initialStatus,
        assignedAgentId: agentId,
        message: 'Request approved and ticket created successfully'
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ===================================================
  // MANAGER: REJECT TICKET REQUEST
  // ===================================================

  async rejectTicketRequest(user, requestId, reason = '') {
    this.allow(user, 'MANAGER');

    if (!Number.isSafeInteger(requestId) || requestId <= 0) {
      this.fail(400, 'Invalid request ID');
    }

    const rejectionReason = String(reason || '').trim();

    if (rejectionReason.length > 500) {
      this.fail(
        400,
        'Rejection reason cannot exceed 500 characters'
      );
    }

    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const [requests] = await connection.execute(
        `SELECT *
         FROM ticket_requests
         WHERE id = ?
         FOR UPDATE`,
        [requestId]
      );

      const request = requests[0];

      if (!request) {
        this.fail(404, 'Ticket request not found');
      }

      if (request.status !== 'PENDING') {
        this.fail(409, 'This request has already been reviewed');
      }

      await connection.execute(
        `UPDATE ticket_requests
         SET status = 'REJECTED',
             reviewed_by = ?,
             reviewed_at = NOW(),
             rejection_reason = ?
         WHERE id = ?`,
        [
          user.id,
          rejectionReason || null,
          requestId
        ]
      );

      await connection.execute(
        `INSERT INTO notifications
          (user_id, request_id, title, body)
         VALUES (?, ?, ?, ?)`,
        [
          request.customer_id,
          requestId,
          'Request not approved',
          rejectionReason
            ? `Your request "${request.title}" was not approved. Reason: ${rejectionReason}`
            : `Your request "${request.title}" was not approved.`
        ]
      );

      await connection.commit();

      return {
        requestId,
        status: 'REJECTED',
        message: 'Request rejected successfully'
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ===================================================
  // TICKET LIST
  // ===================================================
  async listTickets(user, q = {}) {
    const where = [];
    const vals = [];

    if (user.role === 'CUSTOMER') {
      where.push('t.customer_id = ?');
      vals.push(user.id);
    }

    if (user.role === 'AGENT') {
      if (q.scope === 'pool') {
        where.push(
          "(t.assigned_agent_id IS NULL OR t.status = 'ON_HOLD') AND t.status IN ('OPEN','REOPENED','ON_HOLD')"
        );
      } else {
        where.push(
          "(t.assigned_agent_id = ? OR (t.last_agent_id = ? AND t.status = 'REOPENED'))"
        );
        vals.push(user.id, user.id);
      }
    }

    if (q.status && q.status !== 'ALL') {
      where.push('t.status = ?');
      vals.push(q.status);
    }

    const sql = `
    SELECT
      t.id,
      t.ticket_no,
      t.title,
      t.description,
      t.category,
      t.priority,
      t.status,
      t.customer_id,
      t.assigned_agent_id,
      t.created_at,
      t.updated_at,
      c.name AS customer_name,
      IF(
        c.is_online = 1
        AND c.last_seen_at IS NOT NULL
        AND c.last_seen_at >= DATE_SUB(NOW(), INTERVAL 45 SECOND),
        1,
        0
      ) AS customer_online,
      a.name AS agent_name
    FROM tickets t
    JOIN users c ON c.id = t.customer_id
    LEFT JOIN users a ON a.id = t.assigned_agent_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY t.created_at DESC
  `;

    return this.rows(sql, vals);
  }

  // ===================================================
  // CONVERSATIONS INBOX
  // ===================================================

  async listConversations(user) {
    if (!['MANAGER', 'AGENT', 'CUSTOMER'].includes(user.role)) {
      this.fail(403, 'You cannot access conversations');
    }

    const loadChannel = async (
      table,
      channelType,
      notificationTitle,
      whereClause,
      whereValues
    ) => {
      const sql = `
        SELECT
          t.id,
          t.ticket_no,
          t.title,
          t.status,
          t.priority,
          t.customer_id,
          t.assigned_agent_id,

          '${channelType}' AS channel_type,

          c.name AS customer_name,
          a.name AS agent_name,

          (
            SELECT m.message
            FROM ${table} m
            WHERE m.ticket_id = t.id
            ORDER BY m.id DESC
            LIMIT 1
          ) AS latest_message,

          (
            SELECT m.created_at
            FROM ${table} m
            WHERE m.ticket_id = t.id
            ORDER BY m.id DESC
            LIMIT 1
          ) AS latest_message_at,

          (
            SELECT u.name
            FROM ${table} m
            JOIN users u ON u.id = m.sender_id
            WHERE m.ticket_id = t.id
            ORDER BY m.id DESC
            LIMIT 1
          ) AS latest_sender_name,

          (
            SELECT COUNT(*)
            FROM notifications n
            WHERE n.user_id = ?
              AND n.ticket_id = t.id
              AND n.title = ?
              AND n.is_read = 0
          ) AS unread_count

        FROM tickets t
        JOIN users c ON c.id = t.customer_id
        LEFT JOIN users a ON a.id = t.assigned_agent_id
        WHERE ${whereClause}
        ORDER BY latest_message_at DESC, t.updated_at DESC
      `;

      return this.rows(sql, [
        user.id,
        notificationTitle,
        ...whereValues
      ]);
    };

    const conversations = [];

    if (user.role === 'MANAGER') {
      const internalChats = await loadChannel(
        'ticket_internal_messages',
        'INTERNAL',
        'New internal ticket message',
        '1 = 1',
        []
      );

      conversations.push(...internalChats);
    }

    if (user.role === 'AGENT') {
      const customerChats = await loadChannel(
        'ticket_messages',
        'CUSTOMER',
        'New ticket message',
        't.assigned_agent_id = ?',
        [user.id]
      );

      const internalChats = await loadChannel(
        'ticket_internal_messages',
        'INTERNAL',
        'New internal ticket message',
        't.assigned_agent_id = ?',
        [user.id]
      );

      conversations.push(...customerChats, ...internalChats);
    }

    if (user.role === 'CUSTOMER') {
      const customerChats = await loadChannel(
        'ticket_messages',
        'CUSTOMER',
        'New ticket message',
        't.customer_id = ?',
        [user.id]
      );

      conversations.push(...customerChats);
    }

    conversations.sort((a, b) => {
      const dateA = a.latest_message_at
        ? new Date(a.latest_message_at).getTime()
        : 0;

      const dateB = b.latest_message_at
        ? new Date(b.latest_message_at).getTime()
        : 0;

      return dateB - dateA || Number(b.id) - Number(a.id);
    });

    return conversations;
  }

  // ===================================================
  // MANAGER: CREATE TICKET DIRECTLY
  // ===================================================

  async createTicket(user, data = {}) {
    this.allow(user, 'MANAGER');

    const customerId = Number(data.customerId);
    const title = String(data.title || '').trim();
    const description = String(data.description || '').trim();
    const category = String(data.category || 'General').trim();
    const priority = String(data.priority || 'MEDIUM').toUpperCase();

    if (!Number.isSafeInteger(customerId) || customerId <= 0) {
      this.fail(400, 'A valid customer is required');
    }

    if (!title || title.length > 180 || !description) {
      this.fail(400, 'Valid title and description are required');
    }

    if (!category || category.length > 80) {
      this.fail(400, 'Invalid category');
    }

    if (!VALID_PRIORITIES.includes(priority)) {
      this.fail(400, 'Invalid priority');
    }

    const [customer] = await this.rows(
      `SELECT id
       FROM users
       WHERE id = ?
         AND role = 'CUSTOMER'
         AND is_active = 1`,
      [customerId]
    );

    if (!customer) {
      this.fail(400, 'Choose an active customer');
    }

    const [existing] = await this.rows(
      `SELECT id
       FROM tickets
       WHERE customer_id = ?
         AND title = ?
         AND status NOT IN ('RESOLVED', 'CLOSED')
       LIMIT 1`,
      [customerId, title]
    );

    if (existing) {
      this.fail(409, 'A matching active issue already exists');
    }

    const ticketNo =
      `HD-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 90 + 10)}`;

    const result = await this.run(
      `INSERT INTO tickets
        (ticket_no, customer_id, title, description, category, priority)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ticketNo, customerId, title, description, category, priority]
    );

    await this.run(
      `INSERT INTO ticket_activities
        (ticket_id, actor_id, activity)
       VALUES (?, ?, ?)`,
      [
        result.insertId,
        user.id,
        'Ticket created by manager'
      ]
    );

    await this.notifyCustomer(
      result.insertId,
      customerId,
      'New ticket created',
      `${ticketNo}: A ticket has been created for your issue.`
    );

    return this.ticketAccess(user, result.insertId);
  }

  // ===================================================
  // CHANGE TICKET STATUS
  // ===================================================


  async changeStatus(user, id, status, extra = {}) {
    const t = await this.ticketAccess(user, id);

    const next = status === 'REOPEN' ? 'REOPENED' : status;

    if (!canTransition(user.role, t.status, next)) {
      this.fail(409, `Cannot change ${t.status} to ${next}`);
    }

    // Agent can request a hold only when the customer is offline.
    if (next === 'HOLD_REQUESTED') {
      this.allow(user, 'AGENT');

      const online = await this.isCustomerOnline(t.customer_id);

      if (online) {
        this.fail(
          409,
          'Customer is online. Hold request is not allowed.'
        );
      }
    }

    // Manager must recheck customer presence before approving a hold.
    if (next === 'ON_HOLD') {
      this.allow(user, 'MANAGER');

      const online = await this.isCustomerOnline(t.customer_id);

      if (online) {
        this.fail(
          409,
          'Customer is online. This hold request cannot be approved.'
        );
      }
    }

    if (next === 'RESOLVED' && t.status !== 'COMPLETED') {
      this.fail(409, 'Only completed tickets can be resolved');
    }

    if (next === 'CLOSED' && t.status !== 'RESOLVED') {
      this.fail(409, 'Only resolved tickets can be closed');
    }

    const clearAssignment =
      status === 'REOPEN' ||
      (
        next === 'OPEN' &&
        user.role === 'MANAGER' &&
        t.status === 'ON_HOLD'
      );

    // Update ticket status.
    const result = await this.run(
      `UPDATE tickets
     SET
       status = ?,
       updated_at = NOW(),
       resolved_at = ?,
       hold_requested_by = IF(?, ?, hold_requested_by),
       assigned_agent_id = IF(?, NULL, assigned_agent_id)
     WHERE id = ?
       AND status = ?`,
      [
        next,
        ['RESOLVED', 'CLOSED'].includes(next) ? new Date() : null,
        next === 'HOLD_REQUESTED' ? 1 : 0,
        user.id,
        clearAssignment ? 1 : 0,
        id,
        t.status
      ]
    );

    if (!result.affectedRows) {
      this.fail(
        409,
        'Ticket status changed before this action completed. Refresh and try again.'
      );
    }

    // Record ticket activity.
    await this.run(
      `INSERT INTO ticket_activities
      (ticket_id, actor_id, activity)
     VALUES (?, ?, ?)`,
      [
        id,
        user.id,
        `Status changed: ${t.status} → ${next}${extra.note ? ` — ${extra.note}` : ''
        }`
      ]
    );

    // NEW: Notify all active managers when an agent requests a hold.
    if (next === 'HOLD_REQUESTED') {
      await this.notifyManagers(
        id,
        'Hold request received',
        `${t.ticket_no}: ${user.name} has requested to put this ticket on hold.`
      );
    }

    // Return updated ticket.
    return this.ticketAccess(
      user.role === 'AGENT' && next === 'OPEN'
        ? { ...user, role: 'MANAGER' }
        : user,
      id
    );
  }


  // ===================================================
  // MANAGER: ASSIGN TICKET
  // ===================================================

  async assign(user, id, agentId, priority) {
    this.allow(user, 'MANAGER');

    const [ticket] = await this.rows(
      'SELECT * FROM tickets WHERE id = ?',
      [id]
    );

    if (!ticket) {
      this.fail(404, 'Issue not found');
    }

    if (
      ['COMPLETED', 'RESOLVED', 'CLOSED'].includes(ticket.status)
    ) {
      this.fail(
        409,
        'Reopen this issue before assigning it'
      );
    }

    if (
      agentId !== null &&
      agentId !== undefined
    ) {
      const [agent] = await this.rows(
        `SELECT id
         FROM users
         WHERE id = ?
           AND role = 'AGENT'
           AND is_active = 1`,
        [agentId]
      );

      if (!agent) {
        this.fail(400, 'Choose an active agent');
      }
    }

    const normalizedPriority = priority
      ? String(priority).toUpperCase()
      : null;

    if (
      normalizedPriority &&
      !VALID_PRIORITIES.includes(normalizedPriority)
    ) {
      this.fail(400, 'Invalid priority');
    }

    await this.run(
      `UPDATE tickets
       SET assigned_agent_id = ?,
           last_agent_id = IF(? IS NULL, last_agent_id, ?),
           priority = COALESCE(?, priority),
           status = IF(
             ? IS NULL,
             IF(status = 'IN_PROGRESS', 'OPEN', status),
             IF(
               status IN ('OPEN', 'REOPENED', 'ON_HOLD'),
               'IN_PROGRESS',
               status
             )
           ),
           updated_at = NOW()
       WHERE id = ?`,
      [
        agentId,
        agentId,
        agentId,
        normalizedPriority,
        agentId,
        id
      ]
    );

    const [updatedTicket] = await this.rows(
      'SELECT status FROM tickets WHERE id = ?',
      [id]
    );

    if (agentId !== null && agentId !== undefined) {
      await this.run(
        `INSERT INTO notifications
          (user_id, ticket_id, title, body)
         VALUES (?, ?, ?, ?)`,
        [
          agentId,
          id,
          'Issue assigned',
          `${ticket.ticket_no} has been assigned to you`
        ]
      );
    }

    if (ticket.status !== updatedTicket.status) {
      await this.run(
        `INSERT INTO ticket_activities
          (ticket_id, actor_id, activity)
         VALUES (?, ?, ?)`,
        [
          id,
          user.id,
          `Status changed: ${ticket.status} → ${updatedTicket.status}`
        ]
      );

      await this.notifyCustomer(
        id,
        ticket.customer_id,
        'Issue status updated',
        `${ticket.ticket_no}: Your issue status changed from ${ticket.status} to ${updatedTicket.status}.`
      );
    }

    await this.run(
      `INSERT INTO ticket_activities
        (ticket_id, actor_id, activity)
       VALUES (?, ?, ?)`,
      [
        id,
        user.id,
        agentId
          ? `Assigned to agent #${agentId}`
          : 'Issue left unassigned by manager'
      ]
    );

    return this.ticketAccess(user, id);
  }

  // ===================================================
  // AGENT: CLAIM TICKET
  // ===================================================

  async claim(user, id) {
    this.allow(user, 'AGENT');

    const [ticket] = await this.rows(
      `SELECT
          id,
          ticket_no,
          title,
          customer_id,
          status
       FROM tickets
       WHERE id = ?`,
      [id]
    );

    if (!ticket) {
      this.fail(404, 'Issue not found');
    }

    const result = await this.run(
      `UPDATE tickets
       SET assigned_agent_id = ?,
           last_agent_id = ?,
           status = 'IN_PROGRESS',
           updated_at = NOW()
       WHERE id = ?
         AND (assigned_agent_id IS NULL OR status = 'ON_HOLD')
         AND status IN ('OPEN', 'REOPENED', 'ON_HOLD')`,
      [user.id, user.id, id]
    );

    if (!result.affectedRows) {
      this.fail(
        409,
        'Issue is no longer available to pick'
      );
    }

    await this.run(
      `INSERT INTO ticket_activities
        (ticket_id, actor_id, activity)
       VALUES (?, ?, ?)`,
      [
        id,
        user.id,
        `Status changed: ${ticket.status} → IN_PROGRESS`
      ]
    );

    await this.notifyCustomer(
      id,
      ticket.customer_id,
      'Issue status updated',
      `${ticket.ticket_no}: An agent has picked up your issue. Status: IN_PROGRESS.`
    );

    await this.notifyManagers(
      id,
      'Agent picked up an issue',
      `${ticket.ticket_no}: ${user.name} has picked up this issue.`
    );

    return this.ticketAccess(user, id);
  }

  // ===================================================
  // PRIVATE MESSAGES
  // ===================================================

  async getMessages(user, id) {
    await this.chatAccess(user, id);

    return this.rows(
      `SELECT
          m.id,
          m.ticket_id,
          m.message,
          m.created_at,
          u.id AS sender_id,
          u.name AS sender_name,
          u.role AS sender_role
       FROM ticket_messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.ticket_id = ?
       ORDER BY m.id`,
      [id]
    );
  }

  async postMessage(user, id, message) {
    const ticket = await this.chatAccess(user, id);

    if (
      ['RESOLVED', 'CLOSED', 'COMPLETED'].includes(ticket.status)
    ) {
      this.fail(
        409,
        'This ticket conversation is read-only until the ticket is reopened'
      );
    }

    const text = String(message || '').trim();

    if (!text || text.length > 2000) {
      this.fail(
        400,
        'Message must contain 1–2000 characters'
      );
    }

    const result = await this.run(
      `INSERT INTO ticket_messages
        (ticket_id, sender_id, message)
       VALUES (?, ?, ?)`,
      [id, user.id, text]
    );

    const recipient = user.role === 'CUSTOMER'
      ? ticket.assigned_agent_id
      : ticket.customer_id;

    if (recipient) {
      await this.run(
        `INSERT INTO notifications
          (user_id, ticket_id, title, body)
         VALUES (?, ?, ?, ?)`,
        [
          recipient,
          id,
          'New ticket message',
          `${ticket.ticket_no}: ${text.slice(0, 100)}`
        ]
      );
    }

    const [createdMessage] = await this.rows(
      `SELECT
          m.id,
          m.ticket_id,
          m.message,
          m.created_at,
          u.id AS sender_id,
          u.name AS sender_name,
          u.role AS sender_role
       FROM ticket_messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.id = ?`,
      [result.insertId]
    );

    return createdMessage;
  }

  // ===================================================
  // INTERNAL MESSAGES
  // ===================================================

  async getInternalMessages(user, id) {
    await this.internalChatAccess(user, id);

    return this.rows(
      `SELECT
          m.id,
          m.ticket_id,
          m.message,
          m.created_at,
          u.id AS sender_id,
          u.name AS sender_name,
          u.role AS sender_role
       FROM ticket_internal_messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.ticket_id = ?
       ORDER BY m.id ASC`,
      [id]
    );
  }

  async postInternalMessage(user, id, message) {
    const ticket = await this.internalChatAccess(user, id);

    if (
      ['COMPLETED', 'RESOLVED', 'CLOSED'].includes(ticket.status)
    ) {
      this.fail(
        409,
        'This ticket is closed for internal messaging'
      );
    }

    const text = String(message || '').trim();

    if (!text || text.length > 2000) {
      this.fail(
        400,
        'Message must contain 1–2000 characters'
      );
    }

    const result = await this.run(
      `INSERT INTO ticket_internal_messages
        (ticket_id, sender_id, message)
       VALUES (?, ?, ?)`,
      [id, user.id, text]
    );

    if (
      user.role === 'MANAGER' &&
      ticket.assigned_agent_id
    ) {
      await this.run(
        `INSERT INTO notifications
          (user_id, ticket_id, title, body)
         VALUES (?, ?, ?, ?)`,
        [
          ticket.assigned_agent_id,
          id,
          'New internal ticket message',
          `${ticket.ticket_no}: ${text.slice(0, 100)}`
        ]
      );
    }

    if (user.role === 'AGENT') {
      await this.notifyManagers(
        id,
        'New internal ticket message',
        `${ticket.ticket_no}: ${text.slice(0, 100)}`
      );
    }

    const [createdMessage] = await this.rows(
      `SELECT
          m.id,
          m.ticket_id,
          m.message,
          m.created_at,
          u.id AS sender_id,
          u.name AS sender_name,
          u.role AS sender_role
       FROM ticket_internal_messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.id = ?`,
      [result.insertId]
    );

    return createdMessage;
  }

  // ===================================================
  // AGENT ACTIVITY
  // ===================================================

  async addActivity(user, id, activity) {
    await this.ticketAccess(user, id);
    this.allow(user, 'AGENT');

    const text = String(activity || '').trim();

    if (!text) {
      this.fail(400, 'Activity is required');
    }

    await this.run(
      `INSERT INTO ticket_activities
        (ticket_id, actor_id, activity)
       VALUES (?, ?, ?)`,
      [id, user.id, text]
    );

    return { ok: true };
  }
 // ===================================================
  // HEARTBEAT
  // ===================================================

  async heartbeat(user) {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      // First process customers whose presence expired.
      await this.processStaleCustomerPresence(connection);

      // Lock the current user's row.
      const [rows] = await connection.execute(
        `SELECT
           is_online,
           IF(
             is_online = 1
             AND last_seen_at IS NOT NULL
             AND last_seen_at >= DATE_SUB(NOW(), INTERVAL 45 SECOND),
             1,
             0
           ) AS recently_online
         FROM users
         WHERE id = ?
         FOR UPDATE`,
        [user.id]
      );

      if (!rows.length) {
        throw new Error('User not found during heartbeat');
      }

      // A notification is generated only on an actual
      // offline-to-online transition.
      const cameOnline =
        Number(rows[0].recently_online) !== 1;

      await connection.execute(
        `UPDATE users
         SET is_online = 1,
             last_seen_at = NOW()
         WHERE id = ?`,
        [user.id]
      );

      // Notify managers when a customer comes online.
      if (user.role === 'CUSTOMER' && cameOnline) {
        await this.notifyManagersCustomerOnline(
          connection,
          user.id,
          user.name
        );
      }

      await connection.commit();

      return { online: true };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ===================================================
  // LOGOUT WITH CUSTOMER PRESENCE HANDLING
  // ===================================================

  async logout(user) {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const [users] = await connection.execute(
        `SELECT id, name, role, is_online
         FROM users
         WHERE id = ?
         FOR UPDATE`,
        [user.id]
      );

      if (!users.length) {
        this.fail(404, 'User not found');
      }

      const currentUser = users[0];

      // Revoke only the current session.
      await connection.execute(
        `UPDATE user_sessions
         SET revoked_at = NOW()
         WHERE user_id = ?
           AND session_token = ?
           AND revoked_at IS NULL`,
        [user.id, user.session_jti]
      );

      // Check whether another active session exists.
      const [sessions] = await connection.execute(
        `SELECT COUNT(*) AS active_sessions
         FROM user_sessions
         WHERE user_id = ?
           AND revoked_at IS NULL
           AND expires_at > NOW()`,
        [user.id]
      );

      if (Number(sessions[0].active_sessions) === 0) {
        await connection.execute(
          `UPDATE users
           SET is_online = 0
           WHERE id = ?`,
          [user.id]
        );

        // Notify assigned agents only if a customer
        // was actually marked online before logout.
        if (
          currentUser.role === 'CUSTOMER' &&
          Number(currentUser.is_online) === 1
        ) {
          await this.notifyAssignedAgentsCustomerOffline(
            connection,
            currentUser.id,
            currentUser.name
          );
        }
      }

      await connection.commit();

      return { ok: true };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }


}

// =====================================================
// SERVICE DEPENDENCY INJECTION
// =====================================================

Inject('DB')(HelpdeskService, undefined, 0);
Injectable()(HelpdeskService);

// =====================================================
// CONTROLLER
// =====================================================

class HelpdeskController {
  constructor(service, db) {
    this.s = service;
    this.db = db;
  }

  // ===================================================
  // BASIC / AUTH
  // ===================================================

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

    await this.s.run(
      `UPDATE user_sessions
       SET revoked_at = NOW()
       WHERE user_id = ?
         AND session_token = ?
         AND revoked_at IS NULL`,
      [user.id, user.session_jti]
    );

    await this.s.run(
      `UPDATE users
       SET is_online = 0
       WHERE id = ?
         AND NOT EXISTS (
           SELECT 1
           FROM user_sessions s
           WHERE s.user_id = ?
             AND s.revoked_at IS NULL
             AND s.expires_at > NOW()
         )`,
      [user.id, user.id]
    );

    return { ok: true };
  }

  async heartbeat(req) {
    return this.s.heartbeat(
      await this.s.identity(req)
    );
  }

  // ===================================================
  // TICKETS
  // ===================================================

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
       ${user.role === 'CUSTOMER'
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

  // ===================================================
  // CUSTOMER REQUEST SUBMISSION
  // ===================================================

  async createTicketRequest(req, body) {
    const user = await this.s.identity(req);

    return this.s.createTicketRequest(user, body);
  }

  // ===================================================
  // MANAGER REQUEST REVIEW
  // ===================================================

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

  // ===================================================
  // PRIVATE MESSAGES
  // ===================================================

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

  // ===================================================
  // INTERNAL MESSAGES
  // ===================================================

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

  // ===================================================
  // CONVERSATIONS
  // ===================================================

  async conversations(req) {
    const user = await this.s.identity(req);
    return this.s.listConversations(user);
  }

  // ===================================================
  // AGENTS
  // ===================================================

  async agents(req) {
    const user = await this.s.identity(req);
    this.s.allow(user, 'MANAGER');

    return this.s.rows(
      `SELECT
          id,
          name,
          email,
          is_active,
          is_online,
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

  // ===================================================
  // CUSTOMERS
  // ===================================================

  async customers(req) {
    const u = await this.s.identity(req);
    this.s.allow(u, 'MANAGER');

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
  // ===================================================
  // NOTIFICATIONS
  // ===================================================

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

  // ===================================================
  // REPORTS
  // ===================================================

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

// =====================================================
// CONTROLLER DEPENDENCY INJECTION
// =====================================================

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

Injectable()(HelpdeskController);
Controller('api')(HelpdeskController);

// =====================================================
// MANUAL ROUTE DECORATORS
// =====================================================

const route = (verb, path, method, params) => {
  const descriptor = Object.getOwnPropertyDescriptor(
    HelpdeskController.prototype,
    method
  );

  verb(path)(
    HelpdeskController.prototype,
    method,
    descriptor
  );

  for (const [decorator, index] of params) {
    decorator(
      HelpdeskController.prototype,
      method,
      index
    );
  }
};

// =====================================================
// AUTHENTICATION ROUTES
// =====================================================

route(Get, 'health', 'health', []);

route(Post, 'auth/login', 'login', [
  [Req(), 0],
  [Body(), 1]
]);

route(Post, 'auth/register', 'register', [
  [Req(), 0],
  [Body(), 1]
]);

route(Get, 'auth/me', 'me', [
  [Req(), 0]
]);

route(Post, 'auth/logout', 'logout', [
  [Req(), 0]
]);

route(Post, 'presence/heartbeat', 'heartbeat', [
  [Req(), 0]
]);

// =====================================================
// TICKET ROUTES
// =====================================================

route(Get, 'tickets', 'tickets', [
  [Req(), 0],
  [Query(), 1]
]);

route(Post, 'tickets', 'createTicket', [
  [Req(), 0],
  [Body(), 1]
]);

route(Get, 'tickets/:id', 'ticket', [
  [Req(), 0],
  [Param(), 1]
]);

route(Post, 'tickets/:id/claim', 'claim', [
  [Req(), 0],
  [Param(), 1]
]);

route(Patch, 'tickets/:id/assign', 'assign', [
  [Req(), 0],
  [Param(), 1],
  [Body(), 2]
]);

route(Patch, 'tickets/:id/status', 'status', [
  [Req(), 0],
  [Param(), 1],
  [Body(), 2]
]);

route(Post, 'tickets/:id/activities', 'activity', [
  [Req(), 0],
  [Param(), 1],
  [Body(), 2]
]);

// =====================================================
// CUSTOMER REQUEST ROUTES
// =====================================================

route(Post, 'ticket-requests', 'createTicketRequest', [
  [Req(), 0],
  [Body(), 1]
]);

// =====================================================
// MANAGER REQUEST REVIEW ROUTES
// =====================================================

route(Get, 'ticket-requests', 'ticketRequests', [
  [Req(), 0],
  [Query(), 1]
]);

route(Patch, 'ticket-requests/:id/approve', 'approveTicketRequest', [
  [Req(), 0],
  [Param(), 1],
  [Body(), 2]
]);

route(Patch, 'ticket-requests/:id/reject', 'rejectTicketRequest', [
  [Req(), 0],
  [Param(), 1],
  [Body(), 2]
]);

// =====================================================
// PRIVATE MESSAGE ROUTES
// =====================================================

route(Get, 'tickets/:id/messages', 'messages', [
  [Req(), 0],
  [Param(), 1]
]);

route(Post, 'tickets/:id/messages', 'sendMessage', [
  [Req(), 0],
  [Param(), 1],
  [Body(), 2]
]);

// =====================================================
// INTERNAL MESSAGE ROUTES
// =====================================================

route(Get, 'tickets/:id/internal-messages', 'internalMessages', [
  [Req(), 0],
  [Param(), 1]
]);

route(Post, 'tickets/:id/internal-messages', 'sendInternalMessage', [
  [Req(), 0],
  [Param(), 1],
  [Body(), 2]
]);

// =====================================================
// CONVERSATION ROUTES
// =====================================================

route(Get, 'conversations', 'conversations', [
  [Req(), 0]
]);

// =====================================================
// AGENT ROUTES
// =====================================================

route(Get, 'agents', 'agents', [
  [Req(), 0]
]);

route(Post, 'agents', 'createAgent', [
  [Req(), 0],
  [Body(), 1]
]);

route(Patch, 'agents/:id', 'updateAgent', [
  [Req(), 0],
  [Param(), 1],
  [Body(), 2]
]);

// =====================================================
// CUSTOMER ROUTES
// =====================================================

route(Get, 'customers', 'customers', [
  [Req(), 0]
]);

// =====================================================
// NOTIFICATION ROUTES
// =====================================================

route(Get, 'notifications', 'notifications', [
  [Req(), 0]
]);

route(Patch, 'notifications/:id/read', 'readNotification', [
  [Req(), 0],
  [Param(), 1]
]);

// =====================================================
// REPORT ROUTES
// =====================================================

route(Get, 'reports', 'reports', [
  [Req(), 0]
]);

// =====================================================
// APP MODULE
// =====================================================

class AppModule { }

Module({
  controllers: [HelpdeskController],
  providers: [
    {
      provide: 'DB',
      useValue: pool
    },
    HelpdeskService
  ]
})(AppModule);

// =====================================================
// START SERVER
// =====================================================

const app = await NestFactory.create(
  AppModule,
  { cors: false }
);

app.enableCors({
  origin: env(
    'WEB_ORIGIN',
    'http://localhost:5173'
  ).split(','),
  credentials: true
});

app.setGlobalPrefix('');

const port = Number(env('PORT', 3000));

await app.listen(port);

console.log(
  `Helpdesk API listening at http://localhost:${port}/api`
);
