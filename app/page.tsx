import {
  Bell,
  BookOpen,
  Bot,
  ChevronRight,
  Compass,
  Gauge,
  GraduationCap,
  Home,
  Settings,
  Sparkles,
} from "lucide-react";

const mastery = [
  { name: "Whole numbers", progress: 94, state: "Mastered", tone: "mint" },
  { name: "Fractions", progress: 62, state: "Developing", tone: "gold" },
  { name: "Measurement", progress: 29, state: "Needs support", tone: "rose" },
];

const pathway = [
  ["NOW · Solve", "Equivalent fractions", "Apply and explain your strategy in context.", true],
  ["NEXT · Explore", "Fraction garden", "Discover relationships through visual models.", false],
  ["THEN · Explain", "Teach it back", "Show your companion how you reason.", false],
  ["READY · Master", "Fractions checkpoint", "Demonstrate transferable understanding.", false],
] as const;

export default function HomePage() {
  return (
    <main className="app-shell">
      <aside className="rail" aria-label="Primary navigation">
        <div className="brand-mark">K</div>
        <nav>
          <a className="is-active" href="#dashboard" aria-label="Dashboard"><Home size={19} /></a>
          <a href="#learn" aria-label="Learn"><BookOpen size={19} /></a>
          <a href="#path" aria-label="Learning path"><Compass size={19} /></a>
          <a href="#mastery" aria-label="Mastery"><Gauge size={19} /></a>
          <a href="#community" aria-label="Community"><GraduationCap size={19} /></a>
        </nav>
        <div className="rail-bottom"><a href="#settings" aria-label="Settings"><Settings size={18} /></a><div className="avatar">AN</div></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <p>My space <ChevronRight size={13} /> <strong>Learning journey</strong></p>
          <div className="top-actions"><button className="icon-button" aria-label="Notifications"><Bell size={17} /></button><button className="curriculum-picker">🇰🇪 Kenya CBE <span>·</span> Grade 4 <ChevronRight size={14} /></button></div>
        </header>

        <section className="intro"><p className="eyebrow">Adaptive learning platform</p><h1>Your learning, designed around you.</h1><p>Keep going, Amara. Your next step builds on what you already understand.</p></section>

        <section className="hero-card">
          <div className="mission-copy"><p className="eyebrow">Mathematics <span>·</span> Fractions</p><h2>The market share challenge</h2><p>Use fractions to divide a trader&apos;s fruit fairly, make decisions, and explain how you got the answer.</p><div className="mission-action"><button>Resume experience <ChevronRight size={16} /></button><span>12 min left <i /> 3 of 5 challenges</span></div></div>
          <div className="mission-art" aria-label="Fraction activity preview"><div className="orb orb-one" /><div className="orb orb-two" /><div className="activity-preview"><span>Challenge progress</span><div className="fraction"><b>¾</b><div><i><em /></i><small>64% complete</small></div></div><strong>Share 12 mangoes fairly</strong></div></div>
        </section>

        <section className="dashboard-grid">
          <article className="panel"><div className="panel-heading"><div><p className="eyebrow">Evidence-based</p><h3>Concept mastery</h3></div><a href="#mastery">Open map <ChevronRight size={14} /></a></div><div className="mastery-list">{mastery.map((item) => <div className="mastery-row" key={item.name}><div className="mastery-label"><span>{item.name}</span><b className={item.tone}>{item.state}</b></div><div className="meter"><i className={item.tone} style={{ width: `${item.progress}%` }} /></div></div>)}</div><p className="panel-note">Mastery reflects explanations, practice, and applied challenges—not completion alone.</p></article>
          <article className="panel"><div className="panel-heading"><div><p className="eyebrow">Personalized next steps</p><h3>Your adaptive pathway</h3></div><a href="#path">View plan <ChevronRight size={14} /></a></div><div className="path-grid">{pathway.map(([label, title, text, active]) => <div className={`path-card${active ? " current" : ""}`} key={title}><span>{label}</span><h4>{title}</h4><p>{text}</p></div>)}</div></article>
        </section>

        <section className="companion"><div className="companion-mark"><Sparkles size={18} /></div><div><h3>Learning companion</h3><p>I noticed visual models help you compare fractions. Want to use one before the next challenge?</p></div><button>Learn with me <Bot size={15} /></button></section>
      </section>
    </main>
  );
}
