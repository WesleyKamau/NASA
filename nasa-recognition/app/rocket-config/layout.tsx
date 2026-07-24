import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rocket Config",
  robots: { index: false, follow: false },
};

export default function RocketConfigLayout({ children }: { children: React.ReactNode }) {
  return children;
}
