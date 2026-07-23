import type { CatalogRocket } from "@/lib/launch-vehicles";
import { TimezoneClock } from "@/components/timezone-clock";
import Link from "next/link";

function number(value: number | null, unit = "") {
  return value === null ? "—" : `${new Intl.NumberFormat("nl-NL").format(value)}${unit}`;
}

export function RocketPage({ rocket }: { rocket: CatalogRocket }) {
  return (
    <main className="entity-page rocket-profile">
      <nav className="mission-nav">
        <Link href="/"><span>▲</span> SPACE<strong>DASH</strong></Link>
        <Link href="/">← Terug naar raketten</Link>
        <TimezoneClock />
      </nav>
      <section
        className="entity-hero rocket-entity-hero"
        style={rocket.image ? { backgroundImage: `linear-gradient(90deg,rgba(7,8,22,.96) 28%,rgba(7,8,22,.38)),url("${rocket.image}")` } : undefined}
      >
        <div className="entity-hero-grid" />
        <div className="entity-identity">
          <span>{rocket.active === true ? "ACTIEF" : rocket.active === false ? "HISTORISCH" : "STATUS ONBEKEND"} · {rocket.country}</span>
          <h1>{rocket.name}</h1>
          <p>{rocket.manufacturer} · {rocket.family}{rocket.variant ? ` · ${rocket.variant}` : ""}</p>
          <div>
            {rocket.infoUrl && <a className="primary" href={rocket.infoUrl} target="_blank" rel="noreferrer">Officiële bron ↗</a>}
            {rocket.wikiUrl && <a href={rocket.wikiUrl} target="_blank" rel="noreferrer">Technische achtergrond ↗</a>}
          </div>
        </div>
      </section>
      <section className="entity-statbar">
        <div><span>TOTALE VLUCHTEN</span><strong>{rocket.totalLaunches}</strong></div>
        <div><span>GESLAAGD</span><strong>{rocket.successfulLaunches}</strong></div>
        <div><span>MISLUKT</span><strong>{rocket.failedLaunches}</strong></div>
        <div><span>GEPLAND</span><strong>{rocket.pendingLaunches}</strong></div>
        <div><span>HERBRUIKBAAR</span><strong>{rocket.reusable ? "JA" : "NEE"}</strong></div>
      </section>
      <div className="rocket-entity-content">
        <article className="entity-panel">
          <div className="entity-heading"><span>01</span><div><small>TECHNISCH DOSSIER</small><h2>Voertuigoverzicht</h2></div></div>
          <p className="entity-description">{rocket.description}</p>
          <div className="rocket-detail-specs">
            {[
              ["FAMILIE", rocket.family],
              ["VARIANT", rocket.variant || "—"],
              ["FABRIKANT", rocket.manufacturer],
              ["EERSTE VLUCHT", rocket.maidenFlight ?? "—"],
              ["HOOGTE", number(rocket.length, " m")],
              ["DIAMETER", number(rocket.diameter, " m")],
              ["STARTMASSA", number(rocket.launchMass, " t")],
              ["STUWKRACHT", number(rocket.thrust, " kN")],
              ["LEO PAYLOAD", number(rocket.leoCapacity, " kg")],
              ["GTO PAYLOAD", number(rocket.gtoCapacity, " kg")],
              ["GESCHATTE KOSTEN", rocket.launchCost === null ? "—" : `$${number(rocket.launchCost)}`],
              ["CONFIGURATIE-ID", String(rocket.id)],
            ].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
          </div>
        </article>
      </div>
      <footer className="mission-footer">
        <span>▲ SPACEDASH</span>
        <p>Technische gegevens uit de openbare Launch Library.</p>
        <Link href="/">Terug naar dashboard ↑</Link>
      </footer>
    </main>
  );
}
