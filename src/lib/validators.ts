import { z } from "zod";
import { ROLE_IDS, SECURITY } from "@/lib/constants";

export const emailSchema = z.string().trim().toLowerCase().email().max(254);

export const passwordSchema = z
  .string()
  .min(SECURITY.MIN_PASSWORD_LENGTH, `Password must be at least ${SECURITY.MIN_PASSWORD_LENGTH} characters`)
  .max(128)
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a digit");

export const nameSchema = z.string().trim().min(1, "Name is required").max(100);

const optionalTrimmedText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value ?? "");

const updateTrimmedText = (max: number) => z.string().trim().max(max).optional();

const roleSchema = z.enum(ROLE_IDS);

const crmDepartmentSchema = z.enum(["management", "retention", "sale", "client"]);

const retentionStatusSchema = z.enum(["pending", "active", "at_risk", "retained", "lost"]);

const managerIdSchema = z
  .union([z.string().uuid(), z.literal("")])
  .optional()
  .transform((value) => (value ? value : null));

const updateManagerIdSchema = z
  .union([z.string().uuid(), z.literal("")])
  .optional()
  .transform((value) => (value === undefined ? undefined : value || null));

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
  role: roleSchema,
  phone: optionalTrimmedText(32),
  address: optionalTrimmedText(300),
  dateOfBirth: optionalTrimmedText(10).refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Birth date must use YYYY-MM-DD format",
  }),
  image: optionalTrimmedText(1024),
  department: crmDepartmentSchema.default("client"),
  retentionStatus: retentionStatusSchema.default("pending"),
  managerId: managerIdSchema,
});

export const adminUpdateUserSchema = z
  .object({
    name: nameSchema.optional(),
    role: roleSchema.optional(),
    phone: updateTrimmedText(32),
    address: updateTrimmedText(300),
    dateOfBirth: updateTrimmedText(10).refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "Birth date must use YYYY-MM-DD format",
    }),
    image: updateTrimmedText(1024),
    department: crmDepartmentSchema.optional(),
    retentionStatus: retentionStatusSchema.optional(),
    managerId: updateManagerIdSchema,
    status: z.enum(["active", "disabled"]).optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), { message: "No fields to update" });

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
  role: roleSchema.optional(),
  status: z.enum(["active", "disabled"]).optional(),
});
