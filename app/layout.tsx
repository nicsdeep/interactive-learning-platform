import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kora | Adaptive learning",
  description: "Curriculum intelligence, interactive learning, and adaptive mastery.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
