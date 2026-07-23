"use client";

import { FormEvent, useState } from "react";

type Message = { role: "assistant" | "user"; text: string; mode?: string };

const suggestions = [
  "Hoe werkt een Raptor-motor?",
  "Waarom gebruikt Starship methaan?",
  "Vergelijk Starship met Falcon 9",
  "Hoe werkt hot staging?",
];

export function SpaceAssistant({ context = "Starship" }: { context?: string }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: `Ik ben SpaceBot. Vraag me alles over ${context}, raketmotoren of missies. Zonder Gateway gebruik ik de gratis boordcomputer.` },
  ]);

  async function ask(text: string) {
    if (!text.trim() || loading) return;
    setOpen(true);
    setQuestion("");
    setMessages((current) => [...current, { role: "user", text }]);
    setLoading(true);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, context }),
      });
      const data = (await response.json()) as { answer?: string; mode?: string; error?: string };
      setMessages((current) => [
        ...current,
        { role: "assistant", text: data.answer ?? data.error ?? "Geen antwoord ontvangen.", mode: data.mode },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", text: "De verbinding is onderbroken. Probeer het nog eens.", mode: "offline" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }

  return (
    <>
      <button className="spacebot-launcher" onClick={() => setOpen((value) => !value)}>
        <span>✦</span><b>SpaceBot</b><i />
      </button>
      {open && (
        <section className="spacebot">
          <header className="spacebot-head">
            <div><span>✦</span><div><strong>SpaceBot</strong><small>RAKETASSISTENT</small></div></div>
            <button onClick={() => setOpen(false)}>×</button>
          </header>
          <div className="spacebot-messages">
            {messages.map((message, index) => (
              <div className={`spacebot-message ${message.role}`} key={`${message.role}-${index}`}>
                <p>{message.text}</p>
                {message.role === "assistant" && message.mode && (
                  <small>{message.mode === "ai" ? "✦ AI GATEWAY" : "◈ GRATIS BOORDCOMPUTER"}</small>
                )}
              </div>
            ))}
            {loading && <div className="spacebot-message assistant loading-dots"><i /><i /><i /></div>}
          </div>
          {messages.length < 3 && (
            <div className="spacebot-suggestions">
              {suggestions.map((item) => <button onClick={() => void ask(item)} key={item}>{item}</button>)}
            </div>
          )}
          <form onSubmit={submit}>
            <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Vraag iets over ruimtevaart…" maxLength={500} />
            <button disabled={!question.trim() || loading}>↑</button>
          </form>
          <footer>Antwoorden kunnen fouten bevatten · live data wordt nooit verzonnen</footer>
        </section>
      )}
    </>
  );
}
