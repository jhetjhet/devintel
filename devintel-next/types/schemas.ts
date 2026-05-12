import { z } from "zod";

export const RepositorySummarySchema = z.object({
  name: z.string(),
  languages: z.array(z.string()),
  frameworks: z.array(z.string()),
  commit_hash: z.string(),
  branch: z.string(),
  file_count: z.number(),
  detected_pattern: z.string(),
});

export const AnalysisMetricsSchema = z.object({
  total_functions: z.number(),
  avg_function_length: z.number(),
  high_complexity_functions: z.number(),
  test_coverage_estimate: z.number(),
  todo_count: z.number(),
});

export const TopRiskyEntitySchema = z.object({
  rank: z.number(),
  entity_id: z.string(),
  name: z.string(),
  file: z.string(),
  pain_score: z.number(),
});

export const ClusterSchema = z.object({
  rank: z.number(),
  cluster_id: z.string(),
  anchor_file: z.string(),
  total_pain: z.number(),
  members: z.number(),
  is_hotspot: z.boolean(),
});

export const OutdatedPackageSchema = z.object({
  name: z.string(),
  current: z.string(),
  recommended: z.string(),
});

export const FileStructureHealthSchema = z.object({
  path: z.string(),
  health_score: z.number(),
  file_count: z.number(),
  status: z.enum(['excellent', 'good', 'warning', 'critical']),
});

export const SecurityVulnerabilitySchema = z.object({
  id: z.string(),
  title: z.string(),
  location: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  remediation: z.string(),
  cve: z.string().optional(),
});

export const DeterministicReportSchema = z.object({
  repository_summary: RepositorySummarySchema,
  analysis_metrics: AnalysisMetricsSchema,
  top_risky_entities: z.array(TopRiskyEntitySchema),
  cluster_summary: z.object({
    total_clusters: z.number(),
    hotspot_clusters: z.number(),
    total_clustered: z.number(),
    total_pain_in_clusters: z.number(),
    hotspot_files: z.array(z.string()),
    top_clusters: z.array(ClusterSchema),
  }),
  dependency_summary: z.object({
    coupling_score: z.number(),
    cycles_count: z.number(),
    cycle_files: z.array(z.string()),
    outdated_packages: z.array(OutdatedPackageSchema),
    unused_dependencies: z.array(z.string()),
  }),
  file_structure_health: z.array(FileStructureHealthSchema),
  security_audit: z.object({
    critical_count: z.number(),
    high_count: z.number(),
    medium_count: z.number(),
    low_count: z.number(),
    vulnerabilities: z.array(SecurityVulnerabilitySchema),
  }),
  quick_wins: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    impact: z.string(),
    type: z.string(),
  })),
});

export const LLMInsightsSchema = z.object({
  overall_score: z.number(),
  technical_debt_score: z.number(),
  growth_pts: z.number(),
  radar_metrics: z.array(z.object({
    subject: z.string(),
    score: z.number(),
    max: z.number(),
  })),
  overall_verdict: z.string(),
  confidence: z.number(),
  ai_reasoning: z.string(),
  architectural_recommendations: z.array(z.string()),
  refactor_suggestions: z.array(z.any()),
});

export const FullAuditReportSchema = z.object({
  job_id: z.string(),
  repo_url: z.string(),
  status: z.string(),
  timestamp: z.string(),
  deterministic_report: DeterministicReportSchema,
  llm_insights: LLMInsightsSchema,
});

export const TimelineHistoryItemSchema = z.object({
  commit_hash: z.string(),
  timestamp: z.string(),
  score: z.number(),
  technical_debt: z.number(),
});

export const TimelineHistorySchema = z.array(TimelineHistoryItemSchema);

export type FullAuditReport = z.infer<typeof FullAuditReportSchema>;
export type TimelineHistory = z.infer<typeof TimelineHistorySchema>;