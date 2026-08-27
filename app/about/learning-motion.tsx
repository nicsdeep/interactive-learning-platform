"use client";

import { Pause, Play } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";

type LearningMetric = {
  value: number;
  label: string;
  detail: string;
  tone: "blue" | "teal" | "amber";
};

const moments = [
  { number: "01", label: "Idea", copy: "Meet a question that feels familiar.", tone: "blue" },
  { number: "02", label: "Try", copy: "Test a way forward, without pressure.", tone: "coral" },
  { number: "03", label: "Explain", copy: "Put your thinking into your own words.", tone: "amber" },
  { number: "04", label: "Next", copy: "Choose a helpful next thing to practise.", tone: "teal" },
] as const;

const metrics: LearningMetric[] = [
  {
    value: 9,
    label: "ways to work with an idea",
    detail: "Learn, play, explore, solve, explain, practise, master, challenge, and create.",
    tone: "blue",
  },
  {
    value: 4,
    label: "ways understanding can show up",
    detail: "In attempts, explanations, applications, and assessments.",
    tone: "teal",
  },
  {
    value: 3,
    label: "curriculum contexts",
    detail: "Kenya first, with USA and England to follow as distinct contexts.",
    tone: "amber",
  },
];

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);

    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}

function AnimatedMetric({ metric, isVisible, reducedMotion, index }: { metric: LearningMetric; isVisible: boolean; reducedMotion: boolean; index: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    if (reducedMotion) {
      setDisplayValue(metric.value);
      return;
    }

    const delay = index * 140;
    const duration = 760;
    let frame = 0;
    let startedAt = 0;
    const timer = window.setTimeout(() => {
      const tick = (now: number) => {
        if (!startedAt) startedAt = now;
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(eased * metric.value));

        if (progress < 1) frame = window.requestAnimationFrame(tick);
      };

      frame = window.requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
    };
  }, [index, isVisible, metric.value, reducedMotion]);

  return <div className="learning-motion-metric" data-tone={metric.tone}>
    <dt>
      <span className="learning-motion-metric-number" aria-hidden="true">{displayValue}</span>
      <span className="learning-motion-sr-only">{metric.value} {metric.label}</span>
      <span className="learning-motion-metric-label">{metric.label}</span>
    </dt>
    <dd>{metric.detail}</dd>
  </div>;
}

export default function LearningMotion() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = useReducedMotion();
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.24 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (reducedMotion) setIsPaused(true);
  }, [reducedMotion]);

  const isPlaying = !isPaused && !reducedMotion;

  return <section
    ref={sectionRef}
    className="learning-motion"
    data-playing={isPlaying}
    aria-labelledby="learning-motion-title"
  >
    <div className="learning-motion-intro">
      <div>
        <p className="about-section-label">A LEARNING MOMENT</p>
        <h2 id="learning-motion-title">Learning moves when <em>you take part.</em></h2>
      </div>
      <button
        className="learning-motion-control"
        type="button"
        onClick={() => setIsPaused((paused) => !paused)}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? "Pause the learning illustration" : "Play the learning illustration"}
        disabled={reducedMotion}
      >
        {isPlaying ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
        <span>{isPlaying ? "Pause" : "Play"}</span>
      </button>
    </div>

    <figure className="learning-motion-figure" aria-describedby="learning-motion-caption">
      <div className="learning-motion-stage" aria-hidden="true">
        <svg className="learning-motion-route" viewBox="0 0 720 274" fill="none" preserveAspectRatio="none">
          <path className="learning-motion-route-base" d="M36 169C116 169 116 89 196 89C276 89 276 200 356 200C436 200 436 79 516 79C596 79 596 143 684 143" />
          <path className="learning-motion-route-trace" pathLength="1" d="M36 169C116 169 116 89 196 89C276 89 276 200 356 200C436 200 436 79 516 79C596 79 596 143 684 143" />
        </svg>
        <span className="learning-motion-traveller" />
        {moments.map((moment, index) => <div key={moment.number} className="learning-motion-stop" data-tone={moment.tone} style={{ "--motion-index": index } as CSSProperties}>
          <span className="learning-motion-stop-dot" />
          <span className="learning-motion-stop-number">{moment.number}</span>
          <div>
            <strong>{moment.label}</strong>
            <span>{moment.copy}</span>
          </div>
        </div>)}
      </div>
      <figcaption id="learning-motion-caption">
        A small interactive visual follows one learner’s rhythm: meet an idea, try something, explain what happened, then choose a helpful way forward.
      </figcaption>
    </figure>

    <dl className="learning-motion-metrics" aria-label="What the learning experience makes room for">
      {metrics.map((metric, index) => <AnimatedMetric key={metric.label} metric={metric} index={index} isVisible={isVisible} reducedMotion={reducedMotion} />)}
    </dl>
  </section>;
}
