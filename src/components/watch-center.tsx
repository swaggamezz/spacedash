"use client";

import type { Launch, StreamSource } from "@/lib/launches";
import { ActiveRefresh } from "@/components/active-refresh";
import { TimezoneClock } from "@/components/timezone-clock";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Layout = "focus" | "split" | "grid";

function youtubeId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1).split("/")[0];
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/live/") || parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2];
      }
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

function sourceHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "externe bron";
  }
}

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Amsterdam",
  }).format(new Date(date));
}

function missionClockValue(date: string) {
  const difference = Date.now() - new Date(date).getTime();
  const absolute = Math.abs(difference);
  const hours = Math.floor(absolute / 3_600_000);
  const minutes = Math.floor((absolute / 60_000) % 60);
  const seconds = Math.floor((absolute / 1000) % 60);
  return `T${difference >= 0 ? "+" : "−"}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function MissionClock({ date }: { date: string }) {
  const [value, setValue] = useState(() => missionClockValue(date));
  useEffect(() => {
    const timer = window.setInterval(() => setValue(missionClockValue(date)), 1000);
    return () => window.clearInterval(timer);
  }, [date]);
  return <strong>{value}</strong>;
}

function Feed({ source, featured = false }: { source: StreamSource; featured?: boolean }) {
  const video = youtubeId(source.url);
  return (
    <article className={`watch-feed ${featured ? "featured" : ""}`}>
      <div className="watch-feed-head">
        <div><i /><span>{source.title}</span></div>
        <small>{sourceHost(source.url)}</small>
      </div>
      {video ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video}?rel=0`}
          title={source.title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="watch-external">
          <span>↗</span>
          <strong>Deze feed opent bij de videobron</strong>
          <p>{sourceHost(source.url)} staat insluiten op andere websites niet toe.</p>
          <a href={source.url} target="_blank" rel="noreferrer">Open feed in nieuw venster ↗</a>
        </div>
      )}
    </article>
  );
}

export function WatchCenter({ launch }: { launch: Launch }) {
  const sources = useMemo<StreamSource[]>(() => {
    if (launch.streamSources?.length) return launch.streamSources;
    const urls = launch.streams?.length ? launch.streams : launch.webcast ? [launch.webcast] : [];
    return urls.map((url, index) => ({
      url,
      title: `Feed ${index + 1}`,
      priority: index,
    }));
  }, [launch.streamSources, launch.streams, launch.webcast]);
  const [layout, setLayout] = useState<Layout>(sources.length > 1 ? "split" : "focus");
  const [primaryUrl, setPrimaryUrl] = useState(sources[0]?.url ?? "");
  const ordered = useMemo(() => {
    const primary = sources.find((source) => source.url === primaryUrl);
    return primary ? [primary, ...sources.filter((source) => source.url !== primary.url)] : sources;
  }, [primaryUrl, sources]);

  return (
    <main className="watch-center">
      <ActiveRefresh />
      <nav className="watch-nav">
        <Link href="/"><span>▲</span> SPACE<strong>DASH</strong></Link>
        <Link href={`/launch/${encodeURIComponent(launch.id)}`}>← Terug naar missie</Link>
        <TimezoneClock />
      </nav>

      <header className="watch-header">
        <div>
          <span className={`watch-live-state ${launch.webcastLive ? "live" : ""}`}><i /> {launch.webcastLive ? "NU LIVE" : launch.statusLabel}</span>
          <p>{launch.provider.toUpperCase()} / MISSION WATCH CENTER</p>
          <h1>{launch.name}</h1>
          <small>{dateLabel(launch.windowStart)} · {launch.pad}, {launch.location}</small>
        </div>
        <div className="watch-toolbar">
          <label className="watch-stream-picker">
            <span>PRIMAIRE LIVESTREAM</span>
            <select value={primaryUrl} onChange={(event) => setPrimaryUrl(event.target.value)} disabled={!sources.length}>
              {!sources.length && <option>Geen feed beschikbaar</option>}
              {sources.map((source, index) => (
                <option value={source.url} key={source.url}>{index + 1}. {source.title} · {sourceHost(source.url)}</option>
              ))}
            </select>
            <small>{sources.length > 1 ? "Kies hier de camera die groot in beeld komt." : `${sources.length} publieke feed beschikbaar.`}</small>
          </label>
          <div className="watch-layout-controls" aria-label="Kies videolayout">
            <button aria-pressed={layout === "focus"} className={layout === "focus" ? "active" : ""} onClick={() => setLayout("focus")}><i>▣</i><span>Focus</span></button>
            <button aria-pressed={layout === "split"} className={layout === "split" ? "active" : ""} onClick={() => setLayout("split")} disabled={sources.length < 2}><i>▥</i><span>Split</span></button>
            <button aria-pressed={layout === "grid"} className={layout === "grid" ? "active" : ""} onClick={() => setLayout("grid")} disabled={sources.length < 2}><i>▦</i><span>Grid</span></button>
          </div>
        </div>
      </header>

      {!sources.length ? (
        <section className="watch-empty">
          <span>◉</span>
          <h2>Nog geen videofeeds gepubliceerd</h2>
          <p>SpaceDash controleert dit automatisch zolang je deze pagina open hebt. Het ontbreken van een stream betekent niet dat de missie geannuleerd is.</p>
          {launch.infoUrl && <a href={launch.infoUrl} target="_blank" rel="noreferrer">Open officiële missiepagina ↗</a>}
        </section>
      ) : (
        <>
          <section className={`watch-stage layout-${layout}`}>
            {layout === "focus" ? (
              <>
                <Feed source={ordered[0]} featured />
                <aside className="watch-source-list">
                  <div><span>BESCHIKBARE FEEDS</span><small>{sources.length} bronnen</small></div>
                  {sources.map((source, index) => (
                    <button
                      aria-pressed={source.url === ordered[0].url}
                      className={source.url === ordered[0].url ? "active" : ""}
                      onClick={() => setPrimaryUrl(source.url)}
                      key={source.url}
                    >
                      <b>{String(index + 1).padStart(2, "0")}</b>
                      <span><strong>{source.title}</strong><small>{sourceHost(source.url)}</small></span>
                      <i>▶</i>
                    </button>
                  ))}
                </aside>
              </>
            ) : (
              ordered.slice(0, layout === "split" ? 2 : 6).map((source) => <Feed source={source} key={source.url} />)
            )}
          </section>

          <section className="watch-source-strip">
            <div><span>FEEDSELECTIE</span><strong>Kies je primaire camerahoek</strong></div>
            <div>
              {sources.map((source, index) => (
                <button aria-pressed={source.url === ordered[0].url} className={source.url === ordered[0].url ? "active" : ""} onClick={() => setPrimaryUrl(source.url)} key={source.url}>
                  <b>{index + 1}</b><span>{source.title}</span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="watch-telemetry">
        <div className="watch-telemetry-head">
          <div><span>LIVE TELEMETRY</span><h2>Mission data deck</h2></div>
          <small><i className={launch.webcastLive ? "live" : ""} /> {launch.webcastLive ? "PUBLIEKE WEBCAST LIVE" : "WACHT OP PUBLIEKE DOWNLINK"}</small>
        </div>
        <div className="watch-telemetry-grid">
          <div className="available"><span>MISSIEKLOK</span><MissionClock date={launch.windowStart} /><small>Berekend vanaf bevestigde T−0</small></div>
          <div className="available"><span>LAUNCHSTATUS</span><strong>{launch.statusLabel}</strong><small>Launch Library-status</small></div>
          <div className="available"><span>VIDEOFEEDS</span><strong>{sources.length}</strong><small>{launch.webcastLive ? "Uitzending actief" : "Publieke bronnen gevonden"}</small></div>
          <div><span>HOOGTE</span><strong>—</strong><small>Geen openbare datafeed</small></div>
          <div><span>SNELHEID</span><strong>—</strong><small>Geen openbare datafeed</small></div>
          <div><span>MOTORSTATUS</span><strong>—</strong><small>Alleen zichtbaar in webcast</small></div>
          <div><span>TRAJECTORY</span><strong>—</strong><small>Geen realtime coördinaten</small></div>
          <div><span>DOWNLINK</span><strong>{launch.webcastLive ? "VIDEO" : "STANDBY"}</strong><small>Geen ruwe telemetry-API</small></div>
        </div>
        <p className="watch-telemetry-note">SpaceDash toont uitsluitend echte openbare data. Hoogte, snelheid, motoren en vluchtcomputerdata worden door de meeste launchproviders—waaronder SpaceX—niet als publieke machineleesbare live-feed vrijgegeven. Bekijk daarvoor de officiële overlay in de videofeed.</p>
      </section>

      <footer className="watch-footer">
        <p><i /> Videobeelden komen van externe aanbieders. SpaceDash toont alleen beschikbare publieke feeds en verzint geen telemetrie.</p>
        <Link href={`/launch/${encodeURIComponent(launch.id)}`}>Missiedossier openen →</Link>
      </footer>
    </main>
  );
}
