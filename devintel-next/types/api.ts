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

const AnalysisRunSummarySchema = z.object({
  id: z.string(),
  job_id: z.string(),
  commit_hash: z.string().nullable(),
  branch: z.string().nullable(),
  repo_name: z.string().nullable(),
  overall_score: z.number().nullable(),
  technical_debt_score: z.number().nullable(),
  overall_verdict: z.string().nullable(),
  confidence: z.number().nullable(),
  total_findings: z.number().nullable(),
  total_smells: z.number().nullable(),
  security_critical_count: z.number().nullable(),
  security_high_count: z.number().nullable(),
  security_medium_count: z.number().nullable(),
  security_low_count: z.number().nullable(),
  scanned_at: z.string().nullable(),
  created_at: z.string(),
});

export const AnalysisStatusResponseSchema = z.object({
  repository_id: z.string(),
  commit_hash: z.string(),
  recent_analysis_run: AnalysisRunSummarySchema.nullable(),
  analysis_run_count: z.number(),
  has_pending_result: z.boolean(),
  analysis_status: z.string().nullable(),
});

export const AnalaysisCompleteResponseSchema = z.object({
  repository_id: z.string(),
  analysis_run_id: z.string(),
  commit_hash: z.string(),
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
export type AnalysisStatusResponse = z.infer<typeof AnalysisStatusResponseSchema>;
export type AnalysisRunSummary = z.infer<typeof AnalysisRunSummarySchema>;
export type AnalysisCompleteResponse = z.infer<typeof AnalaysisCompleteResponseSchema>;