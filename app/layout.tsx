import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import SiteFooter from "./site-footer";
import "./globals.css";
import "./reference-theme.css";
import "./trussline.css";
import "./experience-preview.css";
import "./curricula.css";
import "./audience.css";
import "./trussline-theme.css";
import "./home-refined.css";
import "./site-footer.css";
import "./brand-logo.css";

const display = Fraunces({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-display" });
const sans = Inter({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-sans" });
const code = JetBrains_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-code" });

export const metadata: Metadata = {
  title: "Trussline International | Interactive Learning",
  description: "International interactive learning shaped by curriculum intelligence and adaptive mastery.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${display.variable} ${sans.variable} ${code.variable}`}>{children}<SiteFooter /></body></html>;
}
