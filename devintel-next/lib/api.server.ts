import {
  AnalysisStatusResponse,
  AnalysisStatusResponseSchema,
  RepositoryDetails,
  RepositoryDetailsSchema,
} from "@/types/repository";
import authFetch from "./auth-fetch";
import { AuthUser, UserSchema } from "@/types/auth";

export async function fetchAnalysisStatus(
  id: string,
): Promise<AnalysisStatusResponse> {
  const response = await authFetch(
    `${process.env.API_ENDPOINT}/api/analysis/${id}/status/`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    const errorData = await response.text();

    throw new Error(`Failed to fetch analysis status: ${errorData}`);
  }

  const data = await response.json();

  const dataRes = AnalysisStatusResponseSchema.safeParse(data);

  if (!dataRes.success) {
    throw new Error("Invalid analysis status response");
  }

  return dataRes.data;
}

export async function fetchUserInfo(): Promise<AuthUser | null> {
  try {
    const response = await authFetch(`${process.env.API_ENDPOINT}/api/auth/me/`, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch user info:", await response.text());
      return null;
    }

    const data = await response.json();

    const useRes = UserSchema.safeParse(data);

    if (!useRes.success) {
      console.error("Invalid user info response:", useRes.error);
      return null;
    }

    return useRes.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}

export async function fetchRepoAnalysis(): Promise<RepositoryDetails[]> {
  try {
    const response = await authFetch(`${process.env.API_ENDPOINT}/api/repositories/`, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch repository analysis:", await response.text());
      return [];
    }

    const data = await response.json();

    const useRes = RepositoryDetailsSchema.array().safeParse(data);

    if (!useRes.success) {
      console.error("Invalid repository analysis response:", useRes.error);
      return [];
    }

    return useRes.data;
  } catch (error) {
    console.error("Error fetching repository analysis:", error);
    return [];
  }
}