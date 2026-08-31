import { NextRequest } from "next/server";

export interface ClientIpInfo {
  ip: string;
  version: "IPv4" | "IPv6" | "Localhost";
  country?: string;
  city?: string;
  userAgent?: string;
}

export function getRealIp(req: NextRequest): ClientIpInfo {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  const vercelIp = req.headers.get("x-vercel-forwarded-for");

  // Get raw IP candidate
  let rawIp =
    cfConnectingIp ||
    (forwarded ? forwarded.split(",")[0].trim() : null) ||
    realIp ||
    vercelIp ||
    "127.0.0.1";

  // Clean ipv6 prefix if mapped ipv4 (e.g. ::ffff:192.168.1.1)
  if (rawIp.startsWith("::ffff:")) {
    rawIp = rawIp.replace("::ffff:", "");
  }

  let version: "IPv4" | "IPv6" | "Localhost" = "IPv4";
  if (rawIp === "127.0.0.1" || rawIp === "::1") {
    version = "Localhost";
  } else if (rawIp.includes(":")) {
    version = "IPv6";
  } else {
    version = "IPv4";
  }

  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-country-code") ||
    undefined;

  const city =
    req.headers.get("x-vercel-ip-city") ||
    req.headers.get("x-city") ||
    undefined;

  const userAgent = req.headers.get("user-agent") || undefined;

  return {
    ip: rawIp,
    version,
    country,
    city,
    userAgent,
  };
}
