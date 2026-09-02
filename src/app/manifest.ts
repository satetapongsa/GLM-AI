import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Goomairu AI — ผู้ช่วยเอไออัจฉริยะภาษาไทย",
    short_name: "Goomairu",
    description: "ผู้ช่วยเอไออัจฉริยะภาษาไทย ตอบทุกคำถาม วางแผนงาน และเขียนโค้ดได้อย่างมีประสิทธิภาพ",
    start_url: "/",
    display: "standalone",
    background_color: "#131314",
    theme_color: "#131314",
    lang: "th",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
