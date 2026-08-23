import { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import { Providers } from "./providers";
import { SITE_URL } from '@/lib/site';
import "./globals.css";

/**
 * Self-hosted via next/font rather than the `@import url(fonts.googleapis.com)`
 * that used to sit at the top of globals.css. That import was render-blocking on
 * a third-party origin — the browser could not paint until it resolved — which
 * is the single largest contributor to the page feeling slow, regardless of how
 * well the animations are tuned.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-mono",
});

const OG_IMAGE = 'https://storage.googleapis.com/gpt-engineer-file-uploads/neEqO6MCG2bHfGf0v6pME35dIMA2/social-images/social-1774898677243-ExcelInsight.webp';

export const metadata: Metadata = {
  title: "ExcelInsight – Excel Insights, Chart Maker & Free Dashboard Builder Online",
  description: "Free online Excel insights, chart maker & dashboard builder. Analyse Excel data, make bar graphs, line charts & CSV dashboards instantly. No signup, 100% private.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "ExcelInsight – Excel Insights, Chart Maker & Free Dashboard Builder Online",
    description: "Free online Excel insights, chart maker & dashboard builder. Analyse Excel data, make bar graphs, line charts & CSV dashboards instantly. No signup, 100% private.",
    url: SITE_URL,
    siteName: "ExcelInsight",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "ExcelInsight – Excel analytics, visualization, and dashboard builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ExcelInsight – Excel Insights, Chart Maker & Free Dashboard Builder Online",
    description: "Free online Excel insights, chart maker & dashboard builder. Analyse Excel data, make bar graphs, line charts & CSV dashboards instantly. No signup, 100% private.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/logo-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
