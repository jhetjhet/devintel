import { Dashboard } from "@/components/Dashboard";
import { AnalysisRunDetail, AnalysisRunDetailSchema } from "@/types/repository";

type DashboardPageProps = {
  params: {
    id: string;
  };
  searchParams: {
    commit_hash?: string;
  };
};

async function fetchReportData(repositoryId: string, commitHash: string): Promise<AnalysisRunDetail> {
  const response = await fetch(`http://devintel-api:8000/api/repositories/${repositoryId}/reports/${commitHash}`);

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
  const { commit_hash } = await searchParams;


  const reportData = await fetchReportData(id, commit_hash || "latest");
  

  // const response = await fetch(
  //   `http://devintel-api:8000/api/analyze/complete/${id}`,
  //   {
  //     method: "POST",
  //   },
  // );

  // if (!response.ok) {
  //   console.error("Failed to complete analysis:", response.statusText);
  //   return <div>Error loading dashboard</div>;
  // }

  // const data = await response.json();
  // console.log("Analysis completed successfully:", data);

  return (
    <Dashboard analysisDetails={reportData} />
  );
}
