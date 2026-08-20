import type { Metadata } from "next";
import "./globals.css";
import "./reference-theme.css";
import "./trussline.css";
import "./experience-preview.css";

export const metadata: Metadata = {
  title: "Trussline International | Interactive Learning",
  description: "International interactive learning shaped by curriculum intelligence and adaptive mastery.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
