"use client";

import type { Launch, LaunchStatus } from "@/lib/launches";
import { rockets, starshipTimeline, type Rocket } from "@/lib/rockets";
import { SpaceAssistant } from "@/components/space-assistant";
import { TimezoneClock } from "@/components/timezone-clock";
import { ActiveRefresh } from "@/components/active-refresh";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

function isPending(status: LaunchStatus) {
  return status === "upcoming" || status === "hold";
}

function missionResult(status: LaunchStatus) {
  if (status === "success") return "GESLAAGD";
  if (status === "failure") return "MISLUKT";
  if (status === "cancelled") return "GEANNULEERD";
  if (status === "aborted") return "POGING AFGEBROKEN";
  return "UITGESTELD";
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
  ["★", "Starship"],
  [icons.archive, "Historie"],
  [icons.vehicle, "Raketten"],
  [icons.globe, "Agentschappen"],
];

export function Dashboard({ launches }: { launches: Launch[] }) {
  const [active, setActive] = useState("Overzicht");
  const [query, setQuery] = useState("");
  const [selectedRocket, setSelectedRocket] = useState<Rocket | null>(null);
  const upcoming = launches.filter((launch) => isPending(launch.status));
  const previous = launches.filter((launch) => !isPending(launch.status));
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
      <ActiveRefresh />
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
          <small>Actief: verversing per minuut</small>
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
          <TimezoneClock />
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
                      <Link href={`/launch/${encodeURIComponent(featured.id)}`}>Open missie {icons.arrow}</Link>
                    </div>
                  </div>
                </div>
              </section>

              <div className="section-heading">
                <div><span>AANKOMEND</span><h3>Launchkalender</h3></div>
                <button onClick={() => setActive("Launches")}>Bekijk alle launches {icons.arrow}</button>
              </div>
              <div className="launch-grid">
                {upcoming.slice(1, 4).map((launch) => <LaunchCard key={launch.id} launch={launch} />)}
              </div>

              <div className="stats">
                <div><span>LANCERINGEN DIT JAAR</span><strong>148</strong><small>↑ 12% t.o.v. vorig jaar</small></div>
                <div><span>SUCCESPERCENTAGE</span><strong>96.4%</strong><small>wereldwijd gemiddelde</small></div>
                <div><span>ACTIEVE RAKETTYPES</span><strong>{new Set(launches.map((item) => item.rocket)).size}</strong><small>in huidige dataset</small></div>
                <div><span>VOLGENDE 30 DAGEN</span><strong>{upcoming.filter((item) => new Date(item.windowStart).getTime() < new Date(featured.windowStart).getTime() + 2_592_000_000).length}</strong><small>geplande missies</small></div>
              </div>
            </>
          )}

          {active === "Starship" && <StarshipCenter launches={launches} />}

          {active === "Raketten" && (
            <RocketDatabase onOpen={setSelectedRocket} />
          )}

          {active !== "Overzicht" && active !== "Starship" && active !== "Raketten" && (
            <section className="browser">
              <div className="filter-row">
                <span>{active === "Historie" ? "AFGERONDE MISSIES" : "VOLLEDIGE DATABASE"}</span>
                <span>Automatisch bijgewerkt · elke minuut bij actief bezoek</span>
              </div>
              <div className="launch-grid full-grid">
                {filtered.map((launch) => <LaunchCard key={launch.id} launch={launch} />)}
              </div>
              {!filtered.length && <div className="empty">Geen resultaten voor “{query}”.</div>}
            </section>
          )}
        </div>
      </main>

      {selectedRocket && <RocketDrawer rocket={selectedRocket} onClose={() => setSelectedRocket(null)} />}
      <SpaceAssistant context={selectedRocket?.name ?? (active === "Starship" ? "Starship" : "ruimtevaart")} />

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

function StarshipCenter({ launches }: { launches: Launch[] }) {
  const starship = rockets[0];
  const missions = launches.filter((launch) => /starship|super heavy/i.test(`${launch.name} ${launch.rocket}`));
  const next = missions.find((launch) => launch.status === "upcoming" || launch.status === "hold");
  return (
    <section className="starship-center">
      <div className="starship-masthead">
        <div className="starship-copy">
          <span className="star-kicker">SPACEDASH SPECIAL / VEHICLE 01</span>
          <h2>STARSHIP</h2>
          <p>Het grootste vliegende raketsysteem ooit gebouwd. Volledig herbruikbaar, aangedreven door methaan en ontworpen voor de maan, Mars en verder.</p>
          <div className="starship-actions">
            {next ? <Link className="primary" href={`/launch/${encodeURIComponent(next.id)}`}>Open volgende missie →</Link> : <a className="primary" href="https://www.spacex.com/launches/" target="_blank" rel="noreferrer">SpaceX launch center →</a>}
            <a href="https://www.youtube.com/@SpaceX" target="_blank" rel="noreferrer">Officiële streams</a>
          </div>
        </div>
        <StarshipDiagram />
        <div className="starship-number">01</div>
      </div>

      <div className="spec-strip">
        <div><span>HOOGTE</span><strong>123</strong><small>meter</small></div>
        <div><span>DIAMETER</span><strong>9</strong><small>meter</small></div>
        <div><span>STUWKRACHT</span><strong>~89</strong><small>meganewton</small></div>
        <div><span>RAPTORS</span><strong>39</strong><small>booster + ship</small></div>
        <div><span>LEO PAYLOAD</span><strong>100+</strong><small>ton, doel</small></div>
      </div>

      <div className="starship-columns">
        <article className="tech-panel">
          <div className="panel-title"><span>01</span><div><small>ARCHITECTUUR</small><h3>Twee volledig herbruikbare trappen</h3></div></div>
          <div className="stage-compare">
            <div><b>SUPER HEAVY</b><strong>33× Raptor</strong><p>Booster · boostback · tower catch</p><i style={{ width: "100%" }} /></div>
            <div><b>STARSHIP</b><strong>6× Raptor</strong><p>Schip · hitteschild · orbitale bijtanking</p><i style={{ width: "58%" }} /></div>
          </div>
          <p className="technical-copy">{starship.summary}</p>
        </article>
        <article className="tech-panel engine-panel">
          <div className="panel-title"><span>02</span><div><small>AANDRIJVING</small><h3>Raptor full-flow cycle</h3></div></div>
          <div className="engine-visual">
            <div className="engine-bell">Y</div>
            <dl>
              <div><dt>Brandstof</dt><dd>CH₄ + LOX</dd></div>
              <div><dt>Kamerdruk</dt><dd>~350 bar*</dd></div>
              <div><dt>Stuwkracht</dt><dd>~2,7 MN*</dd></div>
              <div><dt>Cyclus</dt><dd>Full-flow</dd></div>
            </dl>
          </div>
          <small className="estimate-note">* Publieke Raptor 3-doelwaarden; hardware kan per vlucht verschillen.</small>
        </article>
      </div>

      <div className="section-heading star-heading"><div><span>REFERENTIEPROFIEL</span><h3>Starship-vluchttijdlijn</h3></div><small>Werkelijke tijden verschillen per vlucht</small></div>
      <div className="mission-timeline">
        {starshipTimeline.map((item, index) => (
          <div className={`timeline-event ${item.kind}`} key={item.time}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <time>{item.time}</time>
            <div><strong>{item.event}</strong><p>{item.detail}</p></div>
          </div>
        ))}
      </div>

      <div className="starship-columns history-row">
        <article className="tech-panel">
          <div className="panel-title"><span>03</span><div><small>ONTWIKKELING</small><h3>Van hopper naar orbitale architectuur</h3></div></div>
          <div className="milestones">
            {[
              ["2019", "Starhopper", "Eerste vrije vlucht met Raptor"],
              ["2020–21", "High-altitude tests", "Belly-flop en eerste landing"],
              ["2023", "IFT-1", "Eerste geïntegreerde vlucht"],
              ["2024", "IFT-5", "Eerste booster catch"],
              ["NU", "Iteratief testen", "Ship, booster en hergebruik verbeteren"],
            ].map(([year, title, detail]) => <div key={title}><time>{year}</time><i /><p><strong>{title}</strong><span>{detail}</span></p></div>)}
          </div>
        </article>
        <article className="tech-panel">
          <div className="panel-title"><span>04</span><div><small>WAAROM HET ANDERS IS</small><h3>Ontworpen als transportsysteem</h3></div></div>
          <div className="fact-list">
            {starship.facts.map((fact, index) => <div key={fact}><b>{index + 1}</b><p>{fact}</p></div>)}
          </div>
        </article>
      </div>
    </section>
  );
}

function StarshipDiagram() {
  return (
    <div className="starship-diagram" aria-label="Gestileerde Starship en Super Heavy">
      <div className="ship-tip" />
      <div className="ship-body"><i /><i /><i /></div>
      <div className="hotstage" />
      <div className="booster-body">
        <div className="grid-fin left" /><div className="grid-fin right" />
        <div className="raptor-cluster">{Array.from({ length: 13 }, (_, i) => <i key={i} />)}</div>
      </div>
      <span className="label ship-label">STARSHIP <i /></span>
      <span className="label booster-label">SUPER HEAVY <i /></span>
    </div>
  );
}

function RocketDatabase({ onOpen }: { onOpen: (rocket: Rocket) => void }) {
  return (
    <section className="rocket-database">
      <div className="filter-row"><span>{rockets.length} RAKETSYSTEMEN</span><span>Handmatig gecontroleerde kernspecificaties</span></div>
      <div className="rocket-table">
        <div className="rocket-table-head"><span>VOERTUIG</span><span>STATUS</span><span>HOOGTE</span><span>PAYLOAD LEO</span><span>HERGEBRUIK</span><span /></div>
        {rockets.map((rocket, index) => (
          <button key={rocket.id} onClick={() => onOpen(rocket)}>
            <span className="rocket-name"><i>{String(index + 1).padStart(2, "0")}</i><b>{rocket.name}</b><small>{rocket.maker}</small></span>
            <span><em className={rocket.status.includes("Operationeel") ? "operational" : ""} />{rocket.status}</span>
            <span>{rocket.height}</span>
            <span>{rocket.payloadLeo}</span>
            <span>{rocket.reusable}</span>
            <span>→</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function LaunchCard({ launch }: { launch: Launch }) {
  return (
    <Link className="launch-card" href={`/launch/${encodeURIComponent(launch.id)}`}>
      <div className="card-art"><RocketArt provider={launch.provider} /><StatusPill status={launch.status} label={launch.statusLabel} /></div>
      <div className="card-body">
        <div className="card-topline"><span>{launch.provider.toUpperCase()}</span><span>{launch.orbit}</span></div>
        <h4>{launch.name}</h4>
        <p>{launch.rocket}</p>
        <div className="card-meta">
          <span>{icons.calendar} {formatDate(launch.windowStart)}</span>
          <span>{icons.pin} {launch.location}</span>
        </div>
        {isPending(launch.status) ? <Countdown date={launch.windowStart} /> : <span className={`result result-${launch.status}`}>MISSIE {missionResult(launch.status)}</span>}
        <span className="card-detail-link">Open volledige missie →</span>
      </div>
    </Link>
  );
}

function RocketDrawer({ rocket, onClose }: { rocket: Rocket; onClose: () => void }) {
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer rocket-drawer" onClick={(event) => event.stopPropagation()}>
        <button className="close" onClick={onClose}>×</button>
        <div className="rocket-drawer-hero">
          <div className="rocket-silhouette">▲</div>
          <span>{rocket.maker.toUpperCase()}</span>
          <h2>{rocket.name}</h2>
          <p>{rocket.role}</p>
        </div>
        <div className="drawer-status"><i /> {rocket.status}</div>
        <p className="drawer-description">{rocket.summary}</p>
        <div className="rocket-spec-grid">
          {[
            ["HOOGTE", rocket.height], ["DIAMETER", rocket.diameter],
            ["STARTMASSA", rocket.mass], ["TRAPPEN", String(rocket.stages)],
            ["LEO PAYLOAD", rocket.payloadLeo], ["HERGEBRUIK", rocket.reusable],
          ].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
        </div>
        <div className="drawer-section-title"><span>AANDRIJVING</span><small>{rocket.propellant}</small></div>
        <div className="engine-list">
          {rocket.engines.map((engine) => (
            <article key={`${engine.name}-${engine.count}`}>
              <div><b>{engine.name}</b><span>{engine.count}</span></div>
              <dl>
                <div><dt>Cyclus</dt><dd>{engine.cycle}</dd></div>
                <div><dt>Brandstof</dt><dd>{engine.propellant}</dd></div>
                <div><dt>Stuwkracht</dt><dd>{engine.thrust}</dd></div>
              </dl>
            </article>
          ))}
        </div>
        <div className="drawer-section-title"><span>KENMERKEN</span></div>
        <div className="fact-list compact">
          {rocket.facts.map((fact, index) => <div key={fact}><b>{index + 1}</b><p>{fact}</p></div>)}
        </div>
      </aside>
    </div>
  );
}
