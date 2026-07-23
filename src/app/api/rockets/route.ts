import { getRocketCatalog } from "@/lib/launch-vehicles";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const offset = Number(url.searchParams.get("offset") ?? 0);

  try {
    const catalog = await getRocketCatalog(Number.isFinite(offset) ? offset : 0);
    return Response.json(catalog, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return Response.json(
      { count: 0, rockets: [], error: "De raketcatalogus is tijdelijk niet bereikbaar." },
      { status: 503 },
    );
  }
}
