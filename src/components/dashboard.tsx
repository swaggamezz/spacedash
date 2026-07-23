"use client";

import type { Launch, LaunchStatus } from "@/lib/launches";
import { useEffect, useMemo, useState } from "react";

const icons = {
  rocket: "↗",
  calendar: "▦",
  archive: "◫",
  vehicle: "◇",
  globe: "◎",
  search: "⌕",
  clock: "◷",
  pin: "⌖",
  play: "▶",
  arrow: "→",
};

function getTimeParts(date: string) {
  const distance = Math.max(0, new Date(date).getTime() - Date.now());
  const days = Math.floor(distance / 86_400_000);
  const hours = Math.floor((distance / 3_600_000) % 24);
  const minutes = Math.floor((distance / 60_000) % 60);
  const seconds = Math.floor((distance / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function Countdown({ date, large = false }: { date: string; large?: boolean }) {
  const [time, setTime] = useState(() => getTimeParts(date));
  useEffect(() => {
    const update = () => setTime(getTimeParts(date));
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [date]);

  return (
    <div className={`countdown ${large ? "countdown-large" : ""}`}>
      {Object.entries(time).map(([label, value]) => (
        <span key={label}>
          <strong>{String(value).padStart(2, "0")}</strong>
          <small>{label.slice(0, 1).toUpperCase()}</small>
        </span>
      ))}
    </div>
  );
}

function StatusPill({ status, label }: { status: LaunchStatus; label: string }) {
  return <span className={`status status-${status}`}><i />{label}</span>;
}

function RocketArt({ provider }: { provider: string }) {
  return (
    <div className="rocket-art" aria-hidden="true">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="planet" />
      <div className="rocket-mark">
        <span>{provider.toUpperCase().slice(0, 10)}</span>
        <b>▲</b>
      </div>
    </div>
  );
}

const nav = [
  [icons.rocket, "Overzicht"],
  [icons.calendar, "Launches"],
  [icons.archive, "Historie"],
  [icons.vehicle, "Raketten"],
  [icons.globe, "Agentschappen"],
];

export function Dashboard({ launches }: { launches: Launch[] }) {
  const [active, setActive] = useState("Overzicht");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Launch | null>(null);
  const upcoming = launches.filter((launch) => launch.status !== "success" && launch.status !== "failure");
  const previous = launches.filter((launch) => launch.status === "success" || launch.status === "failure");
  const featured = upcoming[0] ?? launches[0];
  const filtered = useMemo(() => {
    const source = active === "Historie" ? previous : active === "Launches" ? upcoming : launches;
    if (!query.trim()) return source;
    const needle = query.toLowerCase();
    return source.filter((item) =>
      [item.name, item.provider, item.rocket, item.location, item.mission]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [active, launches, previous, query, upcoming]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={() => setActive("Overzicht")}>
          <span className="brand-glyph">▲</span>
          <span>SPACE<strong>DASH</strong></span>
        </a>
        <nav>
          <p>MISSIECONTROLE</p>
          {nav.map(([icon, label]) => (
            <button className={active === label ? "active" : ""} key={label} onClick={() => setActive(label)}>
              <i>{icon}</i>{label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span><i /> LIVE DATA</span>
          <small>Automatisch gesynchroniseerd</small>
          <small>Launch Library 2</small>
        </div>
      </aside>

      <main>
        <header>
          <button className="mobile-logo" onClick={() => setActive("Overzicht")}>▲</button>
          <div className="search">
            <span>{icons.search}</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Zoek launches, raketten of organisaties..." />
            <kbd>⌘ K</kbd>
          </div>
          <div className="utc"><span>UTC</span><strong>{new Date().toISOString().slice(11, 19)}</strong></div>
          <button className="avatar">TV</button>
        </header>

        <div className="content">
          <div className="eyebrow">MISSIECONTROLE / {active.toUpperCase()}</div>
          <div className="page-title">
            <div>
              <h1>{active === "Overzicht" ? "Goedemiddag, Teun." : active}</h1>
              <p>{active === "Overzicht" ? "Alles wat de aarde verlaat, op één plek." : `${filtered.length} missies gevonden in de automatische database.`}</p>
            </div>
            <span className="live-badge"><i /> SYSTEMEN OPERATIONEEL</span>
          </div>

          {active === "Overzicht" && featured && (
            <>
              <section className="hero">
                <RocketArt provider={featured.provider} />
                <div className="hero-copy">
                  <div className="hero-label"><span>VOLGENDE LAUNCH</span><StatusPill status={featured.status} label={featured.statusLabel} /></div>
                  <p className="provider">{featured.provider.toUpperCase()}</p>
                  <h2>{featured.name}</h2>
                  <p className="mission">{featured.rocket} · {featured.mission}</p>
                  <div className="hero-bottom">
                    <Countdown date={featured.windowStart} large />
                    <div className="hero-actions">
                      {featured.webcast && <a className="primary" href={featured.webcast} target="_blank" rel="noreferrer">{icons.play} Livestream</a>}
                      <button onClick={() => setSelected(featured)}>Missiedetails {icons.arrow}</button>
                    </div>
                  </div>
                </div>
              </section>

              <div className="section-heading">
                <div><span>AANKOMEND</span><h3>Launchkalender</h3></div>
                <button onClick={() => setActive("Launches")}>Bekijk alle launches {icons.arrow}</button>
              </div>
              <div className="launch-grid">
                {upcoming.slice(1, 4).map((launch) => <LaunchCard key={launch.id} launch={launch} onOpen={setSelected} />)}
              </div>

              <div className="stats">
                <div><span>LANCERINGEN DIT JAAR</span><strong>148</strong><small>↑ 12% t.o.v. vorig jaar</small></div>
                <div><span>SUCCESPERCENTAGE</span><strong>96.4%</strong><small>wereldwijd gemiddelde</small></div>
                <div><span>ACTIEVE RAKETTYPES</span><strong>{new Set(launches.map((item) => item.rocket)).size}</strong><small>in huidige dataset</small></div>
                <div><span>VOLGENDE 30 DAGEN</span><strong>{upcoming.filter((item) => new Date(item.windowStart).getTime() < new Date(featured.windowStart).getTime() + 2_592_000_000).length}</strong><small>geplande missies</small></div>
              </div>
            </>
          )}

          {active !== "Overzicht" && (
            <section className="browser">
              <div className="filter-row">
                <span>{active === "Historie" ? "AFGERONDE MISSIES" : "VOLLEDIGE DATABASE"}</span>
                <span>Automatisch bijgewerkt · elke 5 min</span>
              </div>
              <div className="launch-grid full-grid">
                {filtered.map((launch) => <LaunchCard key={launch.id} launch={launch} onOpen={setSelected} />)}
              </div>
              {!filtered.length && <div className="empty">Geen resultaten voor “{query}”.</div>}
            </section>
          )}
        </div>
      </main>

      {selected && <MissionDrawer launch={selected} onClose={() => setSelected(null)} />}

      <nav className="mobile-nav">
        {nav.slice(0, 4).map(([icon, label]) => (
          <button className={active === label ? "active" : ""} key={label} onClick={() => setActive(label)}>
            <i>{icon}</i><span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function LaunchCard({ launch, onOpen }: { launch: Launch; onOpen: (launch: Launch) => void }) {
  return (
    <article className="launch-card" onClick={() => onOpen(launch)}>
      <div className="card-art"><RocketArt provider={launch.provider} /><StatusPill status={launch.status} label={launch.statusLabel} /></div>
      <div className="card-body">
        <div className="card-topline"><span>{launch.provider.toUpperCase()}</span><span>{launch.orbit}</span></div>
        <h4>{launch.name}</h4>
        <p>{launch.rocket}</p>
        <div className="card-meta">
          <span>{icons.calendar} {formatDate(launch.windowStart)}</span>
          <span>{icons.pin} {launch.location}</span>
        </div>
        {launch.status === "upcoming" || launch.status === "hold" ? <Countdown date={launch.windowStart} /> : <span className="result">MISSIE {launch.status === "success" ? "GESLAAGD" : "MISLUKT"}</span>}
      </div>
    </article>
  );
}

function MissionDrawer({ launch, onClose }: { launch: Launch; onClose: () => void }) {
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose}>×</button>
        <div className="drawer-art"><RocketArt provider={launch.provider} /></div>
        <StatusPill status={launch.status} label={launch.statusLabel} />
        <p className="provider">{launch.provider.toUpperCase()}</p>
        <h2>{launch.name}</h2>
        <p className="drawer-description">{launch.description}</p>
        <dl>
          <div><dt>Raket</dt><dd>{launch.rocket}</dd></div>
          <div><dt>Doelbaan</dt><dd>{launch.orbit}</dd></div>
          <div><dt>Venster</dt><dd>{formatDate(launch.windowStart)}</dd></div>
          <div><dt>Locatie</dt><dd>{launch.location}</dd></div>
          <div><dt>Platform</dt><dd>{launch.pad}</dd></div>
          {launch.probability !== null && <div><dt>Weerkans</dt><dd>{launch.probability}% go</dd></div>}
        </dl>
        <div className="drawer-actions">
          {launch.webcast && <a className="primary" href={launch.webcast} target="_blank" rel="noreferrer">{icons.play} Open livestream</a>}
          {launch.infoUrl && <a href={launch.infoUrl} target="_blank" rel="noreferrer">Officiële missiepagina {icons.arrow}</a>}
        </div>
      </aside>
    </div>
  );
}
