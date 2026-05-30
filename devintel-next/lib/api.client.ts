import { AnalysisRunSummary, AnalysisRunSummarySchema } from "@/types/repository";

export async function fetchReports(
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