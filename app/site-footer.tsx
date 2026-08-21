import Link from "next/link";
import { ArrowUpRight, Globe2 } from "lucide-react";

export default function SiteFooter() {
  return <footer className="site-footer"><div className="site-footer-top"><Link href="/" className="site-footer-brand"><img src="/logo.svg" alt="Trussline International — Interactive Learning" /></Link><p>Interactive learning that understands the learner, the curriculum, and the world around them.</p><Link href="/learn" className="site-footer-cta">Join the waitlist <ArrowUpRight size={16} /></Link></div><div className="site-footer-links"><div><b>Explore</b><Link href="/how-it-works">Our approach</Link><Link href="/curricula">Programs &amp; subjects</Link></div><div><b>For people</b><Link href="/families">Families</Link><Link href="/schools">Schools</Link></div><div><b>Global learning</b><span><Globe2 size={14} /> Kenya · USA · England</span><span>More curriculum layers ahead</span></div></div><div className="site-footer-bottom"><span>© 2026 Trussline International</span><span>Interactive Learning</span><span>Built for meaningful progress.</span></div></footer>;
}
