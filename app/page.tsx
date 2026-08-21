"use client";

import Link from "next/link";
import BrandLogo from "./brand-logo";
import { ArrowRight, BookOpen, ChevronDown, Compass, Globe2, GraduationCap, Info, Library, Menu, Search, School, Sparkles, X } from "lucide-react";
import { countries } from "countries-list";
import { useMemo, useState } from "react";

const continents = [{ code: "AF", name: "Africa" }, { code: "AS", name: "Asia" }, { code: "EU", name: "Europe" }, { code: "NA", name: "North America" }, { code: "SA", name: "South America" }, { code: "OC", name: "Oceania" }, { code: "AN", name: "Antarctica" }];
const countryData = Object.entries(countries).map(([code, country]) => ({ code, name: country.name, continent: country.continent })).sort((a, b) => a.name.localeCompare(b.name));
const logo = <BrandLogo />;

export default function HomePage() {
  const [continent, setContinent] = useState("AF");
  const [country, setCountry] = useState("ZA");
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const availableCountries = useMemo(() => countryData.filter((item) => item.continent === continent), [continent]);
  const selectedContinent = continents.find((item) => item.code === continent)?.name ?? "Africa";
  const selectedCountry = countryData.find((item) => item.code === country)?.name ?? "South Africa";
  const matchingCountries = availableCountries.filter((item) => item.name.toLowerCase().includes(countrySearch.toLowerCase()));

  const chooseContinent = (code: string) => { setContinent(code); setCountry(countryData.find((item) => item.continent === code)?.code ?? "AQ"); setCountrySearch(""); setCountryOpen(false); };
  return <main className="home-refined">
    <header className="home-nav">
      <Link href="/" className="home-brand" aria-label="Trussline International home">{logo}</Link>
      <button className="home-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open navigation">{menuOpen ? <X /> : <Menu />}</button>
      <nav className={menuOpen ? "is-open" : ""}>
        <Link href="/how-it-works"><Compass className="mobile-nav-icon" size={18} /><span>Our approach</span><ChevronDown size={14} /></Link>
        <Link href="/curricula"><BookOpen className="mobile-nav-icon" size={18} /><span>Programs &amp; Subjects</span><ChevronDown size={14} /></Link>
        <Link href="/how-it-works"><GraduationCap className="mobile-nav-icon" size={18} /><span>For Learners</span><ChevronDown size={14} /></Link>
        <Link href="/schools"><School className="mobile-nav-icon" size={18} /><span>For Schools</span><ChevronDown size={14} /></Link>
        <Link href="/families"><Library className="mobile-nav-icon" size={18} /><span>Resources</span><ChevronDown size={14} /></Link>
        <Link href="/"><Info className="mobile-nav-icon" size={18} /><span>About Us</span><ChevronDown size={14} /></Link>
      </nav>
      <div className="home-nav-actions"><button className="home-search" onClick={() => setSearchOpen(!searchOpen)}><Search size={18} /> <span>Search</span></button><button className="home-region-button" onClick={() => document.getElementById("region-selector")?.scrollIntoView({ behavior: "smooth" })}><Globe2 size={18} /> <span>Select region</span><ChevronDown size={15} /></button><Link href="/learn" className="home-primary">Join the waitlist <ArrowRight size={17} /></Link></div>
      {searchOpen && <div className="home-search-popover"><Search size={17} /><input autoFocus aria-label="Search Trussline" placeholder="Search Trussline" /><button onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={16} /></button></div>}
    </header>
    <section className="home-hero">
      <div className="home-copy"><p className="home-eyebrow"><Sparkles size={15} /> INTERACTIVE LEARNING, GLOBALLY</p><h1>Learning that<br />meets the world<br /><em>where it is.</em></h1><p>Trussline International transforms curriculum into active, adaptive learning—empowering every learner to grow with confidence and purpose.</p><div className="home-hero-actions"><Link href="/learn" className="home-primary">Join the waitlist <ArrowRight size={17} /></Link><Link href="/how-it-works" className="home-secondary">Explore our approach <ArrowRight size={16} /></Link></div></div>
      <div className="world-globe" aria-label="A connected global learning network"><div className="globe-map" /><i className="globe-longitude one" /><i className="globe-longitude two" /><i className="globe-longitude three" /><i className="globe-latitude one" /><i className="globe-latitude two" /><i className="globe-latitude three" /><b className="globe-marker north" /><b className="globe-marker asia" /><b className="globe-marker oceania" /></div>
    </section>
    <section className="region-selector" id="region-selector">
      <Globe2 className="region-icon" size={27} /><label><span>SELECT CONTINENT</span><select value={continent} onChange={(event) => chooseContinent(event.target.value)} aria-label="Select continent">{continents.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label><div className="country-picker"><span>SELECT COUNTRY</span><button type="button" onClick={() => setCountryOpen(!countryOpen)} aria-expanded={countryOpen}><img src={`https://flagcdn.com/w40/${country.toLowerCase()}.png`} onError={(event) => { event.currentTarget.style.display = "none"; }} alt="" /><b>{selectedCountry}</b><ChevronDown size={16} /></button>{countryOpen && <div className="country-options"><input autoFocus placeholder="Search a country" value={countrySearch} onChange={(event) => setCountrySearch(event.target.value)} aria-label="Search countries" />{matchingCountries.map((item) => <button type="button" key={item.code} onClick={() => { setCountry(item.code); setCountryOpen(false); setCountrySearch(""); }}><img src={`https://flagcdn.com/w40/${item.code.toLowerCase()}.png`} onError={(event) => { event.currentTarget.style.display = "none"; }} alt="" />{item.name}</button>)}</div>}</div><div className="region-message"><Globe2 size={29} /><p>We are building a global platform,<br />one meaningful learning route at a time.</p><small>{selectedContinent} · {selectedCountry}</small></div></section>
    <section className="home-context"><p>THE TRUSSLINE ROUTE</p><div><span>Kenya CBE/CBC</span><span>USA standards</span><span>England National Curriculum</span><span>Interactive mastery</span><span>Curriculum intelligence</span></div></section>
  </main>;
}
