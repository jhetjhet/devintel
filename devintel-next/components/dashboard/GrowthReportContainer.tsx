import useSWR from "swr";
import { AuditHistory } from "./AuditHistory";
import { TrendsChart } from "./TrendsChart";
import { useState } from "react";
import { fetchReports } from "@/lib/api.client";

type GrowthReportContainerProps = {
  repositoryId: string;
};

export default function GrowthReportContainer({
  repositoryId,
}: GrowthReportContainerProps) {
  const [activeMetric, setActiveMetric] = useState<"debt" | "score">("score");

  const { data: reportHistory, isLoading: reportHistoryLoading } = useSWR(
    `repository-${repositoryId}-reports`,
    () => fetchReports(repositoryId),
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

  return (
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
  );
}
