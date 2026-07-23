export type SpaceAgency = {
  id: number;
  name: string;
  abbreviation: string;
  type: string;
  country: string;
  description: string;
  administrator: string;
  foundingYear: string;
  launchers: string[];
  spacecraft: string[];
  featured: boolean;
  image: string | null;
  logo: string | null;
  infoUrl: string | null;
  wikiUrl: string | null;
  parent: string | null;
  totalLaunches: number;
  successfulLaunches: number;
  failedLaunches: number;
  pendingLaunches: number;
};

type ApiAgency = {
  id: number;
  name?: string;
  abbrev?: string;
  type?: string;
  country_code?: string;
  description?: string;
  administrator?: string;
  founding_year?: string | number;
  launchers?: string;
  spacecraft?: string;
  featured?: boolean;
  image_url?: string | null;
  logo_url?: string | null;
  info_url?: string | null;
  wiki_url?: string | null;
  parent?: { name?: string } | null;
  total_launch_count?: number;
  successful_launches?: number;
  failed_launches?: number;
  pending_launches?: number;
};

function externalUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function splitAssets(value?: string) {
  if (!value) return [];
  return value
    .split("|")
    .map((item) => item.trim())
    .filter((item) => item && item.toLowerCase() !== "none");
}

function mapAgency(item: ApiAgency): SpaceAgency {
  return {
    id: item.id,
    name: item.name ?? "Naamloze organisatie",
    abbreviation: item.abbrev ?? "",
    type: item.type ?? "Onbekend",
    country: item.country_code ?? "—",
    description: item.description ?? "Voor dit agentschap is nog geen uitgebreide openbare beschrijving beschikbaar.",
    administrator: item.administrator ?? "Niet gepubliceerd",
    foundingYear: item.founding_year ? String(item.founding_year) : "—",
    launchers: splitAssets(item.launchers),
    spacecraft: splitAssets(item.spacecraft),
    featured: item.featured ?? false,
    image: externalUrl(item.image_url),
    logo: externalUrl(item.logo_url),
    infoUrl: externalUrl(item.info_url),
    wikiUrl: externalUrl(item.wiki_url),
    parent: item.parent?.name ?? null,
    totalLaunches: item.total_launch_count ?? 0,
    successfulLaunches: item.successful_launches ?? 0,
    failedLaunches: item.failed_launches ?? 0,
    pendingLaunches: item.pending_launches ?? 0,
  };
}

export async function getAgencyCatalog(offset = 0, limit = 48, search = "") {
  const safeOffset = Math.max(0, offset);
  const safeLimit = Math.min(Math.max(limit, 1), 60);
  const query = new URLSearchParams({
    limit: String(safeLimit),
    offset: String(safeOffset),
    ordering: "-total_launch_count",
    mode: "detailed",
  });
  const normalizedSearch = search.trim().slice(0, 80);
  if (normalizedSearch.length >= 2) query.set("search", normalizedSearch);

  const response = await fetch(`https://ll.thespacedevs.com/2.2.0/agencies/?${query}`, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(12_000),
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error(`Agency catalog returned ${response.status}`);
  const data = (await response.json()) as { count?: number; results?: ApiAgency[] };
  return {
    count: data.count ?? 0,
    agencies: (data.results ?? []).map(mapAgency),
  };
}
