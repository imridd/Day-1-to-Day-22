import { z } from 'zod';
import { CATEGORIES } from '../utils/constants';

const email = z.string().trim().min(1, 'Email is required').email('Enter a valid email');
const name = z.string().trim().min(2, 'Name must be at least 2 characters').max(100);
const mobile = z.string().trim().regex(/^[0-9+\-\s]{7,15}$/, 'Enter a valid mobile number');
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password needs a letter')
  .regex(/\d/, 'Password needs a number');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z
  .object({
    name,
    email,
    mobile: z.union([mobile, z.literal('')]),
    password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const issueSchema = z.object({
  name,
  email,
  mobile,
  subject: z.string().trim().min(5, 'Subject must be at least 5 characters').max(150),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Choose a category' }) }),
  description: z.string().trim().min(20, 'Describe the issue in at least 20 characters').max(2000),
});

export const agentCreateSchema = z.object({ name, email, password });
export const agentEditSchema = z.object({
  name,
  email,
  password: z.union([password, z.literal('')]),
});

export const noteSchema = z.object({ note: z.string().trim().min(1, 'Write a note first').max(2000) });
export const chatSchema = z.object({ message: z.string().trim().min(1).max(2000) });

/** Runs a schema and returns { ok, data, errors: { field: message } } */
export function validate(schema, values) {
  const result = schema.safeParse(values);
  if (result.success) return { ok: true, data: result.data, errors: {} };
  const errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (key !== undefined && !errors[key]) errors[key] = issue.message;
  }
  return { ok: false, data: null, errors };
}
