"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "./dashboard/Header";
import { OverviewMetrics } from "./dashboard/OverviewMetrics";
import { QuickWins } from "./dashboard/QuickWins";
import { FileStructure } from "./dashboard/FileStructure";
import { SecurityAudit } from "./dashboard/SecurityAudit";
import { RefactorLab } from "./dashboard/RefactorLab";
import { AuditHistory } from "./dashboard/AuditHistory";
import { TrendsChart } from "./dashboard/TrendsChart";
import { RiskyEntitiesChart } from "./dashboard/RiskyEntitiesChart";
import { DependenciesHealth } from "./dashboard/DependenciesHealth";
import { LanguageFrameworkDistribution } from "./dashboard/LanguageFrameworkDistribution";
import {
  AnalysisRunDetail,
  AnalysisRunSummary,
  AnalysisRunSummarySchema,
  RepositoryDetails,
} from "@/types/repository";
import useSWR from "swr";
import { AuthUser } from "@/types/auth";

async function fetchReporsts(
  repositoryId: string,
): Promise<AnalysisRunSummary[]> {
  try {
    const response = await fetch(`/fast-api/repositories/${repositoryId}/reports/`);

    if (!response.ok) {
      console.error("Failed to fetch reports:", await response.text());
      return [];
    }

    const data = await response.json();

    const dataRes = AnalysisRunSummarySchema.array().safeParse(data);

    if (!dataRes.success) {
      console.error("Invalid reports data format:", dataRes.error);
      return [];
    }

    return dataRes.data;
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return [];
  }
}

type DashboardProps = {
  user: AuthUser | null;
  repositoryDetails: RepositoryDetails;
  reportDetails: AnalysisRunDetail;
};

export function Dashboard({ user, repositoryDetails, reportDetails }: DashboardProps) {
  const [selectedRefactor, setSelectedRefactor] = useState(0);
  const [activeMetric, setActiveMetric] = useState<"debt" | "score">("score");

  const repositoryId = repositoryDetails.id;

  const { data: reportHistory, isLoading: reportHistoryLoading } = useSWR(
    `repository-${repositoryId}-reports`,
    () => fetchReporsts(repositoryId),
  );

  const trendData = (reportHistory ?? [])
    .slice()
    .sort(
      (a, b) =>
        new Date(a.scanned_at ?? a.created_at).getTime() -
        new Date(b.scanned_at ?? b.created_at).getTime(),
    )
    .slice(-12)
    .map((run) => {
      const d = new Date(run.scanned_at ?? run.created_at);
      return {
        day: `${d.getMonth() + 1}/${d.getDate()}`,
        debt: run.technical_debt_score ?? 0,
        score: run.overall_score ?? 0,
      };
    });

  const currentRefactor =
    reportDetails.refactor_suggestions[selectedRefactor];
  const refactorDiff = currentRefactor
    ? {
        header: currentRefactor.title ?? "Refactor Suggestion",
        reasoning: currentRefactor.reasoning ?? "",
        before: currentRefactor.before_code ?? "",
        after: currentRefactor.after_code ?? "",
      }
    : null;

  return (
    <div className="min-h-screen bg-surface p-6 pt-20 md:p-12 md:pt-20">
      <div className="max-w-7xl mx-auto">
        <Header
          repositoryDetails={repositoryDetails}
          reportDetails={reportDetails}
        />

        <Tabs defaultValue="structure" className="w-full">
          <TabsList className="bg-black/40 border-white/5 p-1 rounded-xl">
            <TabsTrigger
              value="structured_report"
              className="data-active:bg-primary data-active:text-white"
            >
              Structured Report
            </TabsTrigger>
            <TabsTrigger
              value="growth_report"
              className="data-active:bg-primary data-active:text-white"
            >
              Growth Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="structured_report" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              <OverviewMetrics
                overall_score={reportDetails.overall_score}
                technical_debt_score={reportDetails.technical_debt_score}
                confidence={reportDetails.confidence}
                total_findings={reportDetails.total_findings}
                radar_metrics={reportDetails.radar_metrics}
              />
            </div>

            {/* Score & Debt over time */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              <QuickWins quick_wins={reportDetails.quick_wins} />
              <LanguageFrameworkDistribution
                languages={reportDetails.languages}
                frameworks={reportDetails.frameworks}
              />
            </div>

            {/* Risky entities + Dependencies */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              <RiskyEntitiesChart entities={reportDetails.risky_entities} />
              <DependenciesHealth dependencies={reportDetails.dependencies} />
            </div>

            <Tabs defaultValue="structure" className="w-full">
              <TabsList className="bg-black/40 border-white/5 p-1 rounded-xl">
                <TabsTrigger
                  value="structure"
                  className="data-active:bg-primary data-active:text-white"
                >
                  File Structure
                </TabsTrigger>
                <TabsTrigger
                  value="refactor"
                  className="data-active:bg-primary data-active:text-white"
                  disabled={reportDetails.refactor_suggestions.length === 0}
                >
                  AI Refactor Lab
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="data-active:bg-primary data-active:text-white"
                  disabled={
                    reportDetails.security_vulnerabilities.length === 0
                  }
                >
                  Security Audit
                </TabsTrigger>
              </TabsList>

              <TabsContent value="structure" className="mt-6">
                <FileStructure
                  file_health_entries={reportDetails.file_health_entries}
                  architectural_recommendations={
                    reportDetails.architectural_recommendations
                  }
                />
              </TabsContent>

              <TabsContent value="refactor" className="mt-6">
                {reportDetails.refactor_suggestions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {reportDetails.refactor_suggestions.map((sugg, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedRefactor(idx)}
                          className={`px-3 py-2 rounded text-sm whitespace-nowrap transition-colors ${
                            selectedRefactor === idx
                              ? "bg-primary text-white"
                              : "bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          {sugg.title ?? `Suggestion ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                    {refactorDiff && <RefactorLab diff={refactorDiff} />}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="security" className="mt-6">
                {reportDetails.security_vulnerabilities.length > 0 && (
                  <SecurityAudit
                    vulnerabilities={reportDetails.security_vulnerabilities}
                    security_critical_count={
                      reportDetails.security_critical_count
                    }
                    security_high_count={reportDetails.security_high_count}
                    security_medium_count={
                      reportDetails.security_medium_count
                    }
                    security_low_count={reportDetails.security_low_count}
                  />
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="growth_report" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              <AuditHistory
                runs={reportHistory ?? []}
                isLoading={reportHistoryLoading}
              />
              
              <TrendsChart
                trendData={trendData}
                activeMetric={activeMetric}
                setActiveMetric={setActiveMetric}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
