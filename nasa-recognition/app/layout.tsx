import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LoadingWrapper from "@/components/LoadingWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "MSFC Book of Faces",
  description: "Recognizing the amazing people from my NASA internship experience",
  openGraph: {
    title: "MSFC Book of Faces",
    description: "An interactive digital yearbook celebrating the Spring 2025 NASA internship",
    siteName: "MSFC Book of Faces",
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${getBaseUrl()}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "MSFC Book of Faces OpenGraph Image",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "MSFC Book of Faces",
    description: "An interactive digital yearbook celebrating the Spring 2025 NASA internship",
    images: [
      {
        url: `${getBaseUrl()}/opengraph-image.png`,
        alt: "MSFC Book of Faces Twitter Card Image",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="MSFC Faces" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoadingWrapper>
          {children}
        </LoadingWrapper>
      </body>
    </html>
  );
}
