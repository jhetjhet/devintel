"use server";

import { TokenPair, TokenPairSchema } from "@/types/auth";
import { cookies } from "next/headers";

export default async function getSessionCookies(): Promise<TokenPair | null> {
    const cookie = await cookies();

    const rawSession = cookie.get("session")?.value;

    if (!rawSession) {
        return null;
    }

    try {
        const sessionValue = JSON.parse(rawSession);

        const sessionRes = TokenPairSchema.safeParse(sessionValue);

        if (sessionRes.success) {
            return sessionRes.data;
        }
    } catch (error) {
        console.error("Failed to parse session cookie:", error);
        return null;
    }

    return null;
}