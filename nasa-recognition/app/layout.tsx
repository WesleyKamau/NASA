import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_CONFIG } from "@/lib/configs/siteConfig";
import { SignatureCurtain } from "@/components/signature/SignatureCurtain";
import { WORDMARK_FONT_CSS } from "@/components/signature/wordmark-font";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const getBaseUrl = () => 'https://nasa.wesleykamau.com';

const siteUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.shortDescription,
    url: siteUrl,
    siteName: SITE_CONFIG.title,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [`${siteUrl}/og.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
};

// Viewport configuration for proper mobile handling (especially iOS Safari)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 3,
  userScalable: true,
  viewportFit: 'cover', // Important for notched devices and Safari
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    url: getBaseUrl(),
  };

  return (
    <html lang="en" style={{ backgroundColor: '#000' }}>
      <head>
        {/* Wordmark font subset + signature loading curtain — must stay first
            and synchronous so the sheet exists before anything paints */}
        <style dangerouslySetInnerHTML={{ __html: WORDMARK_FONT_CSS }} />
        <SignatureCurtain />
        {/* Apple/iOS specific meta tags for native-like experience */}
        <meta name="apple-mobile-web-app-title" content="MSFC Faces" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="color-scheme" content="dark" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased touch-native scroll-native no-overscroll`}
        style={{ backgroundColor: '#000' }}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[10000] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
