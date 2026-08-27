"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, ChevronDown, Compass, Globe2, GraduationCap, Info, Library, Menu, School, Sparkles, X } from "lucide-react";
import { useState } from "react";
import BrandLogo from "../brand-logo";

const learningSteps = [
  {
    number: "01",
    title: "Curriculum",
    copy: "Begin with the objective, language, and context a learner already knows.",
    tone: "blue",
  },
  {
    number: "02",
    title: "Active experience",
    copy: "Invite learners to explore, solve, explain, practise, and create—not just consume a lesson.",
    tone: "coral",
  },
  {
    number: "03",
    title: "Meaningful evidence",
    copy: "Notice attempts, explanations, application, and assessment so progress has substance.",
    tone: "amber",
  },
  {
    number: "04",
    title: "A considered next step",
    copy: "Offer guidance grounded in what the learner has actually understood and needs next.",
    tone: "teal",
  },
];

const curriculumLayers = [
  { title: "Kenya CBE/CBC", status: "First implementation focus", copy: "A deeply contextual learning layer built around competencies, outcomes, and real understanding.", tone: "teal" },
  { title: "USA standards", status: "In preparation", copy: "A standards-aware layer designed to accommodate national and state frameworks without changing the learning engine.", tone: "amber" },
  { title: "England National Curriculum", status: "In preparation", copy: "A distinct curriculum layer with its own progression, language, and learning context.", tone: "blue" },
];

const commitments = [
  {
    title: "Understanding over completion",
    copy: "A finished activity is not enough. Learners should be able to explain, apply, and carry an idea into a new situation.",
  },
  {
    title: "Guidance over answer-giving",
    copy: "The companion should respond to a learner’s work and curriculum context, not act like a free-floating chatbot.",
  },
  {
    title: "Context and privacy by design",
    copy: "Regional context improves learning. It should never become an excuse to collect more learner data than is needed.",
  },
];

export default function AboutPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return <main className="about-page">
    <header className="home-nav about-nav">
      <div className="home-brand"><BrandLogo /></div>
      <button className="home-menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen}>
        {menuOpen ? <X /> : <Menu />}
      </button>
      <nav className={menuOpen ? "is-open" : ""} aria-label="Primary navigation">
        <Link href="/how-it-works" onClick={() => setMenuOpen(false)}><Compass className="mobile-nav-icon" size={18} /><span>How it works</span><ChevronDown size={14} /></Link>
        <Link href="/curricula" onClick={() => setMenuOpen(false)}><BookOpen className="mobile-nav-icon" size={18} /><span>Curricula</span><ChevronDown size={14} /></Link>
        <Link href="/learn" onClick={() => setMenuOpen(false)}><GraduationCap className="mobile-nav-icon" size={18} /><span>For learners</span><ChevronDown size={14} /></Link>
        <Link href="/schools" onClick={() => setMenuOpen(false)}><School className="mobile-nav-icon" size={18} /><span>For schools</span><ChevronDown size={14} /></Link>
        <Link href="/families" onClick={() => setMenuOpen(false)}><Library className="mobile-nav-icon" size={18} /><span>For families</span><ChevronDown size={14} /></Link>
        <Link href="/about" aria-current="page" onClick={() => setMenuOpen(false)}><Info className="mobile-nav-icon" size={18} /><span>About Trussline</span><ChevronDown size={14} /></Link>
      </nav>
      <div className="home-nav-actions"><Link href="/learn" className="home-primary">Join the waitlist <ArrowRight size={17} /></Link></div>
    </header>

    <section className="about-hero" aria-labelledby="about-title">
      <div className="about-hero-copy">
        <p className="about-eyebrow"><Sparkles size={15} aria-hidden="true" /> ABOUT TRUSSLINE</p>
        <h1 id="about-title">Learning is local.<br /><em>Understanding can travel.</em></h1>
        <p>Trussline turns the curriculum a learner knows into active experiences that reveal real understanding—then helps decide what comes next.</p>
        <div className="about-hero-actions">
          <Link className="home-primary" href="/learn">Join the waitlist <ArrowRight size={17} /></Link>
          <Link className="home-secondary" href="/how-it-works">See how learning works <ArrowRight size={16} /></Link>
        </div>
      </div>
      <ol className="about-route" aria-label="The Trussline learning model">
        {learningSteps.map((step) => <li key={step.number} data-tone={step.tone}>
          <span className="about-route-dot" aria-hidden="true" />
          <div><small>{step.number}</small><h2>{step.title}</h2><p>{step.copy}</p></div>
        </li>)}
      </ol>
    </section>

    <section className="about-perspective" aria-labelledby="perspective-title">
      <p className="about-section-label">THE STARTING POINT</p>
      <h2 id="perspective-title">A curriculum is not a list to be covered.</h2>
      <div className="about-perspective-copy">
        <p>It is the context that makes a question, an example, and a next step meaningful. Learners should not have to translate their world just to begin learning.</p>
        <p>That is why Trussline is designed as one shared learning engine with distinct curriculum layers. The core experience stays rigorous, while the learning context stays recognisable.</p>
      </div>
    </section>

    <section className="about-engine" aria-labelledby="engine-title">
      <div className="about-section-heading">
        <p className="about-section-label">WHAT WE ARE BUILDING</p>
        <h2 id="engine-title">An active learning loop—not a digital textbook.</h2>
      </div>
      <p className="about-engine-lead">Every part of the system should bring a learner closer to durable understanding. The route below is the product contract we hold ourselves to.</p>
      <ol className="about-loop">
        {learningSteps.map((step) => <li key={step.title} data-tone={step.tone}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.copy}</p></div></li>)}
      </ol>
    </section>

    <section className="about-curricula" aria-labelledby="curricula-title">
      <div className="about-section-heading">
        <p className="about-section-label">ONE ENGINE, DISTINCT CURRICULA</p>
        <h2 id="curricula-title">International by architecture, not by a flag selector.</h2>
      </div>
      <div className="about-curricula-intro"><Globe2 size={24} aria-hidden="true" /><p>Each curriculum layer carries its own outcomes, language, sequence, and context—while the learning engine keeps the same commitment to active evidence and mastery.</p></div>
      <ol className="about-curricula-list">
        {curriculumLayers.map((layer, index) => <li key={layer.title} data-tone={layer.tone}>
          <span className="about-layer-number">0{index + 1}</span>
          <div><h3>{layer.title}</h3><p>{layer.copy}</p></div>
          <span className="about-layer-status">{layer.status}</span>
        </li>)}
      </ol>
    </section>

    <section className="about-protections" aria-labelledby="protections-title">
      <div className="about-section-heading"><p className="about-section-label">WHAT WE PROTECT</p><h2 id="protections-title">A learning system should be ambitious and careful at the same time.</h2></div>
      <ol>
        {commitments.map((commitment, index) => <li key={commitment.title}><span>0{index + 1}</span><div><h3>{commitment.title}</h3><p>{commitment.copy}</p></div></li>)}
      </ol>
    </section>

    <section className="about-people" aria-labelledby="people-title">
      <div className="about-section-heading"><p className="about-section-label">BUILT AROUND THE PEOPLE CLOSEST TO LEARNING</p><h2 id="people-title">Useful at the moment learning needs help.</h2></div>
      <div className="about-people-list">
        <Link href="/learn"><span>For learners</span><p>Make progress visible through work they can explain.</p><ArrowRight size={18} aria-hidden="true" /></Link>
        <Link href="/families"><span>For families</span><p>See learning as understanding, not just a score or a streak.</p><ArrowRight size={18} aria-hidden="true" /></Link>
        <Link href="/schools"><span>For schools</span><p>Bring curriculum, evidence, and teaching decisions into clearer view.</p><ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>

    <section className="about-questions" aria-labelledby="questions-title">
      <div><p className="about-section-label">A CLEAR START</p><h2 id="questions-title">Questions people reasonably ask.</h2></div>
      <div className="about-question-list">
        <details open><summary>Is Trussline open to learners today?</summary><p>Not yet. We are building the first end-to-end learning experience carefully before opening it more widely.</p></details>
        <details><summary>Which curriculum comes first?</summary><p>Kenya CBE/CBC is the first full implementation. USA standards and the England National Curriculum are planned as separate layers on the same shared engine.</p></details>
        <details><summary>Will AI replace teaching?</summary><p>No. The role of the companion is to offer grounded guidance based on curriculum and learner evidence—not to replace educators or give generic answers.</p></details>
      </div>
    </section>

    <section className="about-closing" aria-labelledby="closing-title">
      <p className="about-section-label">TRUSSLINE INTERACTIVE LEARNING</p>
      <h2 id="closing-title">We are building carefully, not opening early.</h2>
      <p>Join the waitlist to hear when Trussline is ready to welcome its first learners.</p>
      <Link className="home-primary" href="/learn">Join the waitlist <ArrowRight size={17} /></Link>
    </section>
  </main>;
}
