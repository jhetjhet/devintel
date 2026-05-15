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
import { SecurityEvolution } from "./dashboard/SecurityEvolution";
import { FindingsSmellsTrend } from "./dashboard/FindingsSmellsTrend";
import {
  AnalysisRunDetail,
  AnalysisRunSummary,
  AnalysisRunSummarySchema,
} from "@/types/repository";
import useSWR from "swr";

async function fetchReporsts(
  repositoryId: string,
): Promise<AnalysisRunSummary[]> {
  try {
    const response = await fetch(
      `http://localhost:8000/api/repositories/${repositoryId}/reports/`,
    );

    if (!response.ok) {
      console.error("Failed to fetch reports:", await response.text());
      return [];
    }

    const data = await response.json();

    console.log("Raw reports data:", data);

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
  repositoryId: string;
  analysisDetails: AnalysisRunDetail;
};

export function Dashboard({ repositoryId, analysisDetails }: DashboardProps) {
  const [selectedRefactor, setSelectedRefactor] = useState(0);
  // const [activeReportTab, setActiveReportTab] = useState<"structured_report" | "growth_report">("structured_report");
  const [activeMetric, setActiveMetric] = useState<"debt" | "score">("score");

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
    analysisDetails.refactor_suggestions[selectedRefactor];
  const refactorDiff = currentRefactor
    ? {
        header: currentRefactor.title ?? "Refactor Suggestion",
        reasoning: currentRefactor.reasoning ?? "",
        before: currentRefactor.before_code ?? "",
        after: currentRefactor.after_code ?? "",
      }
    : null;

  return (
    <div className="min-h-screen bg-surface p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <Header
          repo_name={analysisDetails.repo_name}
          commit_hash={analysisDetails.commit_hash}
          branch={analysisDetails.branch}
          overall_score={analysisDetails.overall_score}
          overall_verdict={analysisDetails.overall_verdict}
          scanned_at={analysisDetails.scanned_at}
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
                overall_score={analysisDetails.overall_score}
                technical_debt_score={analysisDetails.technical_debt_score}
                confidence={analysisDetails.confidence}
                total_findings={analysisDetails.total_findings}
                radar_metrics={analysisDetails.radar_metrics}
              />
            </div>

            {/* Score & Debt over time */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              <QuickWins quick_wins={analysisDetails.quick_wins} />
              <LanguageFrameworkDistribution
                languages={analysisDetails.languages}
                frameworks={analysisDetails.frameworks}
              />
            </div>

            {/* Risky entities + Dependencies */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              <RiskyEntitiesChart entities={analysisDetails.risky_entities} />
              <DependenciesHealth dependencies={analysisDetails.dependencies} />
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
                  disabled={analysisDetails.refactor_suggestions.length === 0}
                >
                  AI Refactor Lab
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="data-active:bg-primary data-active:text-white"
                  disabled={
                    analysisDetails.security_vulnerabilities.length === 0
                  }
                >
                  Security Audit
                </TabsTrigger>
              </TabsList>

              <TabsContent value="structure" className="mt-6">
                <FileStructure
                  file_health_entries={analysisDetails.file_health_entries}
                  architectural_recommendations={
                    analysisDetails.architectural_recommendations
                  }
                />
              </TabsContent>

              <TabsContent value="refactor" className="mt-6">
                {analysisDetails.refactor_suggestions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {analysisDetails.refactor_suggestions.map((sugg, idx) => (
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
                {analysisDetails.security_vulnerabilities.length > 0 && (
                  <SecurityAudit
                    vulnerabilities={analysisDetails.security_vulnerabilities}
                    security_critical_count={
                      analysisDetails.security_critical_count
                    }
                    security_high_count={analysisDetails.security_high_count}
                    security_medium_count={
                      analysisDetails.security_medium_count
                    }
                    security_low_count={analysisDetails.security_low_count}
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
