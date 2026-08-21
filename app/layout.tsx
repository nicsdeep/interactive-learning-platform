import type { Metadata } from "next";
import { DM_Serif_Display, Manrope } from "next/font/google";
import "./globals.css";
import "./reference-theme.css";
import "./trussline.css";
import "./experience-preview.css";
import "./curricula.css";
import "./audience.css";

const display = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Trussline International | Interactive Learning",
  description: "International interactive learning shaped by curriculum intelligence and adaptive mastery.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${display.variable} ${sans.variable}`}>{children}</body></html>;
}
