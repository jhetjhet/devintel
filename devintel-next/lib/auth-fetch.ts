"use server";

import { headers } from "next/headers";
import getSessionCookies from "./get-session-cookies";

export default async function authFetch(
  url: string,
  options: RequestInit = {},
) {
  const allHeaders = await headers();

  const tokenPair = await getSessionCookies();

  if (!tokenPair) {
    return new Response("Unauthorized", { status: 401 });
  }

  const respHeaders = new Headers(options.headers);
  const authToken =
    allHeaders.get("x-refreshed-token") || tokenPair.access_token;

  if (authToken) {
    respHeaders.set("Authorization", `Bearer ${authToken}`);
  }

  return await fetch(url, {
    ...options,
    headers: respHeaders,
  });
}