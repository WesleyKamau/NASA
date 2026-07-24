import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lottie Preview",
  robots: { index: false, follow: false },
};

export default function LottiePreviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
