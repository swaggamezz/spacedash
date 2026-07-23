"use client";

import type { Launch } from "@/lib/launches";
import { starshipTimeline } from "@/lib/rockets";
import { SpaceAssistant } from "@/components/space-assistant";
import { TimezoneClock } from "@/components/timezone-clock";
import { ActiveRefresh } from "@/components/active-refresh";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function youtubeId(url: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1).split("/")[0];
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/live/") || parsed.pathname.startsWith("/embed/") || parsed.pathname.startsWith("/shorts/")) return parsed.pathname.split("/")[2];
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

function dateLabel(date: string, timeZone = "Europe/Amsterdam") {
  try {
    return new Intl.DateTimeFormat("nl-NL", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: timeZone || "Europe/Amsterdam",
    }).format(new Date(date));
  } catch {
    return new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
  }
}

function compactDate(date: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
}

function number(value?: number | null, unit = "") {
  if (value === null || value === undefined) return "Niet gepubliceerd";
  return `${new Intl.NumberFormat("nl-NL").format(value)}${unit}`;
}

function money(value?: number | null) {
  if (!value) return "Niet gepubliceerd";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function mapEmbed(latitude?: number | null, longitude?: number | null) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude == null || longitude == null) return null;
  const span = 0.18;
  const bbox = [longitude - span, latitude - span, longitude + span, latitude + span].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}

function isPending(status: Launch["status"]) {
  return status === "upcoming" || status === "hold";
}

function missionResult(status: Launch["status"]) {
  if (status === "success") return "GESLAAGD";
  if (status === "failure") return "MISLUKT";
  if (status === "cancelled") return "GEANNULEERD";
  if (status === "aborted") return "POGING AFGEBROKEN";
  if (status === "completed") return "AFGEROND";
  return "UITGESTELD";
}

function streamState(launch: Launch, hasEmbeddedVideo: boolean) {
  if (launch.webcastLive) return "NU LIVE";
  if (launch.status === "cancelled") return "LAUNCH GEANNULEERD";
  if (launch.status === "aborted") return "POGING AFGEBROKEN";
  if (launch.status === "hold") return "NIEUWE STREAM VOLGT";
  if (launch.status === "success" || launch.status === "failure" || launch.status === "completed") {
    return launch.webcast ? "REPLAY BESCHIKBAAR" : "GEEN OPNAME GEVONDEN";
  }
  if (hasEmbeddedVideo || launch.webcast) return "STREAM GEPLAND";
  return "NOG NIET GEPUBLICEERD";
}

function streamMessage(launch: Launch) {
  if (launch.status === "cancelled") {
    return "Deze lancering is geannuleerd. Een oude of verwijderde stream wordt niet meer als live getoond.";
  }
  if (launch.status === "aborted") {
    return "De lanceerpoging is afgebroken. Zodra een nieuwe poging en uitzending zijn bevestigd, verschijnen ze hier.";
  }
  if (launch.status === "hold") {
    return "De lancering staat uitgesteld of on hold. Een nieuwe officiële streamlink volgt zodra die wordt gepubliceerd.";
  }
  return "De officiële stream kan niet worden ingebed of is nog niet gepubliceerd. Dat betekent niet automatisch dat de lancering is geannuleerd.";
}

function MissionCountdown({ date }: { date: string }) {
  const [distance, setDistance] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setDistance(new Date(date).getTime() - Date.now());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [date]);

  // Na T-0 schakelt de klok om naar T+ in plaats van stil te blijven staan op nullen.
  if (distance !== null && distance <= 0) {
    const elapsed = -distance;
    const clock = [
      Math.floor(elapsed / 3_600_000),
      Math.floor((elapsed / 60_000) % 60),
      Math.floor((elapsed / 1000) % 60),
    ].map((value) => String(value).padStart(2, "0")).join(":");
    return <div className="mission-result result-live">● LIVE · T+{clock}</div>;
  }

  const remaining = distance ?? 0;
  const values = [
    ["DAGEN", Math.floor(remaining / 86_400_000)],
    ["UREN", Math.floor(remaining / 3_600_000) % 24],
    ["MIN", Math.floor(remaining / 60_000) % 60],
    ["SEC", Math.floor(remaining / 1000) % 60],
  ];
  return <div className="mission-countdown">{values.map(([label, value]) => <div key={label}><strong>{String(value).padStart(2, "0")}</strong><span>{label}</span></div>)}</div>;
}

function SectionTitle({ number: index, label, title }: { number: string; label: string; title: string }) {
  return <div className="mission-section-title"><span>{index}</span><div><small>{label}</small><h2>{title}</h2></div></div>;
}

function RelatedCard({ launch }: { launch: Launch }) {
  return (
    <Link className="related-card" href={`/launch/${encodeURIComponent(launch.id)}`}>
      <div className="related-card-art" style={launch.image ? { backgroundImage: `linear-gradient(to top,#0b1021 0%,transparent 80%),url("${launch.image}")` } : undefined}>
        <span className={`mission-status ${launch.status}`}><i /> {launch.statusLabel}</span>
      </div>
      <div>
        <small>{compactDate(launch.net)} · {launch.orbit}</small>
        <strong>{launch.name}</strong>
        <span>{launch.location}</span>
      </div>
    </Link>
  );
}

// Eén corrupte localStorage-entry mag de favorietenknop niet laten crashen.
function readFavorites(): string[] {
  try {
    const saved = JSON.parse(window.localStorage.getItem("spacedash-favorites") ?? "[]");
    return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function MissionUtilities({ launch }: { launch: Launch }) {
  const [favorite, setFavorite] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const initialize = window.setTimeout(() => {
      setFavorite(readFavorites().includes(launch.id));
    }, 0);
    return () => window.clearTimeout(initialize);
  }, [launch.id]);

  function toggleFavorite() {
    const saved = readFavorites();
    const next = saved.includes(launch.id) ? saved.filter((id) => id !== launch.id) : [...saved, launch.id];
    window.localStorage.setItem("spacedash-favorites", JSON.stringify(next));
    setFavorite(next.includes(launch.id));
  }

  async function share() {
    const data = { title: `${launch.name} · SpaceDash`, text: `${launch.name} — ${dateLabel(launch.net)}`, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      // Gebruiker annuleerde het deelvenster, of delen is hier niet beschikbaar.
    }
  }

  function calendar() {
    const stamp = (date: string) => new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    // safe() doet de volledige ICS-escaping; de invoer bevat dus echte newlines.
    const safe = (value: string) => value.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
    // RFC 5545: regels langer dan 75 tekens vouwen met CRLF + spatie.
    const fold = (line: string) => {
      const parts: string[] = [];
      for (let index = 0; index < line.length; index += 74) {
        parts.push((index === 0 ? "" : " ") + line.slice(index, index + 74));
      }
      return parts.join("\r\n");
    };
    const dtEnd = new Date(launch.windowEnd).getTime() > new Date(launch.net).getTime()
      ? launch.windowEnd
      : new Date(new Date(launch.net).getTime() + 3_600_000).toISOString();
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SpaceDash//Launch Calendar//NL",
      "BEGIN:VEVENT", `UID:${launch.id}@spacedash`, `DTSTAMP:${stamp(new Date().toISOString())}`,
      `DTSTART:${stamp(launch.net)}`, `DTEND:${stamp(dtEnd)}`,
      `SUMMARY:${safe(launch.name)}`, `DESCRIPTION:${safe(`${launch.description}\nRaket: ${launch.rocket}\nSpaceDash: ${window.location.href}`)}`,
      `LOCATION:${safe(`${launch.pad}, ${launch.location}`)}`, `URL:${window.location.href}`,
      "BEGIN:VALARM", "TRIGGER:-PT1H", "ACTION:DISPLAY", `DESCRIPTION:${safe(`${launch.name} start mogelijk over één uur`)}`, "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].map(fold).join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${launch.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mission-utilities">
      <button className={favorite ? "active" : ""} onClick={toggleFavorite}>{favorite ? "★ Opgeslagen" : "☆ Favoriet"}</button>
      <button onClick={calendar}>＋ Zet in agenda</button>
      <button onClick={() => void share()}>{copied ? "✓ Link gekopieerd" : "↗ Deel missie"}</button>
    </div>
  );
}

export function MissionPage({ launch, related }: { launch: Launch; related: Launch[] }) {
  const streams = launch.streams?.length ? launch.streams : launch.webcast ? [launch.webcast] : [];
  const [activeStream, setActiveStream] = useState(streams[0] ?? null);
  const selectedStream = activeStream && streams.includes(activeStream) ? activeStream : streams[0] ?? null;
  const video = youtubeId(selectedStream);
  const pending = isPending(launch.status);
  const isStarship = /starship|super heavy/i.test(`${launch.name} ${launch.rocket}`);
  const map = mapEmbed(launch.padDetails?.latitude, launch.padDetails?.longitude);
  const previous = related.filter((item) => !isPending(item.status));
  const future = related.filter((item) => isPending(item.status));
  const timeline = useMemo(() => {
    if (launch.timeline?.length) return launch.timeline;
    if (isStarship) return starshipTimeline;
    return [
      { time: "T−01:00:00", event: "Launch preparations", detail: "Finale controles en voorbereiding van het voertuig." },
      { time: "T−00:10:00", event: "Final launch poll", detail: "De teams controleren de gereedheid voor lancering." },
      { time: "T+00:00:00", event: "Liftoff", detail: "Start van de missie." },
      { time: "T+00:02:30", event: "Stage event", detail: "Indicatief moment rond eerste-trap-separatie." },
      { time: "T+00:08:30", event: "Orbital insertion", detail: "Indicatief einde van de primaire opstijgfase." },
    ];
  }, [isStarship, launch.timeline]);
  const rocket = launch.rocketDetails;

  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "auto" });
  }, [launch.id]);

  return (
    <main className="mission-page">
      <ActiveRefresh />
      <nav className="mission-nav">
        <Link href="/"><span>▲</span> SPACE<strong>DASH</strong></Link>
        <Link href="/">← Mission control</Link>
        <div className="mission-nav-links">
          <a href="#mission">Missie</a><a href="#rocket">Raket</a><a href="#timeline">Tijdlijn</a><Link href={`/launch/${encodeURIComponent(launch.id)}/watch`}>Watch center</Link>
        </div>
        <TimezoneClock />
      </nav>

      <section className="mission-hero" style={launch.image ? { backgroundImage: `linear-gradient(90deg,#080a18 5%,rgba(8,10,24,.86) 45%,rgba(8,10,24,.2)),url("${launch.image}")` } : undefined}>
        <div className="mission-hero-grid" />
        <div className="mission-identity">
          <span className={`mission-status ${launch.status}`}><i /> {launch.statusLabel}</span>
          <p>{launch.provider.toUpperCase()} / {launch.missionType?.toUpperCase() ?? launch.orbit.toUpperCase()}</p>
          <h1>{launch.name}</h1>
          <strong>{launch.rocket} · {launch.orbit}</strong>
          {pending ? <MissionCountdown date={launch.net} /> : <div className={`mission-result result-${launch.status}`}>MISSIE {missionResult(launch.status)}</div>}
        </div>
        {!launch.image && <div className="mission-orbit-art"><i /><i /><span>▲</span></div>}
      </section>

      <div className="mission-jumpbar">
        <div><span>LANCERING (T-0)</span><strong>{dateLabel(launch.net)}</strong></div>
        <div><span>RAKET</span><strong>{launch.rocket}</strong></div>
        <div><span>LOCATIE</span><strong>{launch.location}</strong></div>
        <div><span>DOELBAAN</span><strong>{launch.orbit}</strong></div>
      </div>
      <MissionUtilities launch={launch} />

      <div className="mission-layout" id="mission">
        <div className="mission-primary">
          <section className="mission-section">
            <SectionTitle number="01" label="MISSIEOVERZICHT" title={launch.mission} />
            <p className="mission-description">{launch.description}</p>
            <div className="mission-facts">
              <div><span>GEPLANDE T-0</span><strong>{dateLabel(launch.net)}</strong></div>
              <div><span>LANCEERVENSTER</span><strong>{launch.windowStart === launch.windowEnd ? "Instantaan venster" : `${dateLabel(launch.windowStart)} – ${dateLabel(launch.windowEnd)}`}</strong></div>
              <div><span>LOKALE PADTIJD</span><strong>{dateLabel(launch.net, launch.padDetails?.timezone)}</strong></div>
              <div><span>LOCATIE</span><strong>{launch.location}</strong></div>
              <div><span>PLATFORM</span><strong>{launch.pad}</strong></div>
              <div><span>MISSIETYPE</span><strong>{launch.missionType ?? "Niet geclassificeerd"}</strong></div>
              <div><span>DOELBAAN</span><strong>{launch.orbit}</strong></div>
              {launch.probability !== null && <div><span>GO-KANS</span><strong>{launch.probability}%</strong></div>}
              <div><span>LAATSTE DATA-UPDATE</span><strong>{launch.lastUpdated ? dateLabel(launch.lastUpdated) : "Onbekend"}</strong></div>
            </div>
            {(launch.statusDescription || launch.weatherConcerns || launch.holdReason || launch.failReason) && (
              <div className="mission-alerts">
                {launch.statusDescription && <div><span>STATUS</span><p>{launch.statusDescription}</p></div>}
                {launch.weatherConcerns && <div><span>WEER</span><p>{launch.weatherConcerns}</p></div>}
                {launch.holdReason && <div><span>HOLD</span><p>{launch.holdReason}</p></div>}
                {launch.failReason && <div className="critical"><span>FAILURE</span><p>{launch.failReason}</p></div>}
              </div>
            )}
          </section>

          <section className="mission-section rocket-dossier" id="rocket">
            <SectionTitle number="02" label="LAUNCH VEHICLE DOSSIER" title={launch.rocket} />
            {rocket?.description && <p className="mission-description">{rocket.description}</p>}
            <div className="vehicle-layout">
              <div className="vehicle-silhouette" style={rocket?.image ? { backgroundImage: `url("${rocket.image}")` } : undefined}><span>▲</span></div>
              <div className="vehicle-specs">
                {[
                  ["FAMILIE", rocket?.family || "Onbekend"],
                  ["VARIANT", rocket?.variant || "Onbekend"],
                  ["FABRIKANT", rocket?.manufacturer || launch.provider],
                  ["HOOGTE", number(rocket?.length, " m")],
                  ["DIAMETER", number(rocket?.diameter, " m")],
                  ["STARTMASSA", number(rocket?.launchMass, " t")],
                  ["TRAPPEN", rocket?.minStage === rocket?.maxStage ? number(rocket?.maxStage) : `${number(rocket?.minStage)}–${number(rocket?.maxStage)}`],
                  ["LIFTOFF THRUST", number(rocket?.thrust, " kN")],
                  ["LEO CAPACITEIT", number(rocket?.leoCapacity, " kg")],
                  ["GTO CAPACITEIT", number(rocket?.gtoCapacity, " kg")],
                  ["EERSTE VLUCHT", rocket?.maidenFlight ?? "Onbekend"],
                  ["PUBLIEKE PRIJS", money(rocket?.launchCost)],
                ].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
              </div>
            </div>
            <div className="vehicle-score">
              <div><span>TOTAAL</span><strong>{number(rocket?.totalLaunches)}</strong></div>
              <div><span>GESLAAGD</span><strong>{number(rocket?.successfulLaunches)}</strong></div>
              <div><span>MISLUKT</span><strong>{number(rocket?.failedLaunches)}</strong></div>
              <div><span>GEPLAND</span><strong>{number(rocket?.pendingLaunches)}</strong></div>
              <div><span>HERBRUIKBAAR</span><strong>{rocket?.reusable === undefined ? "Onbekend" : rocket.reusable ? "JA" : "NEE"}</strong></div>
            </div>
            <div className="source-row">
              {rocket?.infoUrl && <a href={rocket.infoUrl} target="_blank" rel="noreferrer">Officiële raketpagina ↗</a>}
              {rocket?.wikiUrl && <a href={rocket.wikiUrl} target="_blank" rel="noreferrer">Technische achtergrond ↗</a>}
            </div>
          </section>

          <section className="mission-section" id="timeline">
            <SectionTitle number="03" label={launch.timeline?.length ? "OFFICIËLE EVENTDATA" : "REFERENTIEPROFIEL"} title="Missietijdlijn" />
            <div className="page-timeline">
              {timeline.map((item, index) => <div key={`${item.time}-${item.event}-${index}`}><b>{String(index + 1).padStart(2, "0")}</b><time>{item.time}</time><i /><p><strong>{item.event}</strong><span>{item.detail}</span></p></div>)}
            </div>
            {!launch.timeline?.length && <p className="timeline-disclaimer">Deze tijden zijn een referentieprofiel. SpaceDash presenteert ze niet als live of officieel bevestigde telemetrie.</p>}
          </section>

          {launch.updates?.length ? (
            <section className="mission-section">
              <SectionTitle number="04" label="LAUNCH UPDATES" title="Laatste ontwikkelingen" />
              <div className="update-feed">
                {launch.updates.map((update, index) => <article key={`${update.time}-${index}`}><time>{update.time ? dateLabel(update.time) : "Update"}</time><p>{update.comment}</p>{update.infoUrl && <a href={update.infoUrl} target="_blank" rel="noreferrer">Bron ↗</a>}</article>)}
              </div>
            </section>
          ) : null}

          {launch.programs?.length ? (
            <section className="mission-section">
              <SectionTitle number="05" label="PROGRAMMA" title="Groter geheel" />
              <div className="program-grid">
                {launch.programs.map((program) => <article key={program.name} style={program.image ? { backgroundImage: `linear-gradient(to top,#0a0d1d,transparent),url("${program.image}")` } : undefined}><div><strong>{program.name}</strong><p>{program.description}</p><span>{program.infoUrl && <a href={program.infoUrl} target="_blank" rel="noreferrer">Officieel ↗</a>}{program.wikiUrl && <a href={program.wikiUrl} target="_blank" rel="noreferrer">Achtergrond ↗</a>}</span></div></article>)}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="mission-side">
          <section className="watch-panel">
            <div className="panel-label"><span><i className={launch.webcastLive ? "is-live" : ""} /> WATCH CENTER</span><small>{streamState(launch, Boolean(video))}</small></div>
            {video ? <iframe src={`https://www.youtube-nocookie.com/embed/${video}?rel=0`} title={`Officiële uitzending van ${launch.name}`} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <div className="stream-placeholder"><span>▶</span><p>{streamMessage(launch)}</p></div>}
            {streams.length > 1 && <div className="stream-tabs">{streams.map((stream, index) => <button className={selectedStream === stream ? "active" : ""} onClick={() => setActiveStream(stream)} key={stream}>FEED {index + 1}</button>)}</div>}
            <div className="watch-actions">
              <Link className="primary" href={`/launch/${encodeURIComponent(launch.id)}/watch`}>
                {streams.length > 1 ? `Open multi-view · ${streams.length} feeds →` : "Open volledig Watch Center →"}
              </Link>
              {selectedStream && <a className="primary" href={selectedStream} target="_blank" rel="noreferrer">Open officiële uitzending ↗</a>}
              {launch.infoUrl && <a href={launch.infoUrl} target="_blank" rel="noreferrer">Website lanceerorganisatie ↗</a>}
              {launch.infographic && <a href={launch.infographic} target="_blank" rel="noreferrer">Missie-infographic ↗</a>}
            </div>
          </section>

          <section className="public-telemetry">
            <div className="panel-label"><span>LIVE DATA</span><small>ALLEEN OPENBAAR</small></div>
            <div className="public-values">
              <div><span>HOOGTE</span><strong>—</strong><small>Geen publieke feed</small></div>
              <div><span>SNELHEID</span><strong>—</strong><small>Geen publieke feed</small></div>
              <div><span>MOTOREN</span><strong>—</strong><small>Volg webcast</small></div>
            </div>
            <p>Geen gesimuleerde getallen vermomd als live telemetrie. Als een aanbieder een publieke feed opent, kan deze module echte waarden tonen.</p>
          </section>

          <section className="agency-panel">
            <div className="panel-label"><span>ORGANISATIE</span><small>{launch.agency?.type ?? "AGENCY"}</small></div>
            {launch.agency?.logo && <div className="agency-logo" style={{ backgroundImage: `url("${launch.agency.logo}")` }} />}
            <h3>{launch.provider}</h3>
            <p>{launch.agency?.description ?? "Geen uitgebreide organisatiebeschrijving beschikbaar."}</p>
            <dl>
              <div><dt>Land</dt><dd>{launch.agency?.country ?? "—"}</dd></div>
              <div><dt>Opgericht</dt><dd>{launch.agency?.foundingYear ?? "—"}</dd></div>
              <div><dt>Leiding</dt><dd>{launch.agency?.administrator ?? "—"}</dd></div>
              <div><dt>Launches</dt><dd>{number(launch.agency?.totalLaunches)}</dd></div>
              <div><dt>Succesvol</dt><dd>{number(launch.agency?.successfulLaunches)}</dd></div>
            </dl>
            <div className="source-row">{launch.agency?.infoUrl && <a href={launch.agency.infoUrl} target="_blank" rel="noreferrer">Website ↗</a>}{launch.agency?.wikiUrl && <a href={launch.agency.wikiUrl} target="_blank" rel="noreferrer">Achtergrond ↗</a>}</div>
          </section>

          <section className="pad-panel">
            <div className="panel-label"><span>LANCEERLOCATIE</span><small>{launch.padDetails?.country ?? ""}</small></div>
            {map ? <iframe src={map} title={`Kaart van ${launch.pad}`} /> : <div className="map-placeholder">⌖</div>}
            <h3>{launch.pad}</h3><strong>{launch.location}</strong>
            {launch.padDetails?.description && <p>{launch.padDetails.description}</p>}
            <dl><div><dt>Coördinaten</dt><dd>{launch.padDetails?.latitude ?? "—"}, {launch.padDetails?.longitude ?? "—"}</dd></div><div><dt>Pad-launches</dt><dd>{number(launch.padDetails?.totalLaunches)}</dd></div></dl>
            {launch.padDetails?.mapUrl && <a className="map-link" href={launch.padDetails.mapUrl} target="_blank" rel="noreferrer">Open grote kaart ↗</a>}
          </section>
        </aside>
      </div>

      <section className="related-section" id="related">
        <div className="related-heading"><div><small>LAUNCH VEHICLE HISTORY</small><h2>Meer vluchten met {launch.rocket}</h2></div><span>{related.length} verwante missies geladen</span></div>
        {future.length > 0 && <><h3>Toekomstige vluchten</h3><div className="related-grid">{future.map((item) => <RelatedCard launch={item} key={item.id} />)}</div></>}
        {previous.length > 0 && <><h3>Eerdere vluchten</h3><div className="related-grid">{previous.map((item) => <RelatedCard launch={item} key={item.id} />)}</div></>}
        {!related.length && <div className="related-empty">Er zijn nog geen andere vluchten met exact deze configuratie in de openbare database gevonden.</div>}
      </section>

      <footer className="mission-footer"><span>▲ SPACEDASH</span><p>Data: Launch Library 2 en officiële aanbieders · actief bezoek ververst iedere 5 minuten</p><Link href="/">Terug naar mission control ↑</Link></footer>
      <SpaceAssistant context={`${launch.name}, ${launch.rocket}, ${launch.mission}, ${launch.description}`} />
    </main>
  );
}
