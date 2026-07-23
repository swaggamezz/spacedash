"use client";

import type { Launch } from "@/lib/launches";
import { starshipTimeline } from "@/lib/rockets";
import { SpaceAssistant } from "@/components/space-assistant";
import { TimezoneClock } from "@/components/timezone-clock";
import { useEffect, useState } from "react";
import Link from "next/link";

function youtubeId(url: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.slice(1).split("/")[0];
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/live/") || parsed.pathname.startsWith("/embed/")) return parsed.pathname.split("/")[2];
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Amsterdam",
  }).format(new Date(date));
}

function MissionCountdown({ date }: { date: string }) {
  const [distance, setDistance] = useState(0);
  useEffect(() => {
    const update = () => setDistance(Math.max(0, new Date(date).getTime() - Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [date]);
  const values = [
    ["DAGEN", Math.floor(distance / 86_400_000)],
    ["UREN", Math.floor(distance / 3_600_000) % 24],
    ["MIN", Math.floor(distance / 60_000) % 60],
    ["SEC", Math.floor(distance / 1000) % 60],
  ];
  return <div className="mission-countdown">{values.map(([label, value]) => <div key={label}><strong>{String(value).padStart(2, "0")}</strong><span>{label}</span></div>)}</div>;
}

export function MissionPage({ launch }: { launch: Launch }) {
  const video = youtubeId(launch.webcast);
  const isUpcoming = launch.status === "upcoming" || launch.status === "hold";
  const isStarship = /starship|super heavy/i.test(`${launch.name} ${launch.rocket}`);
  const timeline = isStarship ? starshipTimeline : [
    { time: "T−00:60:00", event: "Launch preparations", detail: "Finale controles en voorbereiding van het voertuig." },
    { time: "T−00:10:00", event: "Final poll", detail: "De teams controleren de gereedheid voor lancering." },
    { time: "T+00:00:00", event: "Liftoff", detail: "Start van de missie." },
    { time: "T+00:02:30", event: "Stage event", detail: "Verwacht moment rond eerste-trap-separatie." },
    { time: "T+00:08:30", event: "Orbital insertion", detail: "Verwacht einde van de primaire opstijgfase." },
  ];

  return (
    <main className="mission-page">
      <nav className="mission-nav">
        <Link href="/"><span>▲</span> SPACE<strong>DASH</strong></Link>
        <Link href="/">← Alle launches</Link>
        <TimezoneClock />
      </nav>

      <section className="mission-hero">
        <div className="mission-hero-grid" />
        <div className="mission-identity">
          <span className={`mission-status ${launch.status}`}><i /> {launch.statusLabel}</span>
          <p>{launch.provider.toUpperCase()} / {launch.orbit.toUpperCase()}</p>
          <h1>{launch.name}</h1>
          <strong>{launch.rocket}</strong>
          {isUpcoming ? <MissionCountdown date={launch.windowStart} /> : <div className="mission-result">MISSIE {launch.status === "success" ? "GESLAAGD" : "AFGEROND"}</div>}
        </div>
        <div className="mission-orbit-art"><i /><i /><span>▲</span></div>
      </section>

      <div className="mission-layout">
        <div className="mission-primary">
          <section className="mission-section">
            <div className="mission-section-title"><span>01</span><div><small>MISSIEOVERZICHT</small><h2>{launch.mission}</h2></div></div>
            <p className="mission-description">{launch.description}</p>
            <div className="mission-facts">
              <div><span>LANCEERVENSTER</span><strong>{dateLabel(launch.windowStart)}</strong></div>
              <div><span>LOCATIE</span><strong>{launch.location}</strong></div>
              <div><span>PLATFORM</span><strong>{launch.pad}</strong></div>
              <div><span>DOELBAAN</span><strong>{launch.orbit}</strong></div>
              {launch.probability !== null && <div><span>WEERKANS</span><strong>{launch.probability}% go</strong></div>}
            </div>
          </section>

          <section className="mission-section">
            <div className="mission-section-title"><span>02</span><div><small>VLUCHTPROFIEL</small><h2>Missietijdlijn</h2></div></div>
            <div className="page-timeline">
              {timeline.map((item, index) => <div key={`${item.time}-${item.event}`}><b>{String(index + 1).padStart(2, "0")}</b><time>{item.time}</time><i /><p><strong>{item.event}</strong><span>{item.detail}</span></p></div>)}
            </div>
            <p className="timeline-disclaimer">Tijden zijn een referentieprofiel tenzij de lanceerorganisatie ze specifiek voor deze missie heeft gepubliceerd.</p>
          </section>
        </div>

        <aside className="mission-side">
          <section className="watch-panel">
            <div className="panel-label"><span><i /> WATCH CENTER</span><small>{video ? "VIDEO BESCHIKBAAR" : "EXTERNE BRON"}</small></div>
            {video ? <iframe src={`https://www.youtube-nocookie.com/embed/${video}?rel=0`} title={`Officiële uitzending van ${launch.name}`} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <div className="stream-placeholder"><span>▶</span><p>De officiële stream kan niet worden ingebed of is nog niet gepubliceerd.</p></div>}
            <div className="watch-actions">
              {launch.webcast && <a className="primary" href={launch.webcast} target="_blank" rel="noreferrer">Open officiële uitzending ↗</a>}
              {launch.infoUrl && <a href={launch.infoUrl} target="_blank" rel="noreferrer">Website lanceerorganisatie ↗</a>}
            </div>
          </section>

          <section className="public-telemetry">
            <div className="panel-label"><span>LIVE DATA</span><small>ALLEEN OPENBAAR</small></div>
            <div className="public-values">
              <div><span>HOOGTE</span><strong>—</strong><small>Geen publieke feed</small></div>
              <div><span>SNELHEID</span><strong>—</strong><small>Geen publieke feed</small></div>
              <div><span>MOTOREN</span><strong>—</strong><small>Volg webcast</small></div>
            </div>
            <p>SpaceDash toont geen gesimuleerde getallen alsof ze live zijn.</p>
          </section>
        </aside>
      </div>
      <SpaceAssistant context={`${launch.name}, ${launch.rocket}, ${launch.mission}`} />
    </main>
  );
}
