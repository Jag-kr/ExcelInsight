import { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import { Providers } from "./providers";
import "./globals.css";

const SITE_URL = 'https://excelinsight.xyz';
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
      { url: '/logo.svg', type: 'image/svg+xml' },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* AdSense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2734357253126302" crossOrigin="anonymous"></script>
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
