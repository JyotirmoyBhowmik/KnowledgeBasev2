import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  let siteName = "Enterprise Knowledge Platform";
  let description = "Unified Training, Knowledge, Adoption & Suggestion platform";
  let favicon = ""; // Default empty string to avoid missing file errors

  try {
    const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${API_BASE}/api/settings`, { cache: 'no-store' }); // Don't aggressively cache
    if (res.ok) {
      const settings = await res.json();
      const siteNameSetting = settings.find((s: any) => s.key === "site_name");
      const faviconSetting = settings.find((s: any) => s.key === "favicon");
      if (siteNameSetting?.value) siteName = siteNameSetting.value;
      if (faviconSetting?.value) {
        favicon = faviconSetting.value.startsWith('/api')
          ? `${API_BASE}${faviconSetting.value}`
          : faviconSetting.value;
      }
    }
  } catch (e) {
    // Fail silently during build if backend is down
  }

  const metadata: Metadata = {
    title: siteName,
    description,
  };

  if (favicon) {
    metadata.icons = { icon: favicon };
  }

  return metadata;
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
