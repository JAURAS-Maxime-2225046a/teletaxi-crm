import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().min(1, "Email requis").email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const SignupSchema = z
  .object({
    email: z.string().min(1, "Email requis").email("Email invalide"),
    password: z
      .string()
      .min(8, "Au moins 8 caractères")
      .regex(/[a-z]/, "Doit contenir une minuscule")
      .regex(/[A-Z]/, "Doit contenir une majuscule")
      .regex(/\d/, "Doit contenir un chiffre"),
    confirmPassword: z.string().min(1, "Confirmation requise"),
    displayName: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });
export type SignupInput = z.infer<typeof SignupSchema>;

export const DatabasePathSchema = z.object({
  accdb_path: z
    .string()
    .min(1, "Chemin requis")
    .endsWith(".accdb", "Le fichier doit être un .accdb"),
});
export type DatabasePathInput = z.infer<typeof DatabasePathSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z
      .string()
      .min(8, "Au moins 8 caractères")
      .regex(/[a-z]/, "Minuscule requise")
      .regex(/[A-Z]/, "Majuscule requise")
      .regex(/\d/, "Chiffre requis"),
    confirmNewPassword: z.string().min(1, "Confirmation requise"),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmNewPassword"],
  });
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
