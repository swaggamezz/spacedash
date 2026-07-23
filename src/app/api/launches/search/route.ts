import { searchHistoricalLaunches } from "@/lib/launches";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return Response.json({ launches: [], query });
  }

  try {
    const launches = await searchHistoricalLaunches(query);
    return Response.json(
      { launches, query },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch {
    return Response.json(
      { launches: [], query, error: "De historische launchdatabase is tijdelijk niet bereikbaar." },
      { status: 503 },
    );
  }
}
