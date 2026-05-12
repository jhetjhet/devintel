import { time } from "console";
import { z } from "zod";

export const FastApiIssueSchema = z.object({
  type: z.string(),

  // ["body", "email"] or ["query", "page"]
  loc: z.array(z.union([z.string(), z.number()])),

  msg: z.string(),

  // varies heavily depending on error
  input: z.unknown().optional(),
});

export const FastApiErrorSchema = z.object({
  detail: z.union([
    z.string(),
    z.array(FastApiIssueSchema),
  ]),
});

export const RepositorySchema = z.object({
    id: z.string(),
    repo_url: z.string(),
});

export const AuditProgressSchema = z.object({
    timestamp: z.string(),
    level: z.string(),
    logger: z.string(),
    message: z.string(),
    is_terminal: z.boolean(),
    progress_percent: z.number().optional(),
    progress_stage: z.string().optional(),
});

export type AppFieldError = {
  field: Record<string, string[]>;
  messages: string[];
};

export type AppError = {
  message: string;
  fields?: AppFieldError[];
  raw?: unknown;
};


export type FetchResponse<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: AppError;
}

export type FastApiError = z.infer<typeof FastApiErrorSchema>;
export type Repository = z.infer<typeof RepositorySchema>;
export type AuditProgress = z.infer<typeof AuditProgressSchema>;