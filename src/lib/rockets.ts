export type Rocket = {
  id: string;
  name: string;
  maker: string;
  country: string;
  status: string;
  role: string;
  summary: string;
  height: string;
  diameter: string;
  mass: string;
  payloadLeo: string;
  payloadOther: string;
  stages: number;
  reusable: string;
  propellant: string;
  engines: Array<{
    name: string;
    count: string;
    cycle: string;
    propellant: string;
    thrust: string;
  }>;
  facts: string[];
};

export const rockets: Rocket[] = [
  {
    id: "starship",
    name: "Starship",
    maker: "SpaceX",
    country: "Verenigde Staten",
    status: "In ontwikkeling / testvluchten",
    role: "Volledig herbruikbaar super-heavy transportsysteem",
    summary:
      "Starship bestaat uit de Super Heavy-booster en het Starship-ruimteschip. Beide trappen gebruiken methaan en vloeibare zuurstof en zijn ontworpen om verticaal te landen en opnieuw te vliegen.",
    height: "ca. 123 m",
    diameter: "9 m",
    mass: "ca. 5.000 t volgetankt",
    payloadLeo: "100–150+ t herbruikbaar (doel)",
    payloadOther: "Maan en Mars met tanken in een baan om de aarde",
    stages: 2,
    reusable: "Beide trappen",
    propellant: "CH₄ / LOX",
    engines: [
      { name: "Raptor 3", count: "33 op Super Heavy", cycle: "Full-flow staged combustion", propellant: "Methaan / LOX", thrust: "ca. 2,7 MN per motor" },
      { name: "Raptor Vacuum", count: "3 op Ship", cycle: "Full-flow staged combustion", propellant: "Methaan / LOX", thrust: "Vacuümgeoptimaliseerd" },
      { name: "Raptor sea-level", count: "3 op Ship", cycle: "Full-flow staged combustion", propellant: "Methaan / LOX", thrust: "Gimbalbaar voor landing" },
    ],
    facts: [
      "Grootste en krachtigste raketsysteem dat ooit heeft gevlogen.",
      "Super Heavy kan door de lanceertoren met de 'chopsticks' worden opgevangen.",
      "Het hitteschild bestaat uit duizenden afzonderlijke keramische tegels.",
      "Tankervarianten moeten Starship in een baan om de aarde bijtanken.",
      "Een aangepaste versie is geselecteerd als maanlander voor NASA Artemis.",
    ],
  },
  {
    id: "falcon-9",
    name: "Falcon 9 Block 5",
    maker: "SpaceX",
    country: "Verenigde Staten",
    status: "Operationeel",
    role: "Medium-lift orbitale draagraket",
    summary: "De werkpaardraket van SpaceX met een herbruikbare eerste trap en zeer hoge vluchtfrequentie.",
    height: "70 m",
    diameter: "3,7 m",
    mass: "549 t",
    payloadLeo: "22,8 t expendable",
    payloadOther: "8,3 t naar GTO",
    stages: 2,
    reusable: "Eerste trap en fairings",
    propellant: "RP-1 / LOX",
    engines: [
      { name: "Merlin 1D", count: "9 eerste trap", cycle: "Gas-generator", propellant: "RP-1 / LOX", thrust: "ca. 845 kN per motor" },
      { name: "Merlin Vacuum", count: "1 tweede trap", cycle: "Gas-generator", propellant: "RP-1 / LOX", thrust: "ca. 981 kN vacuüm" },
    ],
    facts: ["Landt op droneships of op land.", "Kan Crew Dragon en Cargo Dragon lanceren.", "Block 5 is ontworpen voor veelvuldig hergebruik."],
  },
  {
    id: "new-glenn",
    name: "New Glenn",
    maker: "Blue Origin",
    country: "Verenigde Staten",
    status: "Operationeel / opschaling",
    role: "Heavy-lift herbruikbare draagraket",
    summary: "Een zware methaanraket met een herbruikbare eerste trap en een uitzonderlijk grote neuskegel.",
    height: "98 m",
    diameter: "7 m",
    mass: "Niet volledig gepubliceerd",
    payloadLeo: "45 t",
    payloadOther: "13,6 t naar GTO",
    stages: 2,
    reusable: "Eerste trap",
    propellant: "CH₄ / LOX en LH₂ / LOX",
    engines: [
      { name: "BE-4", count: "7 eerste trap", cycle: "Oxygen-rich staged combustion", propellant: "Methaan / LOX", thrust: "ca. 2,4 MN per motor" },
      { name: "BE-3U", count: "2 tweede trap", cycle: "Expander bleed", propellant: "Waterstof / LOX", thrust: "Vacuümgeoptimaliseerd" },
    ],
    facts: ["De fairing heeft een diameter van zeven meter.", "De booster landt op een schip op zee.", "Gebruikt dezelfde BE-4-motorfamilie als Vulcan."],
  },
  {
    id: "ariane-6",
    name: "Ariane 6",
    maker: "ArianeGroup",
    country: "Europa",
    status: "Operationeel",
    role: "Europese medium/heavy-lift draagraket",
    summary: "Europa's modulaire opvolger van Ariane 5, beschikbaar met twee of vier vastebrandstofboosters.",
    height: "62 m",
    diameter: "5,4 m",
    mass: "530–860 t",
    payloadLeo: "ca. 21,6 t (A64)",
    payloadOther: "ca. 11,5 t naar GTO",
    stages: 2,
    reusable: "Nee",
    propellant: "LH₂ / LOX + vaste brandstof",
    engines: [
      { name: "Vulcain 2.1", count: "1 core", cycle: "Gas-generator", propellant: "Waterstof / LOX", thrust: "ca. 1,37 MN" },
      { name: "Vinci", count: "1 upper stage", cycle: "Expander", propellant: "Waterstof / LOX", thrust: "ca. 180 kN" },
      { name: "P120C", count: "2 of 4 boosters", cycle: "Vaste brandstof", propellant: "HTPB-composiet", thrust: "ca. 4,5 MN per booster" },
    ],
    facts: ["De Vinci-boventrap kan meerdere keren herstarten.", "A62 gebruikt twee boosters; A64 gebruikt er vier.", "Wordt gelanceerd vanuit Frans-Guyana."],
  },
  {
    id: "sls",
    name: "Space Launch System",
    maker: "NASA / Boeing / Northrop Grumman",
    country: "Verenigde Staten",
    status: "Operationeel",
    role: "Super-heavy bemande maanraket",
    summary: "NASA's draagraket voor Orion en Artemis, afgeleid van Space Shuttle-technologie.",
    height: "98–111 m",
    diameter: "8,4 m core",
    mass: "ca. 2.600 t",
    payloadLeo: "95–130 t afhankelijk van variant",
    payloadOther: "27+ t richting maan",
    stages: 2,
    reusable: "Nee",
    propellant: "LH₂ / LOX + vaste brandstof",
    engines: [
      { name: "RS-25", count: "4 core stage", cycle: "Staged combustion", propellant: "Waterstof / LOX", thrust: "ca. 2,3 MN per motor" },
      { name: "Solid Rocket Booster", count: "2", cycle: "Vaste brandstof", propellant: "PBAN/AP/Al", thrust: "ca. 16 MN per booster" },
    ],
    facts: ["De RS-25-motor komt voort uit de Space Shuttle Main Engine.", "Ontworpen voor Orion-missies naar de maan.", "Block 1B en Block 2 krijgen meer vrachtcapaciteit."],
  },
  {
    id: "electron",
    name: "Electron",
    maker: "Rocket Lab",
    country: "Verenigde Staten / Nieuw-Zeeland",
    status: "Operationeel",
    role: "Small-lift draagraket",
    summary: "Lichte koolstofvezelraket voor kleine satellieten, met elektrisch aangedreven brandstofpompen.",
    height: "18 m",
    diameter: "1,2 m",
    mass: "ca. 13 t",
    payloadLeo: "300 kg",
    payloadOther: "ca. 200 kg naar SSO",
    stages: 2,
    reusable: "Herstel eerste trap in ontwikkeling",
    propellant: "RP-1 / LOX",
    engines: [
      { name: "Rutherford", count: "9 eerste trap + 1 vacuüm", cycle: "Elektrische pompen", propellant: "RP-1 / LOX", thrust: "ca. 25 kN per motor" },
    ],
    facts: ["Eerste orbitale raket met accugevoede elektrische turbopompen.", "Hoofdstructuur bestaat uit koolstofvezel.", "Kick Stage maakt precieze plaatsing van meerdere payloads mogelijk."],
  },
];

export const starshipTimeline = [
  { time: "T−01:15:00", event: "Propellant load", detail: "Methaan en vloeibare zuurstof worden geladen.", kind: "prep" },
  { time: "T−00:10:00", event: "Final launch poll", detail: "Launch director controleert alle stations.", kind: "prep" },
  { time: "T−00:00:10", event: "Flame deflector active", detail: "Water deluge-systeem beschermt de lanceerbasis.", kind: "ignition" },
  { time: "T+00:00:00", event: "Liftoff", detail: "33 Raptor-motoren brengen het voertuig van de toren.", kind: "ignition" },
  { time: "T+00:01:02", event: "Max Q", detail: "Hoogste aerodynamische belasting.", kind: "flight" },
  { time: "T+00:02:40", event: "Hot-stage separation", detail: "Starship ontsteekt terwijl Super Heavy nog stuwkracht levert.", kind: "stage" },
  { time: "T+00:03:35", event: "Booster boostback", detail: "Super Heavy keert terug richting Starbase.", kind: "flight" },
  { time: "T+00:06:30", event: "Booster landing burn", detail: "Laatste remmanoeuvre of poging tot tower catch.", kind: "landing" },
  { time: "T+00:08:30", event: "Ship engine cutoff", detail: "Starship bereikt de geplande coastfase.", kind: "stage" },
  { time: "T+00:47:00", event: "Entry interface", detail: "Starship komt de atmosfeer binnen op de buikzijde.", kind: "flight" },
  { time: "T+01:03:00", event: "Flip & landing burn", detail: "Overgang naar verticale landing.", kind: "landing" },
];

export function findRocket(name: string) {
  const needle = name.toLowerCase();
  return rockets.find(
    (rocket) =>
      needle.includes(rocket.name.toLowerCase()) ||
      rocket.name.toLowerCase().includes(needle) ||
      (needle.includes("starship") && rocket.id === "starship"),
  );
}

export function localSpaceAnswer(question: string, context?: string) {
  const q = question.toLowerCase();
  const selected = findRocket(`${context ?? ""} ${q}`) ?? rockets[0];
  if (/raptor|motor|engine|stuwkracht/.test(q)) {
    return `${selected.name} gebruikt ${selected.engines.map((engine) => `${engine.count} × ${engine.name} (${engine.propellant}, ${engine.thrust})`).join("; ")}.`;
  }
  if (/hoog|lengte|groot|diameter/.test(q)) {
    return `${selected.name} is ${selected.height} hoog en heeft een diameter van ${selected.diameter}. De opgegeven startmassa is ${selected.mass}.`;
  }
  if (/payload|lading|meenemen|capaciteit/.test(q)) {
    return `${selected.name} kan volgens de huidige openbare specificaties ${selected.payloadLeo} naar een lage baan om de aarde brengen. ${selected.payloadOther}.`;
  }
  if (/brandstof|methaan|lox|kerosine|waterstof/.test(q)) {
    return `${selected.name} gebruikt ${selected.propellant}. ${selected.engines.map((engine) => `${engine.name}: ${engine.propellant}`).join("; ")}.`;
  }
  if (/herbruik|landen|catch|chopstick/.test(q)) {
    return `${selected.name}: hergebruik — ${selected.reusable}. ${selected.facts.find((fact) => /land|opvang|chop|hergebruik/i.test(fact)) ?? selected.facts[0]}`;
  }
  if (/verschil|vergelijk/.test(q)) {
    const other = rockets.find((rocket) => rocket.id !== selected.id && q.includes(rocket.name.toLowerCase())) ?? rockets[1];
    return `${selected.name} versus ${other.name}: ${selected.height} vs. ${other.height} hoog, ${selected.payloadLeo} vs. ${other.payloadLeo} naar LEO, en hergebruik “${selected.reusable}” vs. “${other.reusable}”.`;
  }
  return `${selected.name} is een ${selected.role.toLowerCase()} van ${selected.maker}. ${selected.summary} Vraag bijvoorbeeld naar motoren, brandstof, afmetingen, payload of hergebruik.`;
}
