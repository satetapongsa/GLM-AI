import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Goomairu AI",
    short_name: "Goomairu",
    description: "Goomairu AI",
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
