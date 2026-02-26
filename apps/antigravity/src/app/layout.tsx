import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  let siteName = "Enterprise Knowledge Platform";
  let description = "Unified Training, Knowledge, Adoption & Suggestion platform";
  let favicon = "/favicon.ico";

  try {
    const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${API_BASE}/api/settings`, { cache: 'no-store' }); // Don't aggressively cache to show updates
    if (res.ok) {
      const settings = await res.json();
      const siteNameSetting = settings.find((s: any) => s.key === "site_name");
      const faviconSetting = settings.find((s: any) => s.key === "favicon");
      if (siteNameSetting?.value) siteName = siteNameSetting.value;
      if (faviconSetting?.value) {
        // If it's a backend static file, make sure it's routed properly
        favicon = faviconSetting.value.startsWith('/api')
          ? `${API_BASE}${faviconSetting.value}`
          : faviconSetting.value;
      }
    }
  } catch (e) {
    console.error("Failed to fetch settings for metadata");
  }

  return {
    title: siteName,
    description,
    icons: {
      icon: favicon,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
