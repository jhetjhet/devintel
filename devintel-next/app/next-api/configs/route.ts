
export async function GET() {
  return Response.json({
    api_endpoint: process.env.NEXT_PUBLIC_API_ENDPOINT,
  });
}