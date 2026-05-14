import { Dashboard } from "@/components/Dashboard";
import { AnalysisRunDetail, AnalysisRunDetailSchema } from "@/types/repository";

type DashboardPageProps = {
  params: {
    id: string;
  };
  searchParams: {
    analysis_run_id?: string;
  };
};

async function fetchReportData(repositoryId: string, analysisRunId: string): Promise<AnalysisRunDetail> {
  const response = await fetch(`http://devintel-api:8000/api/repositories/${repositoryId}/reports/${analysisRunId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch report data");
  }

  const dataRes = AnalysisRunDetailSchema.safeParse(await response.json());

  if (!dataRes.success) {
    console.error("Invalid report data response:", dataRes.error);
    throw new Error("Invalid report data response");
  }

  return dataRes.data;
}

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const { id } = await params;
  const { analysis_run_id } = await searchParams;

  const reportData = await fetchReportData(id, analysis_run_id || "latest");

  return (
    <Dashboard 
      analysisDetails={reportData} 
      repositoryId={id}
    />
  );
}
