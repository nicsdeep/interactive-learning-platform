import Link from "next/link";
import BrandLogo from "./brand-logo";

export default function PublicPage({ eyebrow, title, copy, points }: { eyebrow: string; title: string; copy: string; points: string[] }) {
  return <main className="info-page">
    <header>
      <div className="global-logo"><BrandLogo /></div>
      <nav><Link href="/curricula">Curricula</Link><Link href="/how-it-works">How it works</Link><Link href="/families">Families</Link><Link href="/schools">Schools</Link></nav>
      <Link className="global-cta" href="/learn">Join the waitlist</Link>
    </header>
    <section><p>{eyebrow}</p><h1>{title}</h1><article><div>{copy}</div><ul>{points.map((point) => <li key={point}>{point}</li>)}</ul></article><Link href="/learn">Be first to know <span>→</span></Link></section>
  </main>;
}
