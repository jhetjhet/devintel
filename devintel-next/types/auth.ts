import { z } from "zod";

export const RegisterPayloadSchema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const UserSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  email: z.string().email(),
  avatar_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  last_login_at: z.string().nullable(),
});

export const TokenPairSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
  access_token_expires_at: z.string(),
  refresh_token_expires_at: z.string(),
});

export const AccessTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  access_token_expires_at: z.string(),
});

export type RegisterPayload = z.infer<typeof RegisterPayloadSchema>;
export type LoginPayload = z.infer<typeof LoginPayloadSchema>;
export type AuthUser = z.infer<typeof UserSchema>;
export type TokenPair = z.infer<typeof TokenPairSchema>;
export type AccessToken = z.infer<typeof AccessTokenSchema>;
