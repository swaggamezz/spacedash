import type { SpaceAgency } from "@/lib/agencies";
import type { CatalogRocket } from "@/lib/launch-vehicles";
import type { Launch } from "@/lib/launches";
import { ActiveRefresh } from "@/components/active-refresh";
import { TimezoneClock } from "@/components/timezone-clock";
import Link from "next/link";

function successRate(agency: SpaceAgency) {
  const decided = agency.successfulLaunches + agency.failedLaunches;
  return decided ? `${Math.round((agency.successfulLaunches / decided) * 100)}%` : "—";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function AgencyPage({
  agency,
  rockets,
  launches,
}: {
  agency: SpaceAgency;
  rockets: CatalogRocket[];
  launches: Launch[];
}) {
  const vehicleLinks = new Map<number, { id: number; name: string; family: string; image: string | null; active: boolean | null }>();
  rockets.forEach((rocket) => vehicleLinks.set(rocket.id, rocket));
  launches.forEach((launch) => {
    const details = launch.rocketDetails;
    if (!details?.configurationId || vehicleLinks.has(details.configurationId)) return;
    vehicleLinks.set(details.configurationId, {
      id: details.configurationId,
      name: launch.rocket,
      family: details.family ?? "Launch vehicle",
      image: details.image ?? null,
      active: details.active ?? null,
    });
  });
  const vehicles = Array.from(vehicleLinks.values());

  return (
    <main className="entity-page agency-profile">
      <ActiveRefresh />
      <nav className="mission-nav">
        <Link href="/"><span>▲</span> SPACE<strong>DASH</strong></Link>
        <Link href="/">← Terug naar agentschappen</Link>
        <div className="mission-nav-links">
          <a href="#overzicht">Overzicht</a>
          <a href="#voertuigen">Voertuigen</a>
          <a href="#missies">Missies</a>
        </div>
        <TimezoneClock />
      </nav>

      <section
        className="entity-hero"
        style={agency.image ? { backgroundImage: `linear-gradient(90deg,rgba(7,8,22,.96) 25%,rgba(7,8,22,.48)),url("${agency.image}")` } : undefined}
      >
        <div className="entity-hero-grid" />
        <div className="entity-identity">
          <span>{agency.type.toUpperCase()} · {agency.country}</span>
          {agency.logo && <i style={{ backgroundImage: `url("${agency.logo}")` }} aria-label={`${agency.name} logo`} />}
          <h1>{agency.name}</h1>
          <p>{agency.abbreviation}{agency.parent ? ` · Onderdeel van ${agency.parent}` : ""}</p>
          <div>
            {agency.infoUrl && <a className="primary" href={agency.infoUrl} target="_blank" rel="noreferrer">Officiële website ↗</a>}
            {agency.wikiUrl && <a href={agency.wikiUrl} target="_blank" rel="noreferrer">Achtergrond ↗</a>}
          </div>
        </div>
      </section>

      <section className="entity-statbar">
        <div><span>TOTALE LAUNCHES</span><strong>{agency.totalLaunches}</strong></div>
        <div><span>GESLAAGD</span><strong>{agency.successfulLaunches}</strong></div>
        <div><span>SUCCESPERCENTAGE</span><strong>{successRate(agency)}</strong></div>
        <div><span>MISLUKT</span><strong>{agency.failedLaunches}</strong></div>
        <div><span>GEPLAND</span><strong>{agency.pendingLaunches}</strong></div>
      </section>

      <div className="entity-content">
        <section className="entity-main">
          <article className="entity-panel" id="overzicht">
            <div className="entity-heading"><span>01</span><div><small>ORGANISATIEDOSSIER</small><h2>Over {agency.abbreviation || agency.name}</h2></div></div>
            <p className="entity-description">{agency.description}</p>
            <div className="entity-facts">
              <div><span>TYPE</span><strong>{agency.type}</strong></div>
              <div><span>LANDCODE</span><strong>{agency.country}</strong></div>
              <div><span>OPGERICHT</span><strong>{agency.foundingYear}</strong></div>
              <div><span>LEIDING</span><strong>{agency.administrator}</strong></div>
            </div>
          </article>

          <article className="entity-panel" id="voertuigen">
            <div className="entity-heading"><span>02</span><div><small>LAUNCH SYSTEMS</small><h2>Lanceervoertuigen</h2></div></div>
            {vehicles.length ? (
              <div className="agency-vehicle-grid">
                {vehicles.map((rocket) => (
                  <Link href={`/rocket/${rocket.id}`} className="agency-vehicle-card" key={rocket.id}>
                    <div style={rocket.image ? { backgroundImage: `linear-gradient(to top,#090b1d,transparent),url("${rocket.image}")` } : undefined}>
                      {!rocket.image && <b>▲</b>}
                      <span>{rocket.active === true ? "ACTIEF" : rocket.active === false ? "HISTORISCH" : "CONFIGURATIE"}</span>
                    </div>
                    <small>{rocket.family}</small>
                    <strong>{rocket.name}</strong>
                    <em>Open technisch dossier →</em>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="entity-empty">Geen gekoppelde launcherconfiguraties in de openbare database.</div>
            )}
            {!!agency.launchers.length && (
              <div className="entity-tags">
                <span>GEREGISTREERDE LAUNCHERFAMILIES</span>
                <div>{agency.launchers.map((launcher) => <small key={launcher}>{launcher}</small>)}</div>
              </div>
            )}
          </article>

          {!!agency.spacecraft.length && (
            <article className="entity-panel">
              <div className="entity-heading"><span>03</span><div><small>SPACECRAFT</small><h2>Ruimtevaartuigen</h2></div></div>
              <div className="entity-tags large">
                <div>{agency.spacecraft.map((craft) => <small key={craft}>{craft}</small>)}</div>
              </div>
            </article>
          )}
        </section>

        <aside className="entity-side">
          <article className="entity-panel compact">
            <span className="entity-label">DATABASESTATUS</span>
            <h3>Automatisch bijgewerkt</h3>
            <p>Organisatiegegevens worden ieder uur ververst. Missiestatussen worden tijdens actief gebruik iedere minuut gecontroleerd.</p>
            <dl>
              <div><dt>Agency ID</dt><dd>{agency.id}</dd></div>
              <div><dt>Launchers gevonden</dt><dd>{vehicles.length}</dd></div>
              <div><dt>Missies geladen</dt><dd>{launches.length}</dd></div>
            </dl>
          </article>
        </aside>
      </div>

      <section className="entity-missions" id="missies">
        <div className="entity-heading"><span>04</span><div><small>MISSIEARCHIEF</small><h2>Recente en geplande launches</h2></div></div>
        {launches.length ? (
          <div className="entity-mission-grid">
            {launches.map((launch) => (
              <Link href={`/launch/${encodeURIComponent(launch.id)}`} key={launch.id}>
                <div style={launch.image ? { backgroundImage: `linear-gradient(to top,#090b1d,transparent),url("${launch.image}")` } : undefined}>
                  <span className={`status status-${launch.status}`}><i />{launch.statusLabel}</span>
                </div>
                <small>{formatDate(launch.windowStart)} · {launch.orbit}</small>
                <strong>{launch.name}</strong>
                <p>{launch.rocket}</p>
                <em>Open volledige missie →</em>
              </Link>
            ))}
          </div>
        ) : <div className="entity-empty">Geen gekoppelde missies gevonden.</div>}
      </section>

      <footer className="mission-footer">
        <span>▲ SPACEDASH</span>
        <p>Bron: Launch Library 2 · Publieke gegevens kunnen veranderen.</p>
        <Link href="/">Terug naar dashboard ↑</Link>
      </footer>
    </main>
  );
}
