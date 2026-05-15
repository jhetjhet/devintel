import { Dashboard } from "@/components/Dashboard";
import { AnalysisRunDetail, AnalysisRunDetailSchema, RepositoryDetails, RepositoryDetailsSchema } from "@/types/repository";

type DashboardPageProps = {
  params: {
    repo_id: string;
    analysis_run_id: string;
  };
};

async function fetchRepoDetail(repositoryId: string): Promise<RepositoryDetails> {
  const response = await fetch(`http://devintel-api:8000/api/repositories/${repositoryId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch repository detail");
  }

  const dataRes = RepositoryDetailsSchema.safeParse(await response.json());

  if (!dataRes.success) {
    console.error("Invalid repository detail response:", dataRes.error);
    throw new Error("Invalid repository detail response");
  }

  return dataRes.data;
}

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

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { repo_id, analysis_run_id } = await params;

  const repoDetail = await fetchRepoDetail(repo_id);
  const reportData = await fetchReportData(repo_id, analysis_run_id || "latest");
console.log("Fetched repository detail:", repoDetail);
  return (
    <Dashboard 
      repositoryDetails={repoDetail}
      reportDetails={reportData} 
    />
  );
}
