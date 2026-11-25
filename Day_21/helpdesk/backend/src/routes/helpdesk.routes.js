import {
  Get,
  Post,
  Patch,
  Req,
  Body,
  Param,
  Query
} from '@nestjs/common';

import { HelpdeskController } from '../controllers/helpdesk.controller.js';

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

export const registerHelpdeskRoutes = () => {
  // AUTHENTICATION

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

  // TICKETS

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

  // CUSTOMER REQUESTS

  route(Post, 'ticket-requests', 'createTicketRequest', [
    [Req(), 0],
    [Body(), 1]
  ]);

  // MANAGER REQUEST REVIEW

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

  // PRIVATE MESSAGES

  route(Get, 'tickets/:id/messages', 'messages', [
    [Req(), 0],
    [Param(), 1]
  ]);

  route(Post, 'tickets/:id/messages', 'sendMessage', [
    [Req(), 0],
    [Param(), 1],
    [Body(), 2]
  ]);

  // INTERNAL MESSAGES

  route(Get, 'tickets/:id/internal-messages', 'internalMessages', [
    [Req(), 0],
    [Param(), 1]
  ]);

  route(Post, 'tickets/:id/internal-messages', 'sendInternalMessage', [
    [Req(), 0],
    [Param(), 1],
    [Body(), 2]
  ]);

  // CONVERSATIONS

  route(Get, 'conversations', 'conversations', [
    [Req(), 0]
  ]);

  // AGENTS

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

  // CUSTOMERS

  route(Get, 'customers', 'customers', [
    [Req(), 0]
  ]);

  // NOTIFICATIONS

  route(Get, 'notifications', 'notifications', [
    [Req(), 0]
  ]);

  route(Patch, 'notifications/:id/read', 'readNotification', [
    [Req(), 0],
    [Param(), 1]
  ]);

  // REPORTS

  route(Get, 'reports', 'reports', [
    [Req(), 0]
  ]);
};

registerHelpdeskRoutes();