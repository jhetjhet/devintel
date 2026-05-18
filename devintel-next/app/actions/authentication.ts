"use server";

import {
	FastApiErrorSchema,
	FetchResponse,
} from "@/types/api";
import getCookieConfig from "@/lib/cookie-config";
import { cookies } from "next/headers";
import { AccessToken, AccessTokenSchema, AuthUser, LoginPayload, LoginPayloadSchema, RegisterPayload, RegisterPayloadSchema, TokenPair, TokenPairSchema, UserSchema } from "@/types/auth";

function toMessage(detail: unknown): string {
	if (typeof detail === "string") {
		return detail;
	}
	return "request failed";
}

async function parseFastApiError(response: Response): Promise<{ message: string; raw?: unknown }> {
	try {
		const raw = await response.json();
		const parsed = FastApiErrorSchema.safeParse(raw);
		if (parsed.success) {
			return { message: toMessage(parsed.data.detail), raw };
		}
		return { message: "request failed", raw };
	} catch (error) {
		return { message: "request failed", raw: error };
	}
}

export async function register(payload: RegisterPayload): Promise<FetchResponse<AuthUser>> {
	const payloadValidation = RegisterPayloadSchema.safeParse(payload);
	if (!payloadValidation.success) {
		return {
			success: false,
			error: {
				message: "invalid register payload",
				raw: payloadValidation.error,
			},
			status: 400,
		};
	}

	try {
		const response = await fetch(`${process.env.API_ENDPOINT}/api/auth/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payloadValidation.data),
			cache: "no-store",
		});

		if (!response.ok) {
			const error = await parseFastApiError(response);
			return {
				success: false,
				error,
				status: response.status,
			};
		}

		const rawData = await response.json();
		const parsed = UserSchema.safeParse(rawData);

		if (!parsed.success) {
			return {
				success: false,
				error: {
					message: "invalid register response",
					raw: parsed.error,
				},
				status: 500,
			};
		}

		return {
			success: true,
			data: parsed.data,
			status: response.status,
		};
	} catch (error) {
		return {
			success: false,
			error: {
				message: "an unexpected error occurred",
				raw: error,
			},
			status: 500,
		};
	}
}

export async function login(payload: LoginPayload): Promise<FetchResponse<TokenPair>> {
	const payloadValidation = LoginPayloadSchema.safeParse(payload);

	if (!payloadValidation.success) {
		return {
			success: false,
			error: {
				message: "invalid login payload",
				raw: payloadValidation.error,
			},
			status: 400,
		};
	}

	try {
		const response = await fetch(`${process.env.API_ENDPOINT}/api/auth/token`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payloadValidation.data),
			cache: "no-store",
		});

		if (!response.ok) {
			const error = await parseFastApiError(response);
			return {
				success: false,
				error,
				status: response.status,
			};
		}

		const rawData = await response.json();
		const parsed = TokenPairSchema.safeParse(rawData);

		if (!parsed.success) {
			return {
				success: false,
				error: {
					message: "invalid login response",
					raw: parsed.error,
				},
				status: 500,
			};
		}

		const cookieStore = await cookies();

    	cookieStore.set("session", JSON.stringify(parsed.data), getCookieConfig());

		return {
			success: true,
			data: parsed.data,
			status: response.status,
		};
	} catch (error) {
		return {
			success: false,
			error: {
				message: "an unexpected error occurred",
				raw: error,
			},
			status: 500,
		};
	}
}

export async function refreshAccessToken(
	refresh_token: string,
): Promise<FetchResponse<AccessToken>> {
	if (!refresh_token || !refresh_token.trim()) {
		return {
			success: false,
			error: {
				message: "invalid refresh token",
			},
			status: 400,
		};
	}

	try {
		const response = await fetch(`${process.env.API_ENDPOINT}/api/auth/refresh`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ refresh_token }),
			cache: "no-store",
		});

		if (!response.ok) {
			const error = await parseFastApiError(response);
			return {
				success: false,
				error,
				status: response.status,
			};
		}

		const rawData = await response.json();
		const parsed = AccessTokenSchema.safeParse(rawData);

		if (!parsed.success) {
			return {
				success: false,
				error: {
					message: "invalid refresh response",
					raw: parsed.error,
				},
				status: 500,
			};
		}

		return {
			success: true,
			data: parsed.data,
			status: response.status,
		};
	} catch (error) {
		return {
			success: false,
			error: {
				message: "an unexpected error occurred",
				raw: error,
			},
			status: 500,
		};
	}
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete('session');
}