import { NextResponse, type NextRequest } from "next/server";
import getSessionCookies from "./lib/get-session-cookies";
import getCookieConfig from "./lib/cookie-config";
import { refreshAccessToken } from "./app/actions/authentication";
import { TokenPair } from "./types/auth";

export async function proxy(request: NextRequest) {
  const tokenPair = await getSessionCookies();

  if (!tokenPair) {
    console.log("No valid session found. Proceeding without auth.");
    return NextResponse.next();
  }

  if (Date.now() > new Date(tokenPair.access_token_expires_at).getTime()) {
    const response = await refreshAccessToken(tokenPair.refresh_token);

    if (response.success) {
      const data =  response.data;

      const updatedSession: TokenPair = {
        ...tokenPair,
        access_token: data.access_token,
        access_token_expires_at: data.access_token_expires_at,
      };

      const nextResponse = NextResponse.next();
      nextResponse.cookies.set(
        "session",
        JSON.stringify(updatedSession),
        getCookieConfig(),
      );

      nextResponse.headers.set("x-refreshed-token", updatedSession.access_token);

      return nextResponse;
    } else {
      // Refresh token failed (expired or revoked)
      const nextResponse = NextResponse.next();
      nextResponse.cookies.delete("session");
      return nextResponse;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
