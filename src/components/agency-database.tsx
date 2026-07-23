"use client";

import type { SpaceAgency } from "@/lib/agencies";
import { useEffect, useMemo, useState } from "react";

type AgencyFilter = "all" | "government" | "commercial" | "multinational";

function successRate(agency: SpaceAgency) {
  const decided = agency.successfulLaunches + agency.failedLaunches;
  if (!decided) return "—";
  return `${Math.round((agency.successfulLaunches / decided) * 100)}%`;
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("nl-NL", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function matchesType(agency: SpaceAgency, filter: AgencyFilter) {
  if (filter === "all") return true;
  const type = agency.type.toLowerCase();
  if (filter === "government") return /government|national|military/.test(type);
  if (filter === "commercial") return /commercial|private/.test(type);
  return /multinational|intergovernmental/.test(type);
}

export function AgencyDatabase() {
  const [agencies, setAgencies] = useState<SpaceAgency[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [resultQuery, setResultQuery] = useState("");
  const [filter, setFilter] = useState<AgencyFilter>("all");
  const [country, setCountry] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<SpaceAgency | null>(null);

  async function loadAgencies(offset: number, search: string, signal?: AbortSignal) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ offset: String(offset) });
      if (search.trim().length >= 2) params.set("q", search.trim());
      const response = await fetch(`/api/agencies?${params}`, { signal });
      const data = (await response.json()) as { count?: number; agencies?: SpaceAgency[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Agentschappen laden mislukt.");
      setAgencies((current) => offset === 0 ? data.agencies ?? [] : [...current, ...(data.agencies ?? [])]);
      setTotal(data.count ?? 0);
      setResultQuery(search.trim());
    } catch (loadError) {
      if (loadError instanceof DOMException && loadError.name === "AbortError") return;
      setError(loadError instanceof Error ? loadError.message : "Agentschappen laden mislukt.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(
      () => void loadAgencies(0, query, controller.signal),
      query.trim().length >= 2 ? 350 : 0,
    );
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const countries = useMemo(
    () => Array.from(new Set(agencies.map((agency) => agency.country).filter((value) => value !== "—"))).sort(),
    [agencies],
  );
  const visible = useMemo(
    () => agencies.filter((agency) => matchesType(agency, filter) && (country === "all" || agency.country === country)),
    [agencies, country, filter],
  );

  return (
    <>
      <section className="agency-database">
        <div className="catalog-heading">
          <div>
            <span>WERELDWIJDE MISSIEOPERATORS</span>
            <h2>Agentschappendatabase</h2>
            <p>Ruimtevaartagentschappen, commerciële launchproviders en internationale organisaties uit de openbare catalogus.</p>
          </div>
          <strong>{total || "350"}<small> organisaties</small></strong>
        </div>

        <div className="agency-controls">
          <label className="agency-search">
            <span>⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek NASA, ESA, SpaceX, ISRO…" />
          </label>
          <div className="agency-filters">
            {([
              ["all", "Alle"],
              ["government", "Overheid"],
              ["commercial", "Commercieel"],
              ["multinational", "Internationaal"],
            ] as const).map(([value, label]) => (
              <button aria-pressed={filter === value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)} key={value}>{label}</button>
            ))}
          </div>
          <select aria-label="Filter op landcode" value={country} onChange={(event) => setCountry(event.target.value)}>
            <option value="all">Alle landen</option>
            {countries.map((code) => <option value={code} key={code}>{code}</option>)}
          </select>
        </div>

        {error && <div className="catalog-state error">{error}</div>}
        {loading && !agencies.length && <div className="catalog-state"><i /> Wereldwijde agentschappen laden…</div>}
        <div className="agency-grid">
          {visible.map((agency) => (
            <button className="agency-card" onClick={() => setSelected(agency)} key={agency.id}>
              <div
                className="agency-card-visual"
                style={agency.image ? { backgroundImage: `linear-gradient(110deg,#080b1b 15%,rgba(8,11,27,.25)),url("${agency.image}")` } : undefined}
              >
                {agency.logo
                  ? <span className="agency-card-logo" style={{ backgroundImage: `url("${agency.logo}")` }} aria-label={`${agency.name} logo`} />
                  : <b>{agency.abbreviation.slice(0, 4) || agency.name.slice(0, 2).toUpperCase()}</b>}
                <span className="agency-type">{agency.type}</span>
              </div>
              <div className="agency-card-copy">
                <small>{agency.country} · OPGERICHT {agency.foundingYear}</small>
                <strong>{agency.name}</strong>
                <span>{agency.abbreviation || agency.administrator}</span>
                <dl>
                  <div><dt>Launches</dt><dd>{compactNumber(agency.totalLaunches)}</dd></div>
                  <div><dt>Succes</dt><dd>{successRate(agency)}</dd></div>
                  <div><dt>Gepland</dt><dd>{agency.pendingLaunches}</dd></div>
                </dl>
              </div>
            </button>
          ))}
        </div>
        {!loading && !visible.length && !error && (
          <div className="catalog-state">
            Geen agentschappen gevonden{resultQuery ? ` voor “${resultQuery}”` : " met deze filters"}.
          </div>
        )}
        {agencies.length < total && (
          <button className="catalog-more" disabled={loading} onClick={() => void loadAgencies(agencies.length, resultQuery)}>
            {loading ? "VOLGENDE PAGINA LADEN…" : `MEER ORGANISATIES LADEN · ${agencies.length} VAN ${total}`}
          </button>
        )}
      </section>
      {selected && <AgencyDrawer agency={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function AgencyDrawer({ agency, onClose }: { agency: SpaceAgency; onClose: () => void }) {
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer agency-drawer" onClick={(event) => event.stopPropagation()}>
        <button className="close" onClick={onClose}>×</button>
        <div
          className="agency-drawer-hero"
          style={agency.image ? { backgroundImage: `linear-gradient(to top,#0a0d20,rgba(10,13,32,.2)),url("${agency.image}")` } : undefined}
        >
          {agency.logo && <span style={{ backgroundImage: `url("${agency.logo}")` }} />}
        </div>
        <p className="provider">{agency.type.toUpperCase()} · {agency.country}</p>
        <h2>{agency.name}</h2>
        <p className="agency-subtitle">{agency.abbreviation}{agency.parent ? ` · onderdeel van ${agency.parent}` : ""}</p>
        <p className="drawer-description">{agency.description}</p>
        <div className="rocket-spec-grid">
          {[
            ["OPGERICHT", agency.foundingYear],
            ["LEIDING", agency.administrator],
            ["LANDCODE", agency.country],
            ["TYPE", agency.type],
          ].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
        </div>
        <div className="catalog-flight-score">
          <div><span>TOTAAL</span><strong>{agency.totalLaunches}</strong></div>
          <div><span>GESLAAGD</span><strong>{agency.successfulLaunches}</strong></div>
          <div><span>MISLUKT</span><strong>{agency.failedLaunches}</strong></div>
          <div><span>GEPLAND</span><strong>{agency.pendingLaunches}</strong></div>
        </div>
        {!!agency.launchers.length && <AgencyAssets label="RAKETTEN & LAUNCHERS" items={agency.launchers} />}
        {!!agency.spacecraft.length && <AgencyAssets label="RUIMTEVAARTUIGEN" items={agency.spacecraft} />}
        <div className="drawer-actions">
          {agency.infoUrl && <a className="primary" href={agency.infoUrl} target="_blank" rel="noreferrer">Officiële website ↗</a>}
          {agency.wikiUrl && <a href={agency.wikiUrl} target="_blank" rel="noreferrer">Achtergrond ↗</a>}
        </div>
      </aside>
    </div>
  );
}

function AgencyAssets({ label, items }: { label: string; items: string[] }) {
  return (
    <section className="agency-assets">
      <span>{label}</span>
      <div>{items.map((item) => <small key={item}>{item}</small>)}</div>
    </section>
  );
}
