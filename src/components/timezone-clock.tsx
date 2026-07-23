"use client";

import { useEffect, useState } from "react";

const zones = [
  { value: "UTC", label: "UTC" },
  { value: "Europe/Amsterdam", label: "Amsterdam" },
  { value: "America/New_York", label: "New York" },
  { value: "America/Los_Angeles", label: "Los Angeles" },
  { value: "America/Chicago", label: "Starbase" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Australia/Sydney", label: "Sydney" },
];

function clockTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("nl-NL", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function TimezoneClock() {
  const [now, setNow] = useState<Date | null>(null);
  const [zone, setZone] = useState("UTC");

  useEffect(() => {
    const initialize = window.setTimeout(() => {
      const saved = window.localStorage.getItem("spacedash-timezone");
      if (saved && zones.some((item) => item.value === saved)) setZone(saved);
      setNow(new Date());
    }, 0);
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => {
      window.clearTimeout(initialize);
      window.clearInterval(timer);
    };
  }, []);

  function updateZone(value: string) {
    setZone(value);
    window.localStorage.setItem("spacedash-timezone", value);
  }

  return (
    <div className="utc timezone-clock">
      <select aria-label="Tijdzone" value={zone} onChange={(event) => updateZone(event.target.value)}>
        {zones.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
      </select>
      <strong suppressHydrationWarning>{now ? clockTime(now, zone) : "--:--:--"}</strong>
    </div>
  );
}
