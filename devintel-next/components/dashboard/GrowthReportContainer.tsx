import {
  AnalysisRunSummary,
  AnalysisRunSummarySchema,
} from "@/types/repository";
import useSWR from "swr";
import { AuditHistory } from "./AuditHistory";
import { TrendsChart } from "./TrendsChart";
import { useState } from "react";

async function fetchReporsts(
  repositoryId: string,
): Promise<AnalysisRunSummary[]> {
  try {
    const response = await fetch(
      `/fast-api/repositories/${repositoryId}/reports/`,
    );

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

type GrowthReportContainerProps = {
  repositoryId: string;
};

export default function GrowthReportContainer({
  repositoryId,
}: GrowthReportContainerProps) {
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
