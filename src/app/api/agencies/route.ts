import { getAgencyCatalog } from "@/lib/agencies";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = Number.parseInt(searchParams.get("offset") ?? "0", 10);
  const search = searchParams.get("q") ?? "";

  try {
    const data = await getAgencyCatalog(Number.isFinite(offset) ? offset : 0, 12, search);
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return Response.json(
      { error: "De agentschappendatabase is tijdelijk niet bereikbaar." },
      { status: 503 },
    );
  }
}
