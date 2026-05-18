"use server";

import authFetch from "@/lib/auth-fetch";
import {
  AnalaysisCompleteResponseSchema,
  AnalysisCompleteResponse,
  FetchResponse,
  Repository,
} from "@/types/api";

export const analyzeRepo = async (
  repo_url: string,
): Promise<FetchResponse<Repository>> => {
  try {
    const jsonData = JSON.stringify({ repo_url });

    const response = await authFetch(
      `${process.env.API_ENDPOINT}/api/analysis/`,
      {
        method: "POST",
        body: jsonData,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      let errorData;

      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { detail: errorText };
      }

      if (errorData && errorData.detail) {
        return {
          success: false,
          error: { message: errorData?.detail, raw: errorData },
          status: response.status,
        };
      }

      return {
        success: false,
        error: {
          message:
            errorText ||
            "An error occurred, and the error response could not be parsed.",
          raw: errorText,
        },
        status: response.status,
      };
    }

    const responseData = await response.json();

    return { success: true, data: responseData, status: response.status };
  } catch (error) {
    console.error("Unexpected Error:", error);
    return {
      success: false,
      error: { message: "An unexpected error occurred.", raw: error },
      status: 500,
    };
  }
};

export const finalizeAnalysis = async (
  repositoryId: string,
): Promise<FetchResponse<AnalysisCompleteResponse>> => {
  try {
    const response = await authFetch(
      `${process.env.API_ENDPOINT}/api/analysis/complete/${repositoryId}`,
      {
        method: "POST",
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: { message: errorData?.detail, raw: errorData },
        status: response.status,
      };
    }

    const dataRes = AnalaysisCompleteResponseSchema.safeParse(
      await response.json(),
    );

    if (!dataRes.success) {
      return {
        success: false,
        error: { message: "Invalid response format", raw: dataRes.error },
        status: response.status,
      };
    }

    return { success: true, data: dataRes.data, status: response.status };
  } catch (error) {
    console.error("Unexpected Error:", error);
    return {
      success: false,
      error: { message: "An unexpected error occurred.", raw: error },
      status: 500,
    };
  }
};

export const startAudit = async (
  repository_id: string,
  force: boolean = false,
): Promise<
  FetchResponse<Omit<AnalysisCompleteResponse, "analysis_run_id">>
> => {
  try {
    const jsonData = JSON.stringify({ repository_id, force });

    const response = await authFetch(`${process.env.API_ENDPOINT}/api/audit/`, {
      method: "POST",
      body: jsonData,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: { message: errorData?.detail, raw: errorData },
        status: response.status,
      };
    }

    const dataRes = AnalaysisCompleteResponseSchema.omit({
      analysis_run_id: true,
    }).safeParse(await response.json());

    if (!dataRes.success) {
      return {
        success: false,
        error: { message: "Invalid response format", raw: dataRes.error },
        status: response.status,
      };
    }

    return { success: true, data: dataRes.data, status: response.status };
  } catch (error) {
    console.error("Unexpected Error:", error);
    return {
      success: false,
      error: { message: "An unexpected error occurred.", raw: error },
      status: 500,
    };
  }
};
