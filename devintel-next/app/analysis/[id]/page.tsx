import { Analysis } from '@/components/Analysis';
import { AnalysisInProgress } from '@/components/AnalysisInProgress';
import { AnalysisCompleted } from '@/components/AnalysisCompleted';
import { AnalysisStatusResponse, AnalysisStatusResponseSchema } from '@/types/api';

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

  if (analysisStatus.status === "with_result" && !isForceRefresh) {
    return <AnalysisInProgress repositoryId={id} commitHash={analysisStatus.commit_hash} />;
  }

  if (analysisStatus.status === "completed") {
    return <AnalysisCompleted repositoryId={id} commitHash={analysisStatus.commit_hash} />;
  }

  return <Analysis repositoryId={id} />;
}
