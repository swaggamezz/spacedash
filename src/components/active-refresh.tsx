"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// 5 minuten, in lijn met de server-side revalidate en de rate limit van Launch Library.
const REFRESH_INTERVAL = 300_000;

export function ActiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        router.refresh();
      }
    };

    const timer = window.setInterval(refreshWhenVisible, REFRESH_INTERVAL);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("online", refreshWhenVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("online", refreshWhenVisible);
    };
  }, [router]);

  return null;
}
