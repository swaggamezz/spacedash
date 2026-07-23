export type LaunchStatus = "upcoming" | "success" | "failure" | "hold";

export type Launch = {
  id: string;
  name: string;
  provider: string;
  rocket: string;
  mission: string;
  description: string;
  image: string | null;
  windowStart: string;
  windowEnd: string;
  location: string;
  pad: string;
  status: LaunchStatus;
  statusLabel: string;
  orbit: string;
  webcast: string | null;
  infoUrl: string | null;
  probability: number | null;
};

type ApiLaunch = {
  id: string;
  name: string;
  image?: { image_url?: string } | string | null;
  net: string;
  window_start: string;
  window_end: string;
  status?: { id?: number; name?: string; abbrev?: string };
  launch_service_provider?: { name?: string };
  rocket?: {
    configuration?: { full_name?: string };
  };
  mission?: {
    name?: string;
    description?: string;
    orbit?: { name?: string };
  } | null;
  pad?: {
    name?: string;
    location?: { name?: string };
  } | null;
  probability?: number | null;
  vid_urls?: Array<{ url?: string; priority?: number; title?: string }>;
  webcast_live?: boolean;
  infoURLs?: string[];
};

const fallback: Launch[] = [
  {
    id: "demo-starship",
    name: "Starship Flight Test",
    provider: "SpaceX",
    rocket: "Starship / Super Heavy",
    mission: "Integrated flight test",
    description:
      "Volledige testvlucht van het herbruikbare Starship-lanceersysteem. Live gegevens worden geladen zodra de databron bereikbaar is.",
    image: null,
    windowStart: "2026-08-02T12:30:00Z",
    windowEnd: "2026-08-02T14:30:00Z",
    location: "Starbase, Texas",
    pad: "Orbital Launch Mount A",
    status: "upcoming",
    statusLabel: "Go for launch",
    orbit: "Suborbital",
    webcast: "https://www.youtube.com/@SpaceX",
    infoUrl: "https://www.spacex.com/launches/",
    probability: 70,
  },
  {
    id: "demo-ariane",
    name: "Ariane 6 · Galileo",
    provider: "Arianespace",
    rocket: "Ariane 64",
    mission: "Galileo navigation satellites",
    description: "Lancering van nieuwe Europese navigatiesatellieten.",
    image: null,
    windowStart: "2026-08-08T21:12:00Z",
    windowEnd: "2026-08-08T23:12:00Z",
    location: "Kourou, French Guiana",
    pad: "ELA-4",
    status: "upcoming",
    statusLabel: "To be confirmed",
    orbit: "MEO",
    webcast: "https://www.youtube.com/@arianespace",
    infoUrl: "https://www.arianespace.com/",
    probability: null,
  },
  {
    id: "demo-electron",
    name: "Electron · Dedicated rideshare",
    provider: "Rocket Lab",
    rocket: "Electron",
    mission: "Dedicated rideshare",
    description: "Kleine satellieten naar een zon-synchrone baan.",
    image: null,
    windowStart: "2026-07-19T03:42:00Z",
    windowEnd: "2026-07-19T05:42:00Z",
    location: "Māhia Peninsula, New Zealand",
    pad: "Launch Complex 1B",
    status: "success",
    statusLabel: "Success",
    orbit: "SSO",
    webcast: "https://www.youtube.com/@RocketLab",
    infoUrl: "https://www.rocketlabusa.com/missions/",
    probability: null,
  },
];

function statusOf(item: ApiLaunch, past: boolean): LaunchStatus {
  const label = `${item.status?.name ?? ""} ${item.status?.abbrev ?? ""}`.toLowerCase();
  if (label.includes("fail")) return "failure";
  if (label.includes("hold") || label.includes("tbd") || label.includes("tbc")) return "hold";
  if (label.includes("success") || (past && label.includes("complete"))) return "success";
  return past ? "success" : "upcoming";
}

function mapLaunch(item: ApiLaunch, past = false): Launch {
  const image =
    typeof item.image === "string" ? item.image : item.image?.image_url ?? null;
  const streams = [...(item.vid_urls ?? [])].sort(
    (a, b) => (a.priority ?? 99) - (b.priority ?? 99),
  );

  return {
    id: item.id,
    name: item.name,
    provider: item.launch_service_provider?.name ?? "Onbekende provider",
    rocket: item.rocket?.configuration?.full_name ?? "Onbekende raket",
    mission: item.mission?.name ?? item.name,
    description: item.mission?.description ?? "Missiedetails volgen zodra ze zijn bevestigd.",
    image,
    windowStart: item.window_start ?? item.net,
    windowEnd: item.window_end ?? item.net,
    location: item.pad?.location?.name ?? "Locatie nog niet bevestigd",
    pad: item.pad?.name ?? "Lanceerplatform onbekend",
    status: statusOf(item, past),
    statusLabel: item.status?.name ?? (past ? "Completed" : "Scheduled"),
    orbit: item.mission?.orbit?.name ?? "Niet bekend",
    webcast: streams[0]?.url ?? null,
    infoUrl: item.infoURLs?.[0] ?? null,
    probability: item.probability ?? null,
  };
}

async function fetchList(kind: "upcoming" | "previous", limit: number) {
  const query = new URLSearchParams({
    limit: String(limit),
    mode: "detailed",
    ordering: kind === "upcoming" ? "net" : "-net",
  });
  const response = await fetch(
    `https://ll.thespacedevs.com/2.2.0/launch/${kind}/?${query}`,
    {
      next: { revalidate: kind === "upcoming" ? 300 : 3600 },
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) throw new Error(`Launch Library returned ${response.status}`);
  const data = (await response.json()) as { results?: ApiLaunch[] };
  return (data.results ?? []).map((item) => mapLaunch(item, kind === "previous"));
}

export async function getLaunches(): Promise<Launch[]> {
  try {
    const [upcoming, previous] = await Promise.all([
      fetchList("upcoming", 18),
      fetchList("previous", 12),
    ]);
    return [...upcoming, ...previous];
  } catch {
    return fallback;
  }
}
