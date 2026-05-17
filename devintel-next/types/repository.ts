import { z } from "zod";

// ---------------------------------------------------------------------------
// Child record schemas
// ---------------------------------------------------------------------------

export const RadarMetricSchema = z.object({
  subject: z.string(),
  score: z.number(),
  max: z.number(),
});

export const ArchitecturalRecommendationSchema = z.object({
  rank: z.number(),
  recommendation: z.string(),
});

export const RefactorSuggestionSchema = z.object({
  // Identity
  suggestion_id: z.string().nullable(),
  title: z.string().nullable(),

  // Source location
  file_path: z.string().nullable(),
  start_line: z.number().nullable(),
  end_line: z.number().nullable(),
  commit_hash: z.string().nullable(),
  symbol: z.string().nullable(),

  // Analysis
  rule: z.string().nullable(),
  detected_by: z.string().nullable(),
  severity: z.string().nullable(),
  confidence: z.number().nullable(),

  // Content
  reasoning: z.string().nullable(),
  before_code: z.string().nullable(),
  after_code: z.string().nullable(),

  // LLM metadata
  llm_provider: z.string().nullable(),
  llm_model: z.string().nullable(),
  prompt_version: z.string().nullable(),
});

export const QuickWinSchema = z.object({
  win_id: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  impact: z.string().nullable(),
  type: z.string().nullable(),
});

export const SecurityVulnerabilitySchema = z.object({
  vulnerability_id: z.string().nullable(),
  severity: z.string().nullable(),
  title: z.string().nullable(),
  location: z.string().nullable(),
  file_path: z.string().nullable(),
  line_number: z.number().nullable(),
  cve: z.string().nullable(),
  description: z.string().nullable(),
  remediation: z.string().nullable(),
});

export const RiskyEntitySchema = z.object({
  rank: z.number().nullable(),
  entity_id: z.string().nullable(),
  name: z.string().nullable(),
  file_path: z.string().nullable(),
  pain_score: z.number().nullable(),
});

export const FileHealthEntrySchema = z.object({
  path: z.string().nullable(),
  health_score: z.number().nullable(),
  file_count: z.number().nullable(),
  status: z.string().nullable(),
});

export const AnalysisDependencySchema = z.object({
  name: z.string(),
  ecosystem: z.string().nullable(),
  current_version: z.string().nullable(),
  latest_version: z.string().nullable(),
  is_outdated: z.boolean(),
  is_unused: z.boolean(),
});

// ---------------------------------------------------------------------------
// Scalar groups — composed into AnalysisRun schemas
// ---------------------------------------------------------------------------

export const AnalysisRunMetadataSchema = z.object({
  "job_id": z.string(),
  "repo_url": z.string(),
  "commit_hash": z.string(),
  "commit_hash_source": z.string(),
  "channel": z.string(),
  "started_at": z.string(),
  "updated_at": z.string(),
  "expires_at": z.string(),
  "ttl_seconds": z.number(),
  "status": z.string(),
  "with_llm": z.boolean(),
  "llm_mode": z.string(),
  "terminal_published": z.boolean(),
  "completed_at": z.string(),
  "duration_ms": z.number()
});

const AnalysisRunBaseSchema = z.object({
  id: z.string(),
  job_id: z.string(),
  scanned_at: z.string().nullable(),
  created_at: z.string(),
});

const RepoInfoSchema = z.object({
  commit_hash: z.string().nullable(),
  branch: z.string().nullable(),
  repo_name: z.string().nullable(),
  languages: z.array(z.string()).nullable(),
  frameworks: z.array(z.string()).nullable(),
  file_count: z.number().nullable(),
  detected_pattern: z.string().nullable(),
});

const LLMScalarsSchema = z.object({
  overall_score: z.number().nullable(),
  technical_debt_score: z.number().nullable(),
  overall_verdict: z.string().nullable(),
  confidence: z.number().nullable(),
  growth_pts: z.number().nullable(),
  ai_reasoning: z.string().nullable(),
  duration_ms: z.number().nullable(),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  with_llm: z.boolean().nullable(),
  metadata_snapshot: AnalysisRunMetadataSchema.nullable(),
});

const SecurityCountsSchema = z.object({
  security_critical_count: z.number().nullable(),
  security_high_count: z.number().nullable(),
  security_medium_count: z.number().nullable(),
  security_low_count: z.number().nullable(),
});

const FindingSummarySchema = z.object({
  total_findings: z.number().nullable(),
  total_smells: z.number().nullable(),
});

// ---------------------------------------------------------------------------
// Composed analysis run schemas
// ---------------------------------------------------------------------------

export const AnalysisRunSummarySchema = AnalysisRunBaseSchema.merge(
  RepoInfoSchema,
)
  .merge(LLMScalarsSchema)
  .merge(SecurityCountsSchema)
  .merge(FindingSummarySchema);

export const PartialAnalysisRunSummarySchema =
  AnalysisRunSummarySchema.partial().required({
    id: true,
    job_id: true,
    commit_hash: true,
    branch: true,
    repo_name: true,
    overall_score: true,
    technical_debt_score: true,
    overall_verdict: true,
    total_findings: true,
    total_smells: true,
    security_critical_count: true,
    security_high_count: true,
    security_medium_count: true,
    security_low_count: true,
    scanned_at: true,
    created_at: true,
    duration_ms: true,
    started_at: true,
    completed_at: true,
    with_llm: true,
  });

export const AnalysisRunDetailSchema = AnalysisRunSummarySchema.merge(
  z.object({
    radar_metrics: z.array(RadarMetricSchema),
    architectural_recommendations: z.array(ArchitecturalRecommendationSchema),
    refactor_suggestions: z.array(RefactorSuggestionSchema),
    quick_wins: z.array(QuickWinSchema),
    security_vulnerabilities: z.array(SecurityVulnerabilitySchema),
    risky_entities: z.array(RiskyEntitySchema),
    file_health_entries: z.array(FileHealthEntrySchema),
    dependencies: z.array(AnalysisDependencySchema),
  }),
);

export const AnalysisStatusResponseSchema = z.object({
  repository_id: z.string(),
  commit_hash: z.string(),
  recent_analysis_run: PartialAnalysisRunSummarySchema.nullable(),
  analysis_run_count: z.number(),
  has_pending_result: z.boolean(),
  analysis_status: z.enum(["progress", "completed"]).nullable(),
});

export const RepositoryDetailsSchema = z.object({
  id: z.string(),
  repo_url: z.string(),
  provider: z.string().nullable(),
  owner_name: z.string().nullable(),
  repo_name: z.string().nullable(),
});

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type RadarMetric = z.infer<typeof RadarMetricSchema>;
export type ArchitecturalRecommendation = z.infer<
  typeof ArchitecturalRecommendationSchema
>;
export type RefactorSuggestion = z.infer<typeof RefactorSuggestionSchema>;
export type QuickWin = z.infer<typeof QuickWinSchema>;
export type SecurityVulnerability = z.infer<typeof SecurityVulnerabilitySchema>;
export type RiskyEntity = z.infer<typeof RiskyEntitySchema>;
export type FileHealthEntry = z.infer<typeof FileHealthEntrySchema>;
export type PartialAnalysisRunSummary = z.infer<typeof PartialAnalysisRunSummarySchema>;
export type AnalysisDependency = z.infer<typeof AnalysisDependencySchema>;
export type AnalysisRunSummary = z.infer<typeof AnalysisRunSummarySchema>;
export type AnalysisRunDetail = z.infer<typeof AnalysisRunDetailSchema>;
export type AnalysisStatusResponse = z.infer<
  typeof AnalysisStatusResponseSchema
>;
export type RepositoryDetails = z.infer<typeof RepositoryDetailsSchema>;