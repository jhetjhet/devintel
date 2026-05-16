import {
  AnalysisStatusResponse,
  AnalysisStatusResponseSchema,
} from "@/types/repository";
import { typedFetch } from "./utils";

export async function fetchAnalysisStatus(
  id: string,
): Promise<AnalysisStatusResponse> {
  const data = await typedFetch<AnalysisStatusResponse>(
    `${process.env.API_ENDPOINT}/api/analysis/${id}/status/`,
  );

  const dataRes = AnalysisStatusResponseSchema.safeParse(data);

  if (!dataRes.success) {
    console.error("Invalid analysis status response:", dataRes.error);
    throw new Error("Invalid analysis status response");
  }

  return dataRes.data;
}
