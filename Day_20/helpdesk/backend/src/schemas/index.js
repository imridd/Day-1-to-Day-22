import { z } from 'zod';

export const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
export const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];
export const CATEGORIES = ['Billing', 'Technical', 'Account', 'General', 'Other'];

const email = z.string().trim().toLowerCase().email('Enter a valid email').max(150);
const name = z.string().trim().min(2, 'Name must be at least 2 characters').max(100);
const mobile = z.string().trim().regex(/^[0-9+\-\s]{7,15}$/, 'Enter a valid mobile number');
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72)
  .regex(/[A-Za-z]/, 'Password needs a letter')
  .regex(/\d/, 'Password needs a number');
const emptyToUndef = (s) => z.preprocess((v) => (v === '' ? undefined : v), s.optional());

export const loginSchema = z.object({ email, password: z.string().min(1).max(72) });

export const registerSchema = z.object({ name, email, mobile: emptyToUndef(mobile), password });

export const agentCreateSchema = z.object({ name, email, password });
export const agentUpdateSchema = z.object({ name, email, password: emptyToUndef(password) });
export const agentStatusSchema = z.object({ status: z.enum(['ACTIVE', 'DISABLED']) });

export const issueSchema = z.object({
  name,
  email,
  mobile,
  subject: z.string().trim().min(5, 'Subject must be at least 5 characters').max(150),
  category: z.enum(CATEGORIES),
  description: z.string().trim().min(20, 'Describe the issue in at least 20 characters').max(2000),
});

export const createTicketSchema = z.object({
  agentId: z.coerce.number().int().positive().nullable().optional(),
});

export const assignSchema = z.object({ agentId: z.coerce.number().int().positive().nullable() });
export const statusSchema = z.object({ status: z.enum(STATUSES) });
export const prioritySchema = z.object({ priority: z.enum(PRIORITIES) });
export const noteSchema = z.object({ note: z.string().trim().min(1, 'Note is empty').max(2000) });

export const ticketQuerySchema = z.object({
  status: z.enum(STATUSES).optional(),
  scope: z.enum(['mine', 'pool']).optional(),
});

export const chatRoomSchema = z.object({
  ticketId: z.coerce.number().int().positive(),
  room: z.enum(['CUSTOMER_AGENT', 'MANAGER_AGENT']),
});
export const chatMessageSchema = chatRoomSchema.extend({
  message: z.string().trim().min(1).max(2000),
});
export const typingSchema = chatRoomSchema.extend({ isTyping: z.boolean() });
