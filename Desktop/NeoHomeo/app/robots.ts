import type { MetadataRoute } from "next";

const BASE_URL = "https://www.neohomeo.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register"],
        disallow: [
          "/admin/",
          "/doctor/",
          "/patient/",
          "/student/",
          "/api/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
