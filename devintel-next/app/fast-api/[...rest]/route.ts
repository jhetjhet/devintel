import authFetch from "@/lib/auth-fetch";
import { NextRequest, NextResponse } from "next/server";


export async function GET(
  req: NextRequest,
  ctx: RouteContext<'/fast-api/[...rest]'>
): Promise<NextResponse<any>> {
  try {
    const { rest } = await ctx.params;

    const restPath = rest.join("/");
    
    const url = new URL(`${process.env.API_ENDPOINT}/api/${restPath}`);

    // copy all query params from incoming request
    req.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    const response = await authFetch(url.toString());

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error: unknown) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}