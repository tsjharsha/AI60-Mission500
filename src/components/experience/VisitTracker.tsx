"use client";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/trackEvent";
import { useAppStore } from "@/store/useAppStore";
export default function VisitTracker() {
  const setContext = useAppStore((s) => s.setReferralContext);
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const source = search.get("source") || "direct";
    const squadCode = search.get("squad") || undefined;
    const referrerId = search.get("ref") || undefined;
    if (search.has("source") || squadCode || referrerId)
      setContext({ source, squadCode, referrerId });
    void trackEvent("landing_view", { source });
  }, [setContext]);
  return null;
}
