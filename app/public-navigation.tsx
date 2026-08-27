"use client";

import Link from "next/link";
import type { FocusEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Compass,
  Globe2,
  GraduationCap,
  Menu,
  School,
  UsersRound,
  X,
} from "lucide-react";
import BrandLogo from "./brand-logo";

type PublicNavigationProps = {
  active?: "home" | "about";
  controls?: ReactNode;
};

type NavigationLink = {
  title: string;
  description: string;
  href: string;
};

type NavigationGroup = {
  id: string;
  label: string;
  icon: typeof Compass;
  links: NavigationLink[];
};

const navigationGroups: NavigationGroup[] = [
  {
    id: "discover",
    label: "Discover",
    icon: Compass,
    links: [
      { title: "About Trussline", description: "Why learning should feel familiar and active.", href: "/about" },
      { title: "How learning works", description: "See the moments that turn trying into understanding.", href: "/how-it-works" },
      { title: "Our curriculum approach", description: "Learn how local context shapes the experience.", href: "/curricula" },
    ],
  },
  {
    id: "learners",
    label: "For learners",
    icon: GraduationCap,
    links: [
      { title: "Your learning space", description: "A calmer place to try, reflect, and keep going.", href: "/learn" },
      { title: "Practice with purpose", description: "Work through ideas in ways that make sense to you.", href: "/learn#practice-with-purpose" },
    ],
  },
  {
    id: "families",
    label: "For families",
    icon: UsersRound,
    links: [
      { title: "Supporting progress", description: "Stay close to the learning without taking it over.", href: "/families" },
      { title: "What understanding looks like", description: "See more than a score, streak, or completed task.", href: "/families#understanding" },
    ],
  },
  {
    id: "schools",
    label: "For schools",
    icon: School,
    links: [
      { title: "For teachers", description: "Bring learner thinking and curriculum into clearer view.", href: "/schools" },
      { title: "For school leaders", description: "Build a shared picture of meaningful learning progress.", href: "/schools#leaders" },
    ],
  },
  {
    id: "curricula",
    label: "Curricula",
    icon: BookOpen,
    links: [
      { title: "Kenya CBE/CBC", description: "The first learning experience we are shaping carefully.", href: "/curricula#kenya" },
      { title: "Choosing a region", description: "Start with the curriculum context closest to you.", href: "/#region-selector" },
      { title: "Curriculum approach", description: "Different places, one thoughtful learning standard.", href: "/curricula" },
    ],
  },
];

export default function PublicNavigation({ active, controls }: PublicNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navigationRef = useRef<HTMLElement | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const closeNavigation = (returnFocus = false) => {
    setOpenGroup(null);
    setIsMobileMenuOpen(false);
    if (returnFocus) lastTriggerRef.current?.focus();
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (navigationRef.current?.contains(event.target as Node)) return;
      closeNavigation();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const handleGroupBlur = (event: FocusEvent<HTMLDivElement>) => {
    const group = event.currentTarget;
    window.setTimeout(() => {
      const nextFocusedElement = document.activeElement;
      if (!group.contains(nextFocusedElement)) setOpenGroup(null);
    }, 0);
  };

  const toggleGroup = (id: string, trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    setOpenGroup((current) => current === id ? null : id);
  };

  return (
    <header
      ref={navigationRef}
      className="home-nav public-nav"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          closeNavigation(true);
        }
      }}
    >
      <div className="home-brand public-nav-brand" data-logo-surface="light"><BrandLogo /></div>
      <button
        className="home-menu-toggle public-nav-toggle"
        type="button"
        onClick={() => {
          setIsMobileMenuOpen((isOpen) => !isOpen);
          setOpenGroup(null);
        }}
        aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
        aria-controls="trussline-primary-navigation"
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>

      <nav
        id="trussline-primary-navigation"
        className={`public-nav-list${isMobileMenuOpen ? " is-open" : ""}`}
        aria-label="Primary navigation"
      >
        {navigationGroups.map((group) => {
          const Icon = group.icon;
          const isOpen = openGroup === group.id;
          const isCurrent = active === "about" && group.id === "discover";

          return (
            <div
              key={group.id}
              className={`public-nav-group${isOpen ? " is-active" : ""}`}
              onMouseEnter={() => setOpenGroup(group.id)}
              onMouseLeave={() => setOpenGroup(null)}
              onFocus={() => setOpenGroup(group.id)}
              onBlur={handleGroupBlur}
            >
              <button
                className="public-nav-trigger"
                type="button"
                onClick={(event) => toggleGroup(group.id, event.currentTarget)}
                aria-expanded={isOpen}
                aria-controls={`trussline-menu-${group.id}`}
                data-current={isCurrent || undefined}
              >
                <Icon className="public-nav-trigger-icon" size={17} aria-hidden="true" />
                <span>{group.label}</span>
                <ChevronDown className="public-nav-chevron" size={15} aria-hidden="true" />
              </button>
              <div
                id={`trussline-menu-${group.id}`}
                className="public-nav-panel"
                aria-hidden={!isOpen}
              >
                <p className="public-nav-panel-label">{group.label}</p>
                {group.links.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="public-nav-link"
                    tabIndex={isOpen ? undefined : -1}
                    onClick={() => closeNavigation()}
                  >
                    <span>
                      <strong>{link.title}</strong>
                      <small>{link.description}</small>
                    </span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="public-nav-actions">
        {controls ? <div className="public-nav-controls">{controls}</div> : null}
        {active !== "about" ? <Link href="/about" className="public-nav-read">
          <span>Read more</span><ArrowRight size={16} aria-hidden="true" />
        </Link> : null}
      </div>
    </header>
  );
}
