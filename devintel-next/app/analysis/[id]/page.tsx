import { startAudit } from '@/app/actions/evaluate';
import { AnalysisCompleted } from '@/components/AnalysisCompleted';
import { AnalysisInPending } from '@/components/AnalysisInPending';
import { fetchAnalysisStatus } from '@/lib/api.server';
import { redirect } from 'next/navigation';

type AnalysisPageProps = {
  params: {
    id: string;
  },
}

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const { id } = await params;

  const analysisStatus = await fetchAnalysisStatus(id);

  if (!analysisStatus.recent_analysis_run) {
    const response = await startAudit(id);

    if (!response.success) {
      if (response.status === 429) {
        throw new Error("Due to resource constraints, we are currently limiting the number of concurrent analyses. Please try again in a few minutes.");
      }
      else {
        throw new Error(response.error.message || "Failed to start analysis");
      }
    }

    redirect(`/analysis/${id}/progress`);
  }

  if (analysisStatus.analysis_status === "progress") {
    redirect(`/analysis/${id}/progress`);
  }

  if (analysisStatus.has_pending_result) {
    return <AnalysisInPending repositoryId={id} commitHash={analysisStatus.commit_hash} />;
  }

  if (analysisStatus.recent_analysis_run && !analysisStatus.has_pending_result) {
    return <AnalysisCompleted analysisStatus={analysisStatus} />;
  }
}
