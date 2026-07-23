import { localSpaceAnswer, rockets } from "@/lib/rockets";
import { generateText } from "ai";

export const maxDuration = 20;

// Simpele in-memory throttle per IP, zodat het AI-endpoint niet onbeperkt
// Gateway-budget kan verbruiken. Reset vanzelf per serverless-instance.
const RATE_LIMIT = 20;
const RATE_WINDOW = 300_000;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string) {
  const now = Date.now();
  if (hits.size > 1000) {
    for (const [key, entry] of hits) if (entry.reset < now) hits.delete(key);
  }
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + RATE_WINDOW });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return Response.json(
      { error: "Te veel vragen achter elkaar. Probeer het over een paar minuten opnieuw." },
      { status: 429 },
    );
  }

  let body: { question?: string; context?: string };
  try {
    body = (await request.json()) as { question?: string; context?: string };
  } catch {
    return Response.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }
  const question = body.question?.trim().slice(0, 500);
  if (!question) return Response.json({ error: "Stel eerst een vraag." }, { status: 400 });

  const hasGateway = Boolean(
    process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN,
  );

  if (!hasGateway) {
    return Response.json({
      answer: localSpaceAnswer(question, body.context),
      mode: "onboard",
    });
  }

  try {
    const { text } = await generateText({
      model: process.env.SPACEDASH_AI_MODEL ?? "google/gemini-2.5-flash-lite",
      system:
        "Je bent SpaceBot, de feitelijke Nederlandstalige ruimtevaartassistent van SpaceDash. Gebruik de meegeleverde raketdata. Maak duidelijk onderscheid tussen bevestigde gegevens, doelen en schattingen. Verzin nooit live telemetrie. Antwoord compact maar technisch nuttig.",
      prompt: `Huidige context: ${body.context ?? "algemeen"}\n\nRaketdatabase:\n${JSON.stringify(rockets)}\n\nVraag: ${question}`,
      maxOutputTokens: 500,
      temperature: 0.2,
      timeout: 15_000,
    });
    return Response.json({ answer: text, mode: "ai" });
  } catch {
    return Response.json({
      answer: localSpaceAnswer(question, body.context),
      mode: "onboard",
    });
  }
}
