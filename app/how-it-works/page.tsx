"use client";

import Link from "next/link";
import BrandLogo from "../brand-logo";
import { ArrowRight, Check, ChevronLeft, CirclePlay, Compass, Lightbulb, Sparkles } from "lucide-react";
import { useState } from "react";

export default function HowItWorksPage() {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const correct = answer.trim() === "4";

  return <main className="experience-page">
    <header className="experience-nav"><Link href="/" className="experience-brand"><BrandLogo /></Link><Link href="/" className="experience-back"><ChevronLeft size={15} /> Home</Link></header>
    <section className="experience-intro"><p><Sparkles size={14} /> THE INTERACTIVE LEARNING ENGINE</p><h1>Learning changes<br />when the <em>next step</em> listens.</h1><span>Trussline translates curriculum goals into experiences that invite learners to reason, create evidence, and receive help that is relevant to the work in front of them.</span></section>
    <section className="experience-loop" aria-label="How the learning loop works">
      <article><b>01</b><Compass size={19} /><h2>Start with a purpose</h2><p>Each experience begins with a curriculum-aligned outcome and a challenge worth solving.</p></article>
      <article><b>02</b><Lightbulb size={19} /><h2>See thinking in action</h2><p>Choices, explanations, and attempts become evidence—not just a score.</p></article>
      <article><b>03</b><Sparkles size={19} /><h2>Respond with care</h2><p>The companion gives a next move grounded in that learner’s current evidence.</p></article>
    </section>
    <section className="experience-demo">
      <div className="demo-copy"><p>TRY A SHORT DEMONSTRATION</p><h2>A companion that helps learners think—not simply gives answers.</h2><span>This sample shows how an adaptive prompt can respond to a learner’s work. It is a product preview, not a live assessment.</span><div className="demo-watch"><CirclePlay size={19} /><span><b>01:42</b> Guided problem-solving preview<br /><small>Video stories are being prepared for the full launch.</small></span></div></div>
      <div className="problem-card">
        <div className="problem-head"><span>MATHEMATICAL THINKING</span><b>Step 2 of 4</b></div>
        <h3>Arrange 24 counters into equal groups of 6.</h3><p>How many groups can you make?</p>
        <div className="counter-grid" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <i key={index} className={index % 6 === 5 ? "end-group" : ""} />)}</div>
        <label>My answer<input inputMode="numeric" value={answer} onChange={(event) => { setAnswer(event.target.value); setSubmitted(false); }} placeholder="Enter a number" aria-label="Number of groups" /></label>
        <button onClick={() => setSubmitted(true)}>Check my thinking <ArrowRight size={15} /></button>
        {submitted && <div className={`companion-response ${correct ? "is-correct" : ""}`}><span>{correct ? <Check size={16} /> : <Lightbulb size={16} />}</span><p><b>{correct ? "That’s right." : "Let’s look once more."}</b>{correct ? " You made four equal groups. Your next step could ask you to explain how you knew." : " Try counting how many sets of six are shown. The companion would offer a visual model before moving on."}</p></div>}
      </div>
    </section>
    <section className="experience-principles"><p>WHAT WE WILL NOT DO</p><div><h2>No generic chatbot. No completion theatre.</h2><span>The companion is shaped by the learner’s current objective, their attempts, and the evidence they have made. Progress means understanding that can travel to a new situation.</span></div></section>
    <section className="experience-cta"><div><p>TRUSSLINE INTERNATIONAL</p><h2>Interactive learning<br />for every route ahead.</h2></div><Link href="/learn">Join the waitlist <ArrowRight size={16} /></Link></section>
  </main>;
}
