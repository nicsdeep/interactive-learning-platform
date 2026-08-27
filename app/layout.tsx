import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import SiteFooter from "./site-footer";
import BrandPreviewBridge from "./brand-preview-bridge";
import BrandSettingsSync from "./brand-settings-sync";
import { getBrandLogoCssVariables, getSiteBrandSettings } from "@/lib/site-brand-settings";
import "./globals.css";
import "./reference-theme.css";
import "./trussline.css";
import "./experience-preview.css";
import "./curricula.css";
import "./audience.css";
import "./trussline-theme.css";
import "./home-refined.css";
import "./location-panel.css";
import "./about/about.css";
import "./site-footer.css";
import "./brand-logo.css";
import "./admin-brand-settings.css";

const display = Fraunces({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-display" });
const sans = Inter({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-sans" });
const code = JetBrains_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-code" });

export const metadata: Metadata = {
  title: "Trussline International | Interactive Learning",
  description: "International interactive learning shaped by curriculum intelligence and adaptive mastery.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const brandSettings = await getSiteBrandSettings();
  const brandLogoVariables = getBrandLogoCssVariables(brandSettings.logoScale);

  return <html lang="en" data-logo-scale={brandSettings.logoScale.toFixed(2)} style={brandLogoVariables}>
    <body className={`${display.variable} ${sans.variable} ${code.variable}`}>
      <BrandPreviewBridge />
      <BrandSettingsSync />
      {children}
      <SiteFooter />
    </body>
  </html>;
}
