"use server";

import { AnalaysisCompleteResponseSchema, AnalysisCompleteResponse, FetchResponse, Repository } from "@/types/api";

export const analyzeRepo = async (repo_url: string): Promise<FetchResponse<Repository>> => {
    try {
        const jsonData = JSON.stringify({ repo_url });

        const response = await fetch("http://devintel-api:8000/api/analysis/", {
            method: "POST",
            body: jsonData,
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();

            return { success: false, error: { message: errorData?.detail, raw: errorData } };
        }

        const responseData = await response.json();

        return { success: true, data: responseData };
    } catch (error) {
        console.error("Unexpected Error:", error);
        return { success: false, error: { message: "An unexpected error occurred.", raw: error } };
    }
}

export const finalizeAnalysis = async (repositoryId: string): Promise<FetchResponse<AnalysisCompleteResponse>> => {
    try {
        const response = await fetch(`http://devintel-api:8000/api/analysis/complete/${repositoryId}`, {
            method: "POST",
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, error: { message: errorData?.detail, raw: errorData } };
        }

        const dataRes = AnalaysisCompleteResponseSchema.safeParse(await response.json());

        if (!dataRes.success) {
            return { success: false, error: { message: "Invalid response format", raw: dataRes.error } };
        }

        return { success: true, data: dataRes.data };
    } catch (error) {
        console.error("Unexpected Error:", error);
        return { success: false, error: { message: "An unexpected error occurred.", raw: error } };
    }
}