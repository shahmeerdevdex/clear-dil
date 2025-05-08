import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Required"),
  password: z.string().min(1, "Required"),
});

export const resetPasswordApiSchema = z.object({
  newPassword: z.string(),
  username: z.string().trim(),
  password: z.string(),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[\W_]/,
        "Password must contain at least one special character (!@#$%^&*)"
      ),
    confirmPassword: z.string().min(1, "Confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const registerSchema = z.object({
  username: z.string().trim().min(1, "Required"),
  firstName: z.string().trim().min(1, "Required"),
  lastName: z.string().trim().min(1, "Required"),
  email: z.string().trim().min(1, "Required"),
  password: z.string().min(8, "Minimum of 8 characters required"),
});
