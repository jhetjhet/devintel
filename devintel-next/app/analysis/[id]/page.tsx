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
    await startAudit(id);
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
