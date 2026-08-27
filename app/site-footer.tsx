"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Globe2 } from "lucide-react";
import BrandLogo from "./brand-logo";

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return <footer id="site-footer" className="site-footer" data-logo-surface="dark">
    <svg className="site-footer-learning-horizon" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M0 90V74h58V57h34v17h104V46h46v25h78V32h43v38h87V51h52v23h132V38h38v29h80V25h45v47h110V52h54v22h106V43h43v25h92V31h39v43h108V56h43v18h69V90Z" fill="currentColor" />
    </svg>
    <div className="site-footer-surface">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <section className="site-footer-intro" aria-labelledby="footer-purpose">
            <p className="site-footer-eyebrow">ABOUT TRUSSLINE</p>
            <h2 id="footer-purpose">Learning that grows with every learner.</h2>
            <p>Interactive learning that understands the learner, the curriculum, and the world around them.</p>
          </section>

          <nav className="site-footer-column" aria-label="Curricula">
            <h2>Curricula</h2>
            <Link href="/curricula">Kenya CBE/CBC</Link>
            <Link href="/curricula">USA standards</Link>
            <Link href="/curricula">England National Curriculum</Link>
          </nav>

          <nav className="site-footer-column" aria-label="Explore Trussline">
            <h2>Explore</h2>
            <Link href="/about">About Trussline</Link>
            <Link href="/how-it-works">Our approach</Link>
            <Link href="/curricula">Programs &amp; subjects</Link>
            <Link href="/families">For families</Link>
            <Link href="/schools">For schools</Link>
          </nav>

          <section className="site-footer-column site-footer-global" aria-labelledby="footer-global-title">
            <h2 id="footer-global-title">Keep exploring</h2>
            <p><Globe2 size={15} aria-hidden="true" /> Learning internationally</p>
            <span>See how Trussline is being shaped around meaningful learning.</span>
            <Link href="/about" className="site-footer-cta">Read more <ArrowUpRight size={16} /></Link>
          </section>
        </div>

        <div className="site-footer-signature">
          <BrandLogo monochrome />
          <p>Built for real learning, wherever it happens.</p>
        </div>

        <div className="site-footer-bottom">
          <span>© 2026 Trussline International</span>
          <span>Made for steady understanding.</span>
          <span>Interactive Learning</span>
        </div>
      </div>
    </div>
  </footer>;
}
