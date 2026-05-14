import { Analysis } from '@/components/Analysis';
import { AnalysisCompleted } from '@/components/AnalysisCompleted';
import { AnalysisInPending } from '@/components/AnalysisInPending';
import { AnalysisStatusResponse, AnalysisStatusResponseSchema } from '@/types/repository';

type AnalysisPageProps = {
  params: {
    id: string;
  },
  searchParams: {
    force?: string;
  };
}

async function fetchAnalysisStatus(id: string): Promise<AnalysisStatusResponse> {
  const response = await fetch(`http://devintel-api:8000/api/analysis/${id}/status/`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch analysis status");
  }

  const dataRes = AnalysisStatusResponseSchema.safeParse(await response.json());
  
  if (!dataRes.success) {
    console.error("Invalid analysis status response:", dataRes.error);
    throw new Error("Invalid analysis status response");
  }

  return dataRes.data;
}

export default async function AnalysisPage({ params, searchParams }: AnalysisPageProps) {
  const { id } = await params;
  const { force } = await searchParams;

  const isForceRefresh = force === "true";

  const analysisStatus = await fetchAnalysisStatus(id);

  console.log("Analysis status:", isForceRefresh, analysisStatus);

  if (analysisStatus.has_pending_result && !isForceRefresh) {
    return <AnalysisInPending repositoryId={id} commitHash={analysisStatus.commit_hash} />;
  }

  if (analysisStatus.recent_analysis_run && !isForceRefresh) {
    return <AnalysisCompleted repositoryId={id} commitHash={analysisStatus.commit_hash} analysisRunId={analysisStatus.recent_analysis_run.id} />;
  }

  return <Analysis repositoryId={id} force={isForceRefresh} />;
}
