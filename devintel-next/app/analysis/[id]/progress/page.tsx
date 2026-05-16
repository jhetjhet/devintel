import { Analysis } from "@/components/Analysis";
import { fetchAnalysisStatus } from "@/lib/api.server";
import { redirect } from "next/navigation";

type AnalysisPageProps = {
  params: {
    id: string;
  };
};

export default async function AnalysisProgressPage({
  params,
}: AnalysisPageProps) {
  const { id } = await params;

  const analysisStatus = await fetchAnalysisStatus(id);

  if (!analysisStatus.analysis_status || analysisStatus.analysis_status === "completed" || analysisStatus.has_pending_result) {
    redirect(`/analysis/${id}`);
  }

  return <Analysis repositoryId={id} />;
}
