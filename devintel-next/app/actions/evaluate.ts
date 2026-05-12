"use server";

import { FetchResponse, Repository } from "@/types/api";

export const analyzeRepo = async (repo_url: string): Promise<FetchResponse<Repository>> => {
    try {
        const jsonData = JSON.stringify({ repo_url });

        const response = await fetch("http://devintel-api:8000/api/analyze/", {
            method: "POST",
            body: jsonData,
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();

            return { success: false, error: { message: "API request failed.", raw: errorData } };
        }

        const responseData = await response.json();

        return { success: true, data: responseData };
    } catch (error) {
        console.error("Unexpected Error:", error);
        return { success: false, error: { message: "An unexpected error occurred.", raw: error } };
    }
}