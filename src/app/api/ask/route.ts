import { localSpaceAnswer, rockets } from "@/lib/rockets";
import { generateText } from "ai";

export const maxDuration = 20;

export async function POST(request: Request) {
  const body = (await request.json()) as { question?: string; context?: string };
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
