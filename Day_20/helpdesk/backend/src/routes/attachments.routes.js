import fs from 'node:fs';
import path from 'node:path';
import { query } from '../config/db.js';
import { httpError, idParam } from '../utils/errors.js';
import { UPLOAD_ROOT } from './tickets.routes.js';

export default async function attachmentRoutes(app) {
  // Authenticated download: manager, or the agent who owns the ticket
  app.get('/:id', { preHandler: [app.authenticate, app.authorize('MANAGER', 'AGENT')] }, async (req, reply) => {
    const id = idParam(req.params.id);
    const rows = await query(
      `SELECT a.*, t.assigned_agent_id FROM ticket_attachments a
       JOIN tickets t ON t.ticket_id = a.ticket_id WHERE a.id = ?`,
      [id]
    );
    const att = rows[0];
    if (!att) throw httpError(404, 'File not found');
    const u = req.currentUser;
    if (u.role === 'AGENT' && att.assigned_agent_id !== u.id) throw httpError(403, 'Forbidden');

    const full = path.join(UPLOAD_ROOT, path.basename(att.stored_name));
    if (!fs.existsSync(full)) throw httpError(404, 'File missing on server');
    reply
      .header('Content-Type', att.mime_type)
      .header('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(att.original_name)}`)
      .header('X-Content-Type-Options', 'nosniff');
    return reply.send(fs.createReadStream(full));
  });
}
