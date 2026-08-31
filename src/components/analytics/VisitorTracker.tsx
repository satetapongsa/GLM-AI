"use client";

import { useEffect } from "react";

export function VisitorTracker() {
  useEffect(() => {
    // Non-blocking silent background ping to record real visitor IP and increment visit count
    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch(() => {
        // Silently ignore network failures on client
      });
    } catch {
      // ignore
    }
  }, []);

  return null;
}
