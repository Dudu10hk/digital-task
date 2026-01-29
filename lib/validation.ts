import { z } from "zod"

// ============================================
// Input Validation Schemas
// ============================================

export const emailSchema = z.string().email("אימייל לא תקין").min(3).max(255)

export const passwordSchema = z
  .string()
  .min(8, "סיסמה חייבת להכיל לפחות 8 תווים")
  .max(100, "סיסמה ארוכה מדי")
  .regex(/[A-Z]/, "סיסמה חייבת להכיל אות גדולה")
  .regex(/[a-z]/, "סיסמה חייבת להכיל אות קטנה")
  .regex(/[0-9]/, "סיסמה חייבת להכיל מספר")

export const otpSchema = z
  .string()
  .length(6, "קוד OTP חייב להיות 6 ספרות")
  .regex(/^\d{6}$/, "קוד OTP חייב להכיל רק ספרות")

export const taskTitleSchema = z
  .string()
  .min(1, "כותרת היא שדה חובה")
  .max(200, "כותרת ארוכה מדי")
  .trim()

export const taskDescriptionSchema = z
  .string()
  .max(10000, "תיאור ארוך מדי")
  .optional()

export const urlSchema = z
  .string()
  .url("כתובת URL לא תקינה")
  .optional()
  .or(z.literal(""))

export const userNameSchema = z
  .string()
  .min(2, "שם חייב להכיל לפחות 2 תווים")
  .max(100, "שם ארוך מדי")
  .trim()

export const userRoleSchema = z.enum(["admin", "user", "viewer"])

export const fileSchema = z.object({
  name: z.string().max(255),
  size: z.number().max(5 * 1024 * 1024, "קובץ גדול מדי (מקסימום 5MB)"),
  type: z.string().regex(/^(application\/pdf|image\/.*|application\/vnd\..*|text\/.*)/),
})

export const taskSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "in-progress", "review", "done"]),
  column: z.enum(["todo", "in-progress", "review", "done"]),
  assigneeId: z.string().uuid().optional().nullable(),
  handlerId: z.string().uuid().optional().nullable(),
  dueDate: z.date().optional().nullable(),
  figmaLink: urlSchema,
  processSpecLink: urlSchema,
  files: z.array(fileSchema).max(10, "מקסימום 10 קבצים למשימה").optional(),
})

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const otpLoginSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
})

export const createUserSchema = z.object({
  name: userNameSchema,
  email: emailSchema,
  role: userRoleSchema,
  avatar: urlSchema,
})

// ============================================
// Sanitization helpers
// ============================================

/**
 * Remove dangerous HTML/JS from strings
 */
export function sanitizeString(input: string): string {
  if (!input) return input
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove <script> tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers (onclick, onload, etc.)
    .trim()
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeString(sanitized[key]) as any
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key])
    }
  }
  
  return sanitized
}

/**
 * Validate file type and size
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: "קובץ גדול מדי. מקסימום 5MB" }
  }
  
  // Whitelist of allowed types
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
    "application/vnd.ms-excel", // xls
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "application/msword", // doc
    "text/csv",
  ]
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "סוג קובץ לא נתמך" }
  }
  
  // Check file extension
  const ext = file.name.split(".").pop()?.toLowerCase()
  const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "gif", "webp", "xlsx", "xls", "docx", "doc", "csv"]
  
  if (!ext || !allowedExtensions.includes(ext)) {
    return { valid: false, error: "סיומת קובץ לא נתמכת" }
  }
  
  return { valid: true }
}

/**
 * Validate email format (additional to zod)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check for suspicious patterns (potential XSS/injection)
 */
export function hasSuspiciousContent(input: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /eval\(/i,
    /expression\(/i,
    /vbscript:/i,
  ]
  
  return suspiciousPatterns.some(pattern => pattern.test(input))
}
