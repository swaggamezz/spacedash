"use client";

import type { SpaceAgency } from "@/lib/agencies";
import Link from "next/link";
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
            <Link className="agency-card" href={`/agency/${agency.id}`} key={agency.id}>
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
            </Link>
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
  );
}
