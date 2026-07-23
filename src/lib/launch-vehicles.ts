export type CatalogRocket = {
  id: number;
  name: string;
  family: string;
  variant: string;
  manufacturer: string;
  country: string;
  description: string;
  active: boolean | null;
  reusable: boolean;
  image: string | null;
  infoUrl: string | null;
  wikiUrl: string | null;
  maidenFlight: string | null;
  length: number | null;
  diameter: number | null;
  launchMass: number | null;
  leoCapacity: number | null;
  gtoCapacity: number | null;
  thrust: number | null;
  launchCost: number | null;
  totalLaunches: number;
  successfulLaunches: number;
  failedLaunches: number;
  pendingLaunches: number;
};

type ApiRocket = {
  id: number;
  name?: string;
  full_name?: string;
  family?: string;
  variant?: string;
  description?: string;
  active?: boolean;
  reusable?: boolean;
  image_url?: string | null;
  info_url?: string | null;
  wiki_url?: string | null;
  maiden_flight?: string | null;
  length?: number | null;
  diameter?: number | null;
  launch_mass?: number | null;
  leo_capacity?: number | null;
  gto_capacity?: number | null;
  to_thrust?: number | null;
  launch_cost?: number | null;
  total_launch_count?: number;
  successful_launches?: number;
  failed_launches?: number;
  pending_launches?: number;
  manufacturer?: { name?: string; country_code?: string };
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

function mapRocket(item: ApiRocket): CatalogRocket {
  return {
    id: item.id,
    name: item.full_name ?? item.name ?? "Naamloze raket",
    family: item.family ?? "Onbekende familie",
    variant: item.variant ?? "",
    manufacturer: item.manufacturer?.name ?? "Onbekende fabrikant",
    country: item.manufacturer?.country_code ?? "—",
    description: item.description ?? "Voor deze configuratie is nog geen uitgebreide beschrijving gepubliceerd.",
    active: item.active ?? null,
    reusable: item.reusable ?? false,
    image: externalUrl(item.image_url),
    infoUrl: externalUrl(item.info_url),
    wikiUrl: externalUrl(item.wiki_url),
    maidenFlight: item.maiden_flight ?? null,
    length: item.length ?? null,
    diameter: item.diameter ?? null,
    launchMass: item.launch_mass ?? null,
    leoCapacity: item.leo_capacity ?? null,
    gtoCapacity: item.gto_capacity ?? null,
    thrust: item.to_thrust ?? null,
    launchCost: item.launch_cost ?? null,
    totalLaunches: item.total_launch_count ?? 0,
    successfulLaunches: item.successful_launches ?? 0,
    failedLaunches: item.failed_launches ?? 0,
    pendingLaunches: item.pending_launches ?? 0,
  };
}

export async function getRocketCatalog(offset = 0, limit = 60) {
  const safeOffset = Math.max(0, offset);
  const safeLimit = Math.min(Math.max(limit, 1), 60);
  const query = new URLSearchParams({
    limit: String(safeLimit),
    offset: String(safeOffset),
    ordering: "-total_launch_count",
    mode: "detailed",
  });
  const response = await fetch(`https://ll.thespacedevs.com/2.2.0/config/launcher/?${query}`, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(12_000),
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error(`Launcher catalog returned ${response.status}`);
  const data = (await response.json()) as { count?: number; results?: ApiRocket[] };
  return {
    count: data.count ?? 0,
    rockets: (data.results ?? []).map(mapRocket),
  };
}

export async function getRocket(id: number): Promise<CatalogRocket | null> {
  if (!Number.isInteger(id) || id < 1) return null;
  try {
    const response = await fetch(
      `https://ll.thespacedevs.com/2.2.0/config/launcher/${id}/?mode=detailed`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(12_000),
        headers: { Accept: "application/json" },
      },
    );
    if (!response.ok) return null;
    return mapRocket((await response.json()) as ApiRocket);
  } catch {
    return null;
  }
}

export async function getAgencyRockets(agencyId: number, limit = 16): Promise<CatalogRocket[]> {
  if (!Number.isInteger(agencyId) || agencyId < 1) return [];
  try {
    const query = new URLSearchParams({
      manufacturer__id: String(agencyId),
      limit: String(Math.min(Math.max(limit, 1), 32)),
      ordering: "-total_launch_count",
      mode: "detailed",
    });
    const response = await fetch(
      `https://ll.thespacedevs.com/2.2.0/config/launcher/?${query}`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(12_000),
        headers: { Accept: "application/json" },
      },
    );
    if (!response.ok) return [];
    const data = (await response.json()) as { results?: ApiRocket[] };
    return (data.results ?? []).map(mapRocket);
  } catch {
    return [];
  }
}
