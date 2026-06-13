import { z } from "zod";
import { SECURITY } from "@/lib/constants";

export const emailSchema = z.string().trim().toLowerCase().email().max(254);

export const passwordSchema = z
  .string()
  .min(SECURITY.MIN_PASSWORD_LENGTH, `Password must be at least ${SECURITY.MIN_PASSWORD_LENGTH} characters`)
  .max(128)
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a digit");

export const nameSchema = z.string().trim().min(1, "Name is required").max(100);

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(16).max(512),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
});

export const updateProfileSchema = z.object({
  name: nameSchema,
});

export const startLocationSessionSchema = z.object({
  consent: z.literal(true, { error: "Explicit consent is required to start sharing" }),
  label: z.string().trim().max(80).optional().default(""),
});

export const positionSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  acc: z.number().min(0).max(100_000),
  alt: z.number().min(-1_000).max(20_000).nullish(),
  spd: z.number().min(0).max(600).nullish(),
  hdg: z.number().min(0).max(360).nullish(),
  ts: z.number().int().positive(),
});

export const locationUpdateSchema = z.object({
  sessionId: z.string().uuid(),
  position: positionSchema,
});

export const adminCreateUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["super_admin", "admin", "operator", "viewer", "user"]),
});

export const adminUpdateUserSchema = z
  .object({
    name: nameSchema.optional(),
    role: z.enum(["super_admin", "admin", "operator", "viewer", "user"]).optional(),
    status: z.enum(["active", "disabled"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: "No fields to update" });

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const auditQuerySchema = paginationSchema.extend({
  action: z.string().trim().max(64).optional(),
  actor: z.string().trim().max(254).optional(),
});

export const userSearchSchema = paginationSchema.extend({
  q: z.string().trim().max(254).optional(),
  role: z.enum(["super_admin", "admin", "operator", "viewer", "user"]).optional(),
  status: z.enum(["active", "disabled"]).optional(),
});

export const riskEventQuerySchema = paginationSchema.extend({
  status: z.enum(["open", "acknowledged", "resolved"]).optional(),
  severity: z.enum(["info", "warning", "critical"]).optional(),
  source: z.string().trim().max(80).optional(),
  type: z.string().trim().max(120).optional(),
  subject: z.string().trim().max(160).optional(),
});

export const createRiskEventSchema = z.object({
  source: z.string().trim().min(1).max(80),
  eventType: z.string().trim().min(1).max(120),
  severity: z.enum(["info", "warning", "critical"]),
  riskScore: z.number().int().min(0).max(100).optional().default(0),
  subjectType: z.string().trim().max(80).optional().default(""),
  subjectId: z.string().trim().max(120).optional().default(""),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2_000).optional().default(""),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export const riskEventActionSchema = z.object({
  note: z.string().trim().max(1_000).optional().default(""),
});

export const walletCurrencySchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{3,10}$/, "Currency must be 3-10 uppercase letters or digits");

export const walletQuerySchema = paginationSchema.extend({
  q: z.string().trim().max(254).optional(),
  userId: z.string().uuid().optional(),
  type: z.enum(["main", "trading", "bonus", "credit", "crypto", "multi_currency"]).optional(),
  status: z.enum(["active", "frozen", "archived"]).optional(),
  currency: walletCurrencySchema.optional(),
});

export const createWalletSchema = z.object({
  userId: z.string().uuid(),
  walletType: z.enum(["main", "trading", "bonus", "credit", "crypto", "multi_currency"]),
  currency: walletCurrencySchema,
});

export const updateWalletStatusSchema = z.object({
  status: z.enum(["active", "frozen", "archived"]),
  memo: z.string().trim().max(500).optional().default(""),
});

export const walletTransferSchema = z.object({
  fromWalletId: z.string().uuid(),
  toWalletId: z.string().uuid(),
  amountMinor: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  memo: z.string().trim().max(500).optional().default(""),
});

export const reverseWalletTransferSchema = z.object({
  memo: z.string().trim().max(500).optional().default(""),
});
