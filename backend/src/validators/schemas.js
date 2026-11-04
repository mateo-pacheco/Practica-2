import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).refine(
    (value) => Buffer.byteLength(value, "utf8") <= 72,
    "La contraseña no puede superar 72 bytes",
  ),
});

export const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const uuidSchema = z.string().uuid();

export const conversationSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  memberIds: z.array(uuidSchema).min(1),
});

export const messageSchema = z.object({
  conversationId: uuidSchema,
  content: z.string().trim().min(1).max(4000),
});

export const messageHistorySchema = paginationSchema.extend({
  before: uuidSchema.optional(),
});
