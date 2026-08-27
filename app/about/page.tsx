import Link from "next/link";
import { ArrowRight, Globe2, Sparkles } from "lucide-react";
import PublicNavigation from "../public-navigation";
import LearningMotion from "./learning-motion";

const curriculumContexts = [
  {
    title: "Kenya CBE/CBC",
    status: "Being shaped first",
    copy: "The first experiences are being built around Kenyan outcomes, language, and situations learners can recognise.",
    tone: "teal",
  },
  {
    title: "United States",
    status: "In view",
    copy: "A future experience that can respect local standards and the rhythm of the classrooms learners know.",
    tone: "amber",
  },
  {
    title: "England",
    status: "In view",
    copy: "A future experience that can follow the National Curriculum while keeping examples close to everyday learning.",
    tone: "blue",
  },
];

const learnerPromises = [
  {
    title: "Try before being told",
    copy: "A good question gives learners room to notice, test, and make a first move of their own.",
  },
  {
    title: "Show your thinking",
    copy: "Understanding can be seen in an explanation, a choice, a drawing, or a solution—not only in a final answer.",
  },
  {
    title: "Get help that responds to the work",
    copy: "Helpful guidance should meet the learner at the idea they are working on, then offer one useful next thing to try.",
  },
];

const people = [
  { href: "/learn", title: "Learners", copy: "See a clear next step after each attempt." },
  { href: "/families", title: "Families", copy: "Talk about what was understood, not only what was finished." },
  { href: "/schools", title: "Schools", copy: "Use evidence to support the next lesson with confidence." },
];

export default function AboutPage() {
  return <main className="about-page">
    <PublicNavigation active="about" />

    <section className="about-hero" aria-labelledby="about-title">
      <div className="about-hero-copy">
        <p className="about-eyebrow"><Sparkles size={15} aria-hidden="true" /> A BETTER WAY TO MEET A LESSON</p>
        <h1 id="about-title">A lesson should feel like something <em>you can do.</em></h1>
        <p>Trussline helps learners explore an idea, try it, explain it in their own words, and see what could help next.</p>
        <div className="about-hero-actions">
          <Link className="home-primary" href="/how-it-works">Read how it works <ArrowRight size={17} /></Link>
          <Link className="home-secondary" href="/curricula">Explore curricula <ArrowRight size={16} /></Link>
        </div>
      </div>
      <aside className="about-hero-note" aria-label="How a lesson comes to life">
        <p>Learning grows when an idea is given room to move.</p>
        <span><i className="about-hero-waypoint is-blue" /> See it</span>
        <span><i className="about-hero-waypoint is-coral" /> Try it</span>
        <span><i className="about-hero-waypoint is-teal" /> Explain it</span>
        <span><i className="about-hero-waypoint is-amber" /> Use it again</span>
      </aside>
    </section>

    <section className="about-perspective" aria-labelledby="perspective-title">
      <p className="about-section-label">STARTING WHERE LEARNING LIVES</p>
      <h2 id="perspective-title">Start with the world a learner knows.</h2>
      <div className="about-perspective-copy">
        <p>A familiar example makes a new idea easier to enter. Trussline begins with the curriculum, language, and situations that make sense where a learner lives and learns.</p>
        <p>The experience then adapts to their work—not just the page they completed.</p>
      </div>
    </section>

    <LearningMotion />

    <section className="about-curricula" aria-labelledby="curricula-title">
      <div className="about-section-heading">
        <p className="about-section-label">LEARNING IN CONTEXT</p>
        <h2 id="curricula-title">Learning that makes sense here—and can grow further.</h2>
      </div>
      <div className="about-curricula-intro"><Globe2 size={24} aria-hidden="true" /><p>Our first learning experiences are being shaped for Kenya CBE/CBC. USA and England curriculum experiences will follow with their own language, examples, and sequence.</p></div>
      <ol className="about-curricula-list">
        {curriculumContexts.map((context, index) => <li key={context.title} data-tone={context.tone}>
          <span className="about-layer-number">0{index + 1}</span>
          <div><h3>{context.title}</h3><p>{context.copy}</p></div>
          <span className="about-layer-status">{context.status}</span>
        </li>)}
      </ol>
    </section>

    <section className="about-expectations" aria-labelledby="expectations-title">
      <div className="about-section-heading">
        <p className="about-section-label">WHAT LEARNERS CAN EXPECT</p>
        <h2 id="expectations-title">A little more room to understand.</h2>
      </div>
      <ol>
        {learnerPromises.map((promise, index) => <li key={promise.title}>
          <span>0{index + 1}</span>
          <div><h3>{promise.title}</h3><p>{promise.copy}</p></div>
        </li>)}
      </ol>
    </section>

    <section className="about-people" aria-labelledby="people-title">
      <div className="about-section-heading"><p className="about-section-label">LEARNING IS RARELY A SOLO JOB</p><h2 id="people-title">Useful for the people learning together.</h2></div>
      <div className="about-people-list">
        {people.map((person) => <Link href={person.href} key={person.title}>
          <span>{person.title}</span><p>{person.copy}</p><ArrowRight size={18} aria-hidden="true" />
        </Link>)}
      </div>
    </section>

    <section className="about-questions" aria-labelledby="questions-title">
      <div><p className="about-section-label">A CLEAR START</p><h2 id="questions-title">Questions people reasonably ask.</h2></div>
      <div className="about-question-list">
        <details open><summary>Can learners use Trussline today?</summary><p>Not yet. We are taking time to make the first learning experiences clear, useful, and ready to grow.</p></details>
        <details><summary>Which curriculum comes first?</summary><p>Kenya CBE/CBC comes first. USA and England experiences will be added with their own learning language and sequence.</p></details>
        <details><summary>How will the learning companion help?</summary><p>It will respond to a learner’s attempts with grounded prompts and useful next steps. It is there to support thinking, not to replace a teacher or hand over answers.</p></details>
      </div>
    </section>

    <section className="about-closing" aria-labelledby="closing-title">
      <p className="about-section-label">TRUSSLINE INTERACTIVE LEARNING</p>
      <h2 id="closing-title">We are making the first lessons worth the wait.</h2>
      <p>Explore the learning preview and come back as the first experiences take shape.</p>
      <Link className="home-primary" href="/learn">See the learning preview <ArrowRight size={17} /></Link>
    </section>
  </main>;
}
