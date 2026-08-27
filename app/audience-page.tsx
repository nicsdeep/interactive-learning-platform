import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import BrandLogo from "./brand-logo";

type AudiencePageProps = { eyebrow: string; title: React.ReactNode; lead: string; proof: string; panels: { title: string; text: string }[]; principles: string[]; closing: React.ReactNode };

export default function AudiencePage({ eyebrow, title, lead, proof, panels, principles, closing }: AudiencePageProps) {
  return <main className="audience-page">
    <header className="audience-nav"><div className="audience-brand"><BrandLogo /></div><Link href="/about">Read more <ArrowRight size={15} /></Link></header>
    <section className="audience-hero"><p>{eyebrow}</p><h1>{title}</h1><span>{lead}</span></section>
    <section className="audience-proof"><b>THE PROMISE</b><p>{proof}</p></section>
    <section className="audience-panels">{panels.map((panel, index) => <article key={panel.title}><b>0{index + 1}</b><h2>{panel.title}</h2><p>{panel.text}</p></article>)}</section>
    <section className="audience-principles"><div><p>BUILT WITH CARE</p><h2>What this experience protects.</h2></div><ul>{principles.map((principle) => <li key={principle}><CheckCircle2 size={17} />{principle}</li>)}</ul></section>
    <section className="audience-end"><p>TRUSSLINE INTERNATIONAL</p><h2>{closing}</h2><Link href="/learn">Be first to know <ArrowRight size={16} /></Link></section>
  </main>;
}
