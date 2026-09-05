import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://devgya.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/why-choose-us",
          "/faq",
          "/safety-standards",
          "/pricing",
          "/privacy-policy",
          "/terms-of-service",
          "/login",
          "/register",
        ],
        disallow: ["/api/", "/admin/", "/dashboard/"],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/about",
          "/why-choose-us",
          "/faq",
          "/safety-standards",
          "/pricing",
          "/privacy-policy",
          "/terms-of-service",
          "/login",
          "/register",
        ],
        disallow: ["/api/", "/admin/", "/dashboard/"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/*.png$", "/*.jpg$", "/*.webp$", "/*.svg$"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
