"use client";

import type { Launch, LaunchStatus } from "@/lib/launches";
import type { CatalogRocket } from "@/lib/launch-vehicles";
import { rockets, starshipTimeline, type Rocket } from "@/lib/rockets";
import { SpaceAssistant } from "@/components/space-assistant";
import { TimezoneClock } from "@/components/timezone-clock";
import { ActiveRefresh } from "@/components/active-refresh";
import { AgencyDatabase } from "@/components/agency-database";
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
  const [historyResults, setHistoryResults] = useState<Launch[]>([]);
  const [historyResultQuery, setHistoryResultQuery] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const upcoming = launches.filter((launch) => isPending(launch.status));
  const previous = launches.filter((launch) => !isPending(launch.status));
  const featured = upcoming[0] ?? launches[0];
  const normalizedQuery = query.trim();
  const remoteHistoryActive = active === "Historie" && normalizedQuery.length >= 2;
  const remoteHistoryReady = remoteHistoryActive && historyResultQuery === normalizedQuery;
  const filtered = useMemo(() => {
    const source = active === "Historie"
      ? remoteHistoryReady ? historyResults : previous
      : active === "Launches" ? upcoming : launches;
    if (!query.trim()) return source;
    const needle = query.toLowerCase();
    return source.filter((item) =>
      [item.name, item.provider, item.rocket, item.location, item.mission]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [active, historyResults, launches, previous, query, remoteHistoryReady, upcoming]);

  useEffect(() => {
    if (!remoteHistoryActive) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setHistoryLoading(true);
      setHistoryError("");
      try {
        const response = await fetch(`/api/launches/search?q=${encodeURIComponent(normalizedQuery)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { launches?: Launch[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Historisch zoeken mislukt.");
        setHistoryResults(data.launches ?? []);
        setHistoryResultQuery(normalizedQuery);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setHistoryError(error instanceof Error ? error.message : "Historisch zoeken mislukt.");
      } finally {
        if (!controller.signal.aborted) setHistoryLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [normalizedQuery, remoteHistoryActive]);

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
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={active === "Historie" ? "Zoek in alle historische launches..." : "Zoek launches, raketten of organisaties..."}
            />
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
              <p>
                {active === "Overzicht"
                  ? "Alles wat de aarde verlaat, op één plek."
                  : active === "Raketten"
                    ? "Actieve en historische lanceervoertuigen in één technisch archief."
                    : active === "Agentschappen"
                      ? "Ontdek de organisaties achter ruimtevaartmissies over de hele wereld."
                      : `${filtered.length} missies gevonden in de automatische database.`}
              </p>
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
                      <Link className="primary" href={`/launch/${encodeURIComponent(featured.id)}/watch`}>{icons.play} Watch center</Link>
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

          {active === "Agentschappen" && <AgencyDatabase />}

          {active !== "Overzicht" && active !== "Starship" && active !== "Raketten" && active !== "Agentschappen" && (
            <section className="browser">
              <div className="filter-row">
                <span>
                  {active === "Historie"
                    ? remoteHistoryActive ? "ZOEKEN IN 7.500+ HISTORISCHE LAUNCHES" : "RECENTE AFGERONDE MISSIES"
                    : "VOLLEDIGE DATABASE"}
                </span>
                <span>Automatisch bijgewerkt · elke minuut bij actief bezoek</span>
              </div>
              {historyLoading && remoteHistoryActive && <div className="history-search-state"><i /> Historische database doorzoeken…</div>}
              {historyError && remoteHistoryActive && <div className="history-search-state error">{historyError}</div>}
              <div className="launch-grid full-grid">
                {filtered.map((launch) => <LaunchCard key={launch.id} launch={launch} />)}
              </div>
              {!filtered.length && !historyLoading && <div className="empty">Geen resultaten voor “{query}”. Probeer bijvoorbeeld “Starship”, “Apollo” of “Falcon 9”.</div>}
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

type CatalogFilter = "all" | "active" | "retired";

function catalogNumber(value: number | null, unit = "") {
  if (value === null) return "—";
  return `${new Intl.NumberFormat("nl-NL").format(value)}${unit}`;
}

function RocketDatabase({ onOpen }: { onOpen: (rocket: Rocket) => void }) {
  const [catalog, setCatalog] = useState<CatalogRocket[]>([]);
  const [total, setTotal] = useState(0);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [filter, setFilter] = useState<CatalogFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<CatalogRocket | null>(null);

  async function loadCatalog(offset: number, signal?: AbortSignal) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/rockets?offset=${offset}`, { signal });
      const data = (await response.json()) as { count?: number; rockets?: CatalogRocket[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Raketcatalogus laden mislukt.");
      setCatalog((current) => offset === 0 ? data.rockets ?? [] : [...current, ...(data.rockets ?? [])]);
      setTotal(data.count ?? 0);
    } catch (loadError) {
      if (loadError instanceof DOMException && loadError.name === "AbortError") return;
      setError(loadError instanceof Error ? loadError.message : "Raketcatalogus laden mislukt.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void loadCatalog(0, controller.signal), 0);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, []);

  const visible = useMemo(() => {
    const needle = catalogQuery.trim().toLowerCase();
    return catalog.filter((rocket) => {
      const matchesStatus =
        filter === "all" ||
        (filter === "active" && rocket.active === true) ||
        (filter === "retired" && rocket.active === false);
      const matchesQuery =
        !needle ||
        [rocket.name, rocket.family, rocket.manufacturer, rocket.country]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return matchesStatus && matchesQuery;
    });
  }, [catalog, catalogQuery, filter]);

  return (
    <>
      <section className="rocket-database">
        <div className="catalog-heading">
          <div><span>AUTOMATISCHE DATABASE</span><h2>Raketarchief</h2><p>Actieve, historische en experimentele lanceervoertuigen uit de volledige openbare catalogus.</p></div>
          <strong>{total || "532"}<small> configuraties</small></strong>
        </div>

        <div className="catalog-controls">
          <label><span>⌕</span><input value={catalogQuery} onChange={(event) => setCatalogQuery(event.target.value)} placeholder="Zoek Saturn, Shuttle, Proton, Ariane…" /></label>
          <div>
            {([
              ["all", "Alle"],
              ["active", "Actief"],
              ["retired", "Historisch"],
            ] as const).map(([value, label]) => (
              <button aria-pressed={filter === value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)} key={value}>{label}</button>
            ))}
          </div>
        </div>

        {error && <div className="catalog-state error">{error} De zes gecontroleerde dossiers hieronder blijven beschikbaar.</div>}
        {loading && !catalog.length && <div className="catalog-state"><i /> Raketarchief laden…</div>}
        <div className="catalog-grid">
          {visible.map((rocket) => (
            <button className="catalog-card" onClick={() => setSelected(rocket)} key={rocket.id}>
              <div className="catalog-card-art" style={rocket.image ? { backgroundImage: `linear-gradient(to top,#090b1c 0%,transparent 75%),url("${rocket.image}")` } : undefined}>
                <span className={rocket.active === true ? "active" : rocket.active === false ? "retired" : "unknown"}><i /> {rocket.active === true ? "ACTIEF" : rocket.active === false ? "HISTORISCH" : "STATUS ONBEKEND"}</span>
                {!rocket.image && <b>▲</b>}
              </div>
              <div className="catalog-card-copy">
                <small>{rocket.family} · {rocket.country}</small>
                <strong>{rocket.name}</strong>
                <span>{rocket.manufacturer}</span>
                <dl>
                  <div><dt>Vluchten</dt><dd>{rocket.totalLaunches}</dd></div>
                  <div><dt>Eerste vlucht</dt><dd>{rocket.maidenFlight?.slice(0, 4) ?? "—"}</dd></div>
                  <div><dt>LEO</dt><dd>{catalogNumber(rocket.leoCapacity, " kg")}</dd></div>
                </dl>
              </div>
            </button>
          ))}
        </div>
        {!loading && !visible.length && !error && <div className="catalog-state">Geen geladen raketten voldoen aan deze zoekopdracht of dit filter.</div>}
        {catalog.length < total && (
          <button className="catalog-more" disabled={loading} onClick={() => void loadCatalog(catalog.length)}>
            {loading ? "VOLGENDE PAGINA LADEN…" : `MEER RAKETTEN LADEN · ${catalog.length} VAN ${total}`}
          </button>
        )}

        <div className="filter-row curated-heading"><span>UITGELICHTE TECHNISCHE DOSSIERS</span><span>{rockets.length} handmatig gecontroleerde systemen</span></div>
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
      {selected && <CatalogRocketDrawer rocket={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function CatalogRocketDrawer({ rocket, onClose }: { rocket: CatalogRocket; onClose: () => void }) {
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer catalog-drawer" onClick={(event) => event.stopPropagation()}>
        <button className="close" onClick={onClose}>×</button>
        <div className="catalog-drawer-art" style={rocket.image ? { backgroundImage: `linear-gradient(to top,#0a0d20,transparent),url("${rocket.image}")` } : undefined}>
          {!rocket.image && <span>▲</span>}
        </div>
        <span className={`catalog-drawer-status ${rocket.active === true ? "active" : rocket.active === false ? "retired" : ""}`}><i /> {rocket.active === true ? "ACTIEF" : rocket.active === false ? "HISTORISCH" : "STATUS ONBEKEND"}</span>
        <p className="provider">{rocket.manufacturer.toUpperCase()} · {rocket.country}</p>
        <h2>{rocket.name}</h2>
        <p className="drawer-description">{rocket.description}</p>
        <div className="rocket-spec-grid">
          {[
            ["FAMILIE", rocket.family],
            ["VARIANT", rocket.variant || "—"],
            ["HOOGTE", catalogNumber(rocket.length, " m")],
            ["DIAMETER", catalogNumber(rocket.diameter, " m")],
            ["STARTMASSA", catalogNumber(rocket.launchMass, " t")],
            ["LEO PAYLOAD", catalogNumber(rocket.leoCapacity, " kg")],
            ["GTO PAYLOAD", catalogNumber(rocket.gtoCapacity, " kg")],
            ["STUWKRACHT", catalogNumber(rocket.thrust, " kN")],
          ].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
        </div>
        <div className="catalog-flight-score">
          <div><span>TOTAAL</span><strong>{rocket.totalLaunches}</strong></div>
          <div><span>GESLAAGD</span><strong>{rocket.successfulLaunches}</strong></div>
          <div><span>MISLUKT</span><strong>{rocket.failedLaunches}</strong></div>
          <div><span>GEPLAND</span><strong>{rocket.pendingLaunches}</strong></div>
        </div>
        <div className="drawer-actions">
          {rocket.infoUrl && <a className="primary" href={rocket.infoUrl} target="_blank" rel="noreferrer">Officiële bron ↗</a>}
          {rocket.wikiUrl && <a href={rocket.wikiUrl} target="_blank" rel="noreferrer">Technische achtergrond ↗</a>}
        </div>
      </aside>
    </div>
  );
}

function LaunchCard({ launch }: { launch: Launch }) {
  return (
    <article className="launch-card">
      <Link className="launch-card-main" href={`/launch/${encodeURIComponent(launch.id)}`}>
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
        </div>
      </Link>
      <div className="card-action-row">
        <Link href={`/launch/${encodeURIComponent(launch.id)}`}>Missiedossier →</Link>
        <Link className="watch" href={`/launch/${encodeURIComponent(launch.id)}/watch`}>▶ {isPending(launch.status) ? "Watch center" : "Replay center"}</Link>
      </div>
    </article>
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
