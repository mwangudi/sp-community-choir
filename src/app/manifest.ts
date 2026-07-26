import type { MetadataRoute } from "next";
import { CHOIR } from "@/lib/choir";

/** PWA manifest — lets members install the site to their home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: CHOIR.name,
    short_name: CHOIR.shortName,
    description: CHOIR.intro,
    start_url: "/",
    display: "standalone",
    background_color: "#F7F5F2",
    theme_color: "#BC0424",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
