"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "./dashboard/Header";
import { OverviewMetrics } from "./dashboard/OverviewMetrics";
import { QuickWins } from "./dashboard/QuickWins";
import { FileStructure } from "./dashboard/FileStructure";
import { SecurityAudit } from "./dashboard/SecurityAudit";
import { RefactorLab } from "./dashboard/RefactorLab";
import { AnalysisRunDetail } from "@/types/repository";

type DashboardProps = {
  analysisDetails: AnalysisRunDetail;
};

export function Dashboard({ analysisDetails }: DashboardProps) {
  const [selectedRefactor, setSelectedRefactor] = useState(0);

  const currentRefactor = analysisDetails.refactor_suggestions[selectedRefactor];
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

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          <OverviewMetrics
            overall_score={analysisDetails.overall_score}
            technical_debt_score={analysisDetails.technical_debt_score}
            confidence={analysisDetails.confidence}
            total_findings={analysisDetails.total_findings}
            radar_metrics={analysisDetails.radar_metrics}
          />

          <QuickWins quick_wins={analysisDetails.quick_wins} />
        </div>

        <Tabs defaultValue="structure" className="w-full">
          <TabsList className="bg-black/40 border-white/5 p-1 rounded-xl">
            <TabsTrigger value="structure" className="data-active:bg-primary data-active:text-white">
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
              disabled={analysisDetails.security_vulnerabilities.length === 0}
            >
              Security Audit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="structure" className="mt-6">
            <FileStructure
              file_health_entries={analysisDetails.file_health_entries}
              architectural_recommendations={analysisDetails.architectural_recommendations}
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
                security_critical_count={analysisDetails.security_critical_count}
                security_high_count={analysisDetails.security_high_count}
                security_medium_count={analysisDetails.security_medium_count}
                security_low_count={analysisDetails.security_low_count}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
