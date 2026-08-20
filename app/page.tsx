"use client";

import { useState } from "react";
import { ArrowRight, Bell, BookOpen, Bot, ChevronRight, CircleHelp, Compass, Gauge, GraduationCap, Home, MoveUpRight, Play, Settings, Sparkles } from "lucide-react";

const modes = ["Learn", "Solve", "Explore", "Explain", "Master"] as const;
const mastery = [
  { name: "Whole numbers", progress: 94, state: "Secure", tone: "secure" },
  { name: "Fractions", progress: 64, state: "Growing", tone: "growing" },
  { name: "Measurement", progress: 29, state: "Revisit", tone: "revisit" },
];
const pathway = [
  ["01", "Solve", "Equivalent fractions", "Use a market stall to compare quantities fairly."],
  ["02", "Explore", "Fraction garden", "Build visual models, then test the pattern you notice."],
  ["03", "Explain", "Teach it back", "Tell your companion why your strategy works."],
] as const;

export default function HomePage() {
  const [activeMode, setActiveMode] = useState<(typeof modes)[number]>("Solve");
  const [inSession, setInSession] = useState(false);
  const [companionOpen, setCompanionOpen] = useState(false);
  const progress = inSession ? 72 : 64;

  return <main className="app-shell">
    <aside className="rail" aria-label="Primary navigation">
      <a className="brand-mark" href="#dashboard" aria-label="Kora home">K</a>
      <nav>
        <a className="is-active" href="#dashboard" aria-label="Dashboard"><Home size={19} /></a><a href="#learn" aria-label="Learning library"><BookOpen size={19} /></a><a href="#path" aria-label="Learning path"><Compass size={19} /></a><a href="#mastery" aria-label="Mastery map"><Gauge size={19} /></a><a href="#community" aria-label="Learning community"><GraduationCap size={19} /></a>
      </nav>
      <div className="rail-bottom"><a href="#settings" aria-label="Settings"><Settings size={18} /></a><div className="avatar" aria-label="Amara N.">AN</div></div>
    </aside>

    <section className="workspace" id="dashboard">
      <header className="topbar"><p className="crumb">My space <ChevronRight size={13} /> <strong>Learning journey</strong></p><div className="top-actions"><button className="icon-button" aria-label="Notifications"><Bell size={17} /></button><button className="curriculum-picker" aria-label="Change curriculum and grade">Kenya CBE <span className="dot">•</span> Grade 4 <ChevronRight size={14} /></button></div></header>

      <section className="masthead" aria-labelledby="page-title"><p className="eyebrow">Wednesday / 20 August</p><div className="masthead-copy"><h1 id="page-title">Make today&apos;s learning <em>stick.</em></h1><p>One focused step, based on what you know already. You are building confidence with fractions.</p></div><div className="streak" aria-label="Three day learning streak"><strong>03</strong><span>day<br />streak</span></div></section>

      <section className="mode-bar" aria-label="Learning modes"><span>Choose your way in</span><div role="tablist" aria-label="Learning mode">{modes.map((mode) => <button key={mode} role="tab" aria-selected={activeMode === mode} onClick={() => setActiveMode(mode)}>{mode}</button>)}</div></section>

      <section className="mission" aria-labelledby="mission-title">
        <div className="mission-index"><span>Today&apos;s focus</span><b>04</b><i> / 08</i></div>
        <div className="mission-copy"><p className="eyebrow">Mathematics <span>→</span> Fractions</p><h2 id="mission-title">The market share challenge</h2><p>At a busy market in Nakuru, divide fruit orders fairly and show how you decided. There is more than one way to get it right.</p><div className="mission-actions"><button className="primary-action" onClick={() => setInSession(true)}>{inSession ? "Continue challenge" : "Begin challenge"} <ArrowRight size={17} /></button><span>{inSession ? "You made progress" : "12 min"} <i /> {inSession ? "4 of 5 parts" : "3 of 5 parts"}</span></div></div>
        <div className="mission-evidence" aria-label={`${progress}% of this challenge complete`}><div className="evidence-top"><span>Evidence collected</span><CircleHelp size={14} /></div><strong>{progress}<small>%</small></strong><div className="evidence-meter"><i style={{ width: `${progress}%` }} /></div><p>{activeMode} mode <span>active</span></p><div className="evidence-mark" aria-hidden="true">¾</div></div>
      </section>

      <section className="learning-grid">
        <article className="mastery-card" id="mastery" aria-labelledby="mastery-title"><div className="section-heading"><div><p className="eyebrow">Evidence, not completion</p><h2 id="mastery-title">Your mastery field</h2></div><a href="#mastery">Open map <MoveUpRight size={15} /></a></div><div className="mastery-list">{mastery.map((item) => <div className="mastery-row" key={item.name}><div className="mastery-label"><span>{item.name}</span><b className={item.tone}>{item.state}</b></div><div className="meter"><i className={item.tone} style={{ width: `${item.progress}%` }} /></div></div>)}</div><p className="caption">Your map changes when you apply a concept, explain your thinking, or demonstrate it in a new situation.</p></article>
        <article className="path-card" id="path" aria-labelledby="path-title"><div className="section-heading"><div><p className="eyebrow">A path that responds</p><h2 id="path-title">What comes next</h2></div><a href="#path">Full plan <MoveUpRight size={15} /></a></div><ol className="path-list">{pathway.map(([number, mode, title, description], index) => <li className={index === 0 ? "is-now" : ""} key={title}><span className="path-number">{number}</span><div><p>{mode}</p><h3>{title}</h3><span>{description}</span></div><button aria-label={`Start ${title}`} onClick={() => setActiveMode(mode as (typeof modes)[number])}><Play size={14} fill="currentColor" /></button></li>)}</ol></article>
      </section>

      <section className={`companion ${companionOpen ? "is-open" : ""}`} aria-labelledby="companion-title"><div className="companion-symbol"><Sparkles size={18} /></div><div><p className="eyebrow">Kora companion</p><h2 id="companion-title">Try a picture before a rule.</h2><p>I can draw the fractions with you, then ask you to explain what changed.</p></div><button onClick={() => setCompanionOpen((value) => !value)} aria-expanded={companionOpen}>{companionOpen ? "Close note" : "Open a hint"} <Bot size={16} /></button>{companionOpen && <div className="companion-note" role="status">Start with 12 mangoes. Can you make groups that show <strong>three quarters</strong> before writing any numbers?</div>}</section>
    </section>
  </main>;
}
