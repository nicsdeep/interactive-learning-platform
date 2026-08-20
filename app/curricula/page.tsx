import Link from "next/link";
import { ArrowRight, Layers3, Route, ShieldCheck } from "lucide-react";

const layers = [
  { number: "01", name: "Kenya", label: "First curriculum layer", text: "A deeply implemented Kenya CBE/CBC layer, built to connect outcomes, competencies, authentic context, interactive experiences, and mastery evidence." },
  { number: "02", name: "United States", label: "Standards framework", text: "A standards layer designed for Common Core, NGSS, and state-level variation—without changing the learning engine underneath." },
  { number: "03", name: "England", label: "National Curriculum", text: "A distinct England curriculum layer, kept separate from Scotland, Wales, and Northern Ireland so local learning structures stay meaningful." },
];

export default function CurriculaPage() {
  return <main className="curricula-page">
    <header className="curricula-nav"><Link href="/" className="curricula-brand"><img src="/logo.svg" alt="Trussline International — Interactive Learning" /></Link><Link href="/how-it-works">See the learning engine <ArrowRight size={15} /></Link></header>
    <section className="curricula-hero"><p><Layers3 size={15} /> CURRICULUM INTELLIGENCE</p><h1>One learning engine.<br /><em>Many curriculum realities.</em></h1><span>Trussline is designed for international learning without flattening the systems learners, families, and teachers already know.</span></section>
    <section className="curricula-principle"><Route size={21} /><div><p>THE ARCHITECTURE PROMISE</p><h2>Change the curriculum layer—not the core learning contract.</h2><span>Every learner experience can be shaped by the right framework, level, outcome, skills, context, and assessment evidence. The engine still knows how to create an interactive challenge, observe learning, and recommend a meaningful next step.</span></div></section>
    <section className="curriculum-layers" aria-label="Curriculum layers">{layers.map((layer) => <article key={layer.name}><b>{layer.number}</b><span>{layer.label}</span><h2>{layer.name}</h2><p>{layer.text}</p><small>{layer.number === "01" ? "IMPLEMENTATION FOCUS" : "FOUNDATION IN PLACE"}</small></article>)}</section>
    <section className="curricula-contract"><div><ShieldCheck size={20} /><p>WHAT STAYS CONSISTENT</p><h2>Learning should feel coherent—even when the curriculum changes.</h2></div><ul><li>Interactive experiences built around a learning objective</li><li>Evidence from practice, explanation, and application</li><li>Mastery that reflects more than a completed task</li><li>Grounded companion feedback and personalized next steps</li></ul></section>
    <section className="curricula-end"><p>TRUSSLINE INTERNATIONAL</p><h2>A global platform that<br />takes local learning seriously.</h2><Link href="/learn">Join the waitlist <ArrowRight size={16} /></Link></section>
  </main>;
}
