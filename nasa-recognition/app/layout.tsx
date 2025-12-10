import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nasa-internship-recognition.vercel.app'),
  title: "NASA Internship Recognition",
  description: "Recognizing the amazing people from my NASA internship experience",
  icons: {
    icon: [
      { url: '/favicon.png', sizes: 'any' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: "NASA Internship Recognition",
    description: "An interactive digital yearbook celebrating the Spring 2025 NASA internship",
    url: "https://yourwebsite.com",
    siteName: "NASA Internship Recognition",
    images: [
      {
        url: '/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'NASA Internship Recognition Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "NASA Internship Recognition",
    description: "An interactive digital yearbook celebrating the Spring 2025 NASA internship",
    images: ['/og-preview.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
