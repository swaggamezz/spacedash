export type LaunchStatus =
  | "upcoming"
  | "success"
  | "failure"
  | "hold"
  | "aborted"
  | "cancelled";

export type StreamSource = {
  url: string;
  title: string;
  priority: number;
};

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
  statusDescription?: string;
  orbit: string;
  webcast: string | null;
  infoUrl: string | null;
  probability: number | null;
  lastUpdated?: string;
  missionType?: string;
  weatherConcerns?: string | null;
  holdReason?: string | null;
  failReason?: string | null;
  hashtag?: string | null;
  infographic?: string | null;
  streams?: string[];
  streamSources?: StreamSource[];
  webcastLive?: boolean;
  rocketDetails?: {
    configurationId?: number;
    family?: string;
    variant?: string;
    description?: string;
    manufacturer?: string;
    active?: boolean;
    reusable?: boolean;
    minStage?: number | null;
    maxStage?: number | null;
    length?: number | null;
    diameter?: number | null;
    maidenFlight?: string | null;
    launchCost?: number | null;
    launchMass?: number | null;
    leoCapacity?: number | null;
    gtoCapacity?: number | null;
    thrust?: number | null;
    apogee?: number | null;
    image?: string | null;
    infoUrl?: string | null;
    wikiUrl?: string | null;
    totalLaunches?: number;
    successfulLaunches?: number;
    failedLaunches?: number;
    pendingLaunches?: number;
  };
  agency?: {
    id?: number;
    type?: string;
    country?: string;
    description?: string;
    administrator?: string;
    foundingYear?: string;
    logo?: string | null;
    image?: string | null;
    infoUrl?: string | null;
    wikiUrl?: string | null;
    totalLaunches?: number;
    successfulLaunches?: number;
    failedLaunches?: number;
    pendingLaunches?: number;
  };
  padDetails?: {
    description?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    mapUrl?: string | null;
    mapImage?: string | null;
    timezone?: string;
    country?: string;
    totalLaunches?: number;
  };
  programs?: Array<{
    name: string;
    description?: string;
    image?: string | null;
    infoUrl?: string | null;
    wikiUrl?: string | null;
  }>;
  timeline?: Array<{ time: string; event: string; detail?: string }>;
  updates?: Array<{ time?: string; comment: string; infoUrl?: string | null }>;
};

type ApiLaunch = {
  id: string;
  name: string;
  image?: { image_url?: string } | string | null;
  net: string;
  window_start: string;
  window_end: string;
  status?: { id?: number; name?: string; abbrev?: string; description?: string };
  last_updated?: string;
  weather_concerns?: string | null;
  holdreason?: string | null;
  failreason?: string | null;
  hashtag?: string | null;
  infographic?: string | null;
  launch_service_provider?: {
    id?: number;
    name?: string;
    type?: string;
    country_code?: string;
    description?: string;
    administrator?: string;
    founding_year?: string;
    logo_url?: string | null;
    image_url?: string | null;
    info_url?: string | null;
    wiki_url?: string | null;
    total_launch_count?: number;
    successful_launches?: number;
    failed_launches?: number;
    pending_launches?: number;
  };
  rocket?: {
    configuration?: {
      id?: number;
      full_name?: string;
      family?: string;
      variant?: string;
      description?: string;
      active?: boolean;
      reusable?: boolean;
      min_stage?: number | null;
      max_stage?: number | null;
      length?: number | null;
      diameter?: number | null;
      maiden_flight?: string | null;
      launch_cost?: number | null;
      launch_mass?: number | null;
      leo_capacity?: number | null;
      gto_capacity?: number | null;
      to_thrust?: number | null;
      apogee?: number | null;
      image_url?: string | null;
      info_url?: string | null;
      wiki_url?: string | null;
      total_launch_count?: number;
      successful_launches?: number;
      failed_launches?: number;
      pending_launches?: number;
      manufacturer?: { name?: string };
    };
  };
  mission?: {
    name?: string;
    description?: string;
    type?: string;
    orbit?: { name?: string };
  } | null;
  pad?: {
    name?: string;
    description?: string | null;
    latitude?: string | null;
    longitude?: string | null;
    map_url?: string | null;
    map_image?: string | null;
    country_code?: string;
    total_launch_count?: number;
    location?: { name?: string; timezone_name?: string };
  } | null;
  probability?: number | null;
  vid_urls?: ApiUrl[];
  vidURLs?: ApiUrl[];
  webcast_live?: boolean;
  infoURLs?: Array<string | ApiUrl>;
  program?: Array<{
    name?: string;
    description?: string;
    image_url?: string | null;
    info_url?: string | null;
    wiki_url?: string | null;
  }>;
  timeline?: Array<{
    relative_time?: string;
    type?: { name?: string; description?: string };
    name?: string;
    description?: string;
  }>;
  updates?: Array<{
    created_on?: string;
    comment?: string;
    info_url?: string | null;
  }>;
};

type ApiUrl = {
  url?: string | { url?: string };
  priority?: number;
  title?: string;
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
  if (label.includes("cancel") || label.includes("geannuleerd")) return "cancelled";
  if (label.includes("abort")) return "aborted";
  if (label.includes("fail")) return "failure";
  if (
    label.includes("hold") ||
    label.includes("tbd") ||
    label.includes("tbc") ||
    label.includes("postpon") ||
    label.includes("delay") ||
    label.includes("scrub")
  ) {
    return "hold";
  }
  if (label.includes("success") || (past && label.includes("complete"))) return "success";
  return past ? "hold" : "upcoming";
}

function externalUrl(value: unknown): string | null {
  let candidate: unknown = value;

  // Launch Library has returned both plain strings and nested URL objects.
  for (let depth = 0; depth < 3 && candidate && typeof candidate === "object"; depth += 1) {
    candidate = (candidate as { url?: unknown }).url;
  }

  if (typeof candidate !== "string") return null;

  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}

function providerHome(provider: string): string | null {
  const name = provider.toLowerCase();
  if (name.includes("spacex")) return "https://www.spacex.com/launches/";
  if (name.includes("rocket lab")) return "https://www.rocketlabusa.com/missions/";
  if (name.includes("ariane")) return "https://www.arianespace.com/missions/";
  if (name.includes("blue origin")) return "https://www.blueorigin.com/missions";
  if (name.includes("ula") || name.includes("united launch alliance")) return "https://www.ulalaunch.com/missions";
  if (name.includes("nasa")) return "https://www.nasa.gov/launches/";
  return null;
}

function streamTitle(url: string, supplied?: string) {
  if (supplied?.trim()) return supplied.trim();
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "YouTube-feed";
    if (host.includes("x.com") || host.includes("twitter.com")) return "SpaceX-feed op X";
    return host;
  } catch {
    return "Videofeed";
  }
}

function readableRelativeTime(value?: string) {
  if (!value) return "T± onbekend";
  if (/^T[+−-]/.test(value)) return value.replace("T-", "T−");
  const match = value.match(/^(-)?P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!match) return value;
  const [, before, days, hours, minutes, seconds] = match;
  const totalHours = Number(days ?? 0) * 24 + Number(hours ?? 0);
  return `T${before ? "−" : "+"}${String(totalHours).padStart(2, "0")}:${String(Number(minutes ?? 0)).padStart(2, "0")}:${String(Number(seconds ?? 0)).padStart(2, "0")}`;
}

function readableTimelineTitle(name?: string, description?: string) {
  if (name && !/^mission event$/i.test(name)) return name;
  const text = description?.toLowerCase() ?? "";
  const stage = text.includes("first stage") ? " · trap 1" : text.includes("second stage") ? " · trap 2" : "";
  if (text.includes("liquid oxygen")) return `LOX laden${stage}`;
  if (text.includes("liquid methane")) return `Methaan laden${stage}`;
  if (text.includes("propellant load")) return "Brandstof laden";
  if (text.includes("engine chill")) return "Motoren voorkoelen";
  if (text.includes("go for launch")) return "Go for launch";
  if (text.includes("liftoff") || text.includes("lift off")) return "Liftoff";
  if (text.includes("max q")) return "Max Q";
  if (text.includes("separation")) return "Trapseparatie";
  if (text.includes("engine cutoff") || text.includes("shutdown")) return "Motoruitschakeling";
  if (text.includes("landing")) return "Landingsfase";
  if (description) {
    const sentence = description.split(/[.!?]/)[0].trim();
    return sentence.length > 58 ? `${sentence.slice(0, 55)}…` : sentence;
  }
  return "Vluchtgebeurtenis";
}

function mapLaunch(item: ApiLaunch, past = false): Launch {
  const image =
    typeof item.image === "string" ? item.image : item.image?.image_url ?? null;
  const streams = [...(item.vid_urls ?? item.vidURLs ?? [])].sort(
    (a, b) => (a.priority ?? 99) - (b.priority ?? 99),
  );
  const config = item.rocket?.configuration;
  const agency = item.launch_service_provider;
  const streamSources = streams
    .map((stream) => {
      const url = externalUrl(stream);
      if (!url) return null;
      return {
        url,
        title: streamTitle(url, stream.title),
        priority: stream.priority ?? 99,
      };
    })
    .filter((source): source is StreamSource => Boolean(source))
    .filter((source, index, all) => all.findIndex((item) => item.url === source.url) === index);
  const streamUrls = streamSources.map((stream) => stream.url);

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
    statusDescription: item.status?.description,
    orbit: item.mission?.orbit?.name ?? "Niet bekend",
    webcast: streamUrls[0] ?? null,
    infoUrl:
      item.infoURLs?.map((url) => externalUrl(url)).find(Boolean) ??
      providerHome(item.launch_service_provider?.name ?? ""),
    probability: item.probability ?? null,
    lastUpdated: item.last_updated,
    missionType: item.mission?.type,
    weatherConcerns: item.weather_concerns ?? null,
    holdReason: item.holdreason || null,
    failReason: item.failreason || null,
    hashtag: item.hashtag ?? null,
    infographic: externalUrl(item.infographic),
    streams: streamUrls,
    streamSources,
    webcastLive: item.webcast_live ?? false,
    rocketDetails: {
      configurationId: config?.id,
      family: config?.family,
      variant: config?.variant,
      description: config?.description,
      manufacturer: config?.manufacturer?.name,
      active: config?.active,
      reusable: config?.reusable,
      minStage: config?.min_stage,
      maxStage: config?.max_stage,
      length: config?.length,
      diameter: config?.diameter,
      maidenFlight: config?.maiden_flight,
      launchCost: config?.launch_cost,
      launchMass: config?.launch_mass,
      leoCapacity: config?.leo_capacity,
      gtoCapacity: config?.gto_capacity,
      thrust: config?.to_thrust,
      apogee: config?.apogee,
      image: externalUrl(config?.image_url),
      infoUrl: externalUrl(config?.info_url),
      wikiUrl: externalUrl(config?.wiki_url),
      totalLaunches: config?.total_launch_count,
      successfulLaunches: config?.successful_launches,
      failedLaunches: config?.failed_launches,
      pendingLaunches: config?.pending_launches,
    },
    agency: {
      id: agency?.id,
      type: agency?.type,
      country: agency?.country_code,
      description: agency?.description,
      administrator: agency?.administrator,
      foundingYear: agency?.founding_year,
      logo: externalUrl(agency?.logo_url),
      image: externalUrl(agency?.image_url),
      infoUrl: externalUrl(agency?.info_url),
      wikiUrl: externalUrl(agency?.wiki_url),
      totalLaunches: agency?.total_launch_count,
      successfulLaunches: agency?.successful_launches,
      failedLaunches: agency?.failed_launches,
      pendingLaunches: agency?.pending_launches,
    },
    padDetails: {
      description: item.pad?.description,
      latitude: item.pad?.latitude ? Number(item.pad.latitude) : null,
      longitude: item.pad?.longitude ? Number(item.pad.longitude) : null,
      mapUrl: externalUrl(item.pad?.map_url),
      mapImage: externalUrl(item.pad?.map_image),
      timezone: item.pad?.location?.timezone_name,
      country: item.pad?.country_code,
      totalLaunches: item.pad?.total_launch_count,
    },
    programs: (item.program ?? []).map((program) => ({
      name: program.name ?? "Naamloos programma",
      description: program.description,
      image: externalUrl(program.image_url),
      infoUrl: externalUrl(program.info_url),
      wikiUrl: externalUrl(program.wiki_url),
    })),
    timeline: (item.timeline ?? []).map((event) => ({
      time: readableRelativeTime(event.relative_time),
      event: readableTimelineTitle(
        event.type?.name ?? event.name,
        event.type?.description ?? event.description,
      ),
      detail: event.type?.description ?? event.description,
    })),
    updates: (item.updates ?? [])
      .filter((update) => Boolean(update.comment))
      .map((update) => ({
        time: update.created_on,
        comment: update.comment ?? "",
        infoUrl: externalUrl(update.info_url),
      })),
  };
}

export async function getLaunch(id: string): Promise<Launch | null> {
  const local = fallback.find((launch) => launch.id === id);
  if (local) return local;

  try {
    const response = await fetch(
      `https://ll.thespacedevs.com/2.2.0/launch/${encodeURIComponent(id)}/?mode=detailed`,
      {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(12_000),
        headers: { Accept: "application/json" },
      },
    );
    if (!response.ok) return null;
    return mapLaunch((await response.json()) as ApiLaunch);
  } catch {
    return null;
  }
}

export async function getRelatedLaunches(launch: Launch): Promise<Launch[]> {
  const configId = launch.rocketDetails?.configurationId;
  if (!configId) {
    const all = await getLaunches();
    return all.filter((item) => item.id !== launch.id && item.rocket === launch.rocket).slice(0, 12);
  }

  try {
    const query = new URLSearchParams({
      launcher_config__id: String(configId),
      limit: "16",
      ordering: "-net",
      mode: "detailed",
    });
    const response = await fetch(`https://ll.thespacedevs.com/2.2.0/launch/?${query}`, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(12_000),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return [];
    const data = (await response.json()) as { results?: ApiLaunch[] };
    return (data.results ?? [])
      .map((item) => mapLaunch(item, new Date(item.net).getTime() < Date.now()))
      .filter((item) => item.id !== launch.id);
  } catch {
    return [];
  }
}

export async function getAgencyLaunches(agencyId: number, limit = 12): Promise<Launch[]> {
  if (!Number.isInteger(agencyId) || agencyId < 1) return [];
  try {
    const query = new URLSearchParams({
      lsp__id: String(agencyId),
      limit: String(Math.min(Math.max(limit, 1), 24)),
      ordering: "-net",
      mode: "detailed",
    });
    const response = await fetch(`https://ll.thespacedevs.com/2.2.0/launch/?${query}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(12_000),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return [];
    const data = (await response.json()) as { results?: ApiLaunch[] };
    return (data.results ?? [])
      .map((item) => mapLaunch(item, new Date(item.net).getTime() < Date.now()))
      .filter((launch) => launch.agency?.id === agencyId);
  } catch {
    return [];
  }
}

export async function searchHistoricalLaunches(search: string, limit = 30): Promise<Launch[]> {
  const normalized = search.trim().slice(0, 80);
  if (normalized.length < 2) return [];

  const query = new URLSearchParams({
    search: normalized,
    limit: String(Math.min(Math.max(limit, 1), 40)),
    ordering: "-net",
    mode: "normal",
  });
  const response = await fetch(
    `https://ll.thespacedevs.com/2.2.0/launch/previous/?${query}`,
    {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(12_000),
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) throw new Error(`Launch Library search returned ${response.status}`);
  const data = (await response.json()) as { results?: ApiLaunch[] };
  return (data.results ?? []).map((item) => mapLaunch(item, true));
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
      next: { revalidate: kind === "upcoming" ? 60 : 1800 },
      signal: AbortSignal.timeout(12_000),
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
