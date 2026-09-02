import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/secret-admin", "/api/"],
      },
    ],
    sitemap: "https://goomairu.vercel.app/sitemap.xml",
  };
}
