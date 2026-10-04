"use client";

import { useEffect, useState } from "react";

export function useMissionPulse() {
  const [pulse, setPulse] = useState<{ count: number; mode: string } | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/growth-metrics", { signal: controller.signal })
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("Metrics unavailable")),
      )
      .then((data) => {
        if (
          typeof data.registrations === "number" &&
          typeof data.mode === "string"
        )
          setPulse({ count: data.registrations, mode: data.mode });
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return pulse;
}
