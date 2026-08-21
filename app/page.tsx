"use client";

import Link from "next/link";
import BrandLogo from "./brand-logo";
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, Clock3, Compass, Globe2, GraduationCap, Info, Library, MapPin, Menu, RefreshCw, School, Search, Sparkles, X } from "lucide-react";
import { countries, getEmojiFlag, type TCountryCode } from "countries-list";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type LocationSource = "detecting" | "device" | "network" | "manual" | "unavailable";

type LocationResponse = {
  city?: string;
  continentCode?: string;
  countryCode?: string;
  timezone?: string;
};

const continents = [
  { code: "AF", name: "Africa" },
  { code: "AS", name: "Asia" },
  { code: "EU", name: "Europe" },
  { code: "NA", name: "North America" },
  { code: "SA", name: "South America" },
  { code: "OC", name: "Oceania" },
  { code: "AN", name: "Antarctica" },
];

const countryData = Object.entries(countries)
  .map(([code, country]) => ({ code, name: country.name, continent: country.continent }))
  .sort((a, b) => a.name.localeCompare(b.name));

const timezoneCountries: Record<string, string> = {
  "Africa/Accra": "GH",
  "Africa/Addis_Ababa": "ET",
  "Africa/Cairo": "EG",
  "Africa/Dar_es_Salaam": "TZ",
  "Africa/Johannesburg": "ZA",
  "Africa/Kampala": "UG",
  "Africa/Kigali": "RW",
  "Africa/Lagos": "NG",
  "Africa/Nairobi": "KE",
  "Asia/Dubai": "AE",
  "Asia/Kolkata": "IN",
  "Asia/Seoul": "KR",
  "Asia/Singapore": "SG",
  "Asia/Tokyo": "JP",
  "Australia/Sydney": "AU",
  "Europe/Amsterdam": "NL",
  "Europe/Berlin": "DE",
  "Europe/Dublin": "IE",
  "Europe/London": "GB",
  "Europe/Madrid": "ES",
  "Europe/Paris": "FR",
  "Europe/Rome": "IT",
  "Europe/Zurich": "CH",
  "Pacific/Auckland": "NZ",
};

const sourceCopy: Record<LocationSource, string> = {
  detecting: "Setting your learning region",
  device: "Using your device settings",
  network: "Your learning region is ready",
  manual: "Your selected learning region",
  unavailable: "Choose your learning region",
};

function validCountryCode(code?: string | null) {
  const normalized = code?.toUpperCase();
  return normalized && countryData.some((item) => item.code === normalized) ? normalized : undefined;
}

function countryFromDeviceLocale() {
  if (typeof navigator === "undefined") return undefined;
  const locale = navigator.languages?.[0] ?? navigator.language;
  if (!locale) return undefined;
  try {
    return validCountryCode(new Intl.Locale(locale).region);
  } catch {
    const candidate = locale.split("-").at(-1);
    return candidate?.length === 2 ? validCountryCode(candidate) : undefined;
  }
}

function deviceTimeZone() {
  if (typeof Intl === "undefined") return "";
  return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
}

function localTimeLabel(timeZone: string) {
  if (!timeZone) return "Setting your local time";
  try {
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZone, timeZoneName: "short" }).format(new Date());
  } catch {
    return timeZone.replaceAll("_", " ");
  }
}

function countryFlag(code: string) {
  return getEmojiFlag(code as TCountryCode);
}

function CountryFlag({ code, className }: { code?: string; className: string }) {
  return <span className={className} aria-hidden="true">{code ? <><span className="flag-fallback">{countryFlag(code)}</span><img src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /></> : <Globe2 size={20} />}</span>;
}

export default function HomePage() {
  const [continent, setContinent] = useState("");
  const [country, setCountry] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationSource, setLocationSource] = useState<LocationSource>("detecting");
  const [locationCity, setLocationCity] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [localTime, setLocalTime] = useState("");
  const [checkingLocation, setCheckingLocation] = useState(false);
  const manualSelectionRef = useRef(false);

  const applyDetectedCountry = useCallback((code: string | undefined | null, source: "device" | "network", city = "") => {
    const normalized = validCountryCode(code);
    const match = normalized ? countryData.find((item) => item.code === normalized) : undefined;
    if (!match || manualSelectionRef.current) return false;
    setCountry(match.code);
    setContinent(match.continent);
    setCountrySearch("");
    setCountryOpen(false);
    setLocationSource(source);
    if (city) setLocationCity(city);
    return true;
  }, []);

  const detectLocation = useCallback(async () => {
    if (manualSelectionRef.current) return;
    setCheckingLocation(true);
    try {
      const response = await fetch("/api/location", { cache: "no-store" });
      if (!response.ok) throw new Error("Location unavailable");
      const data = await response.json() as LocationResponse;
      if (!applyDetectedCountry(data.countryCode, "network", data.city)) {
        setLocationSource((current) => current === "detecting" ? "unavailable" : current);
      }
    } catch {
      setLocationSource((current) => current === "detecting" ? "unavailable" : current);
    } finally {
      setCheckingLocation(false);
    }
  }, [applyDetectedCountry]);

  const syncDeviceContext = useCallback(() => {
    manualSelectionRef.current = false;
    setCheckingLocation(true);
    setLocationCity("");
    setLocationSource("detecting");
    const nextTimeZone = deviceTimeZone();
    setTimeZone(nextTimeZone);
    setLocalTime(localTimeLabel(nextTimeZone));
    const deviceCountry = timezoneCountries[nextTimeZone] ?? countryFromDeviceLocale();
    const hasDeviceRegion = applyDetectedCountry(deviceCountry, "device");
    if (hasDeviceRegion) {
      setCheckingLocation(false);
      return;
    }
    void detectLocation();
  }, [applyDetectedCountry, detectLocation]);

  useEffect(() => {
    syncDeviceContext();
    const updateClock = () => {
      const currentTimeZone = deviceTimeZone();
      setTimeZone(currentTimeZone);
      setLocalTime(localTimeLabel(currentTimeZone));
    };
    const timer = window.setInterval(updateClock, 30_000);
    window.addEventListener("focus", updateClock);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", updateClock);
    };
  }, [syncDeviceContext]);

  const availableCountries = useMemo(() => countryData.filter((item) => !continent || item.continent === continent), [continent]);
  const selectedContinent = continents.find((item) => item.code === continent)?.name ?? "International";
  const selectedCountry = countryData.find((item) => item.code === country)?.name ?? "Finding your country";
  const matchingCountries = useMemo(() => {
    const query = countrySearch.trim().toLowerCase();
    const pool = query ? countryData : availableCountries;
    return pool.filter((item) => item.name.toLowerCase().includes(query));
  }, [availableCountries, countrySearch]);

  const chooseContinent = (code: string) => {
    manualSelectionRef.current = true;
    const firstCountry = countryData.find((item) => item.continent === code);
    setContinent(code);
    setCountry(firstCountry?.code ?? "");
    setCountrySearch("");
    setCountryOpen(false);
    setLocationCity("");
    setLocationSource("manual");
  };

  const chooseCountry = (code: string) => {
    const nextCountry = countryData.find((item) => item.code === code);
    if (!nextCountry) return;
    manualSelectionRef.current = true;
    setCountry(nextCountry.code);
    setContinent(nextCountry.continent);
    setCountrySearch("");
    setCountryOpen(false);
    setLocationCity("");
    setLocationSource("manual");
  };

  const locationName = locationCity && country ? `${locationCity}, ${selectedCountry}` : selectedCountry;
  const displayLocalTime = localTime || localTimeLabel(timeZone);

  return <main className="home-refined">
    <header className="home-nav">
      <Link href="/" className="home-brand" aria-label="Trussline Interactive Learning home"><BrandLogo /></Link>
      <button className="home-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
      <nav className={menuOpen ? "is-open" : ""} aria-label="Primary navigation">
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
    <section className="region-selector" id="region-selector" aria-labelledby="learning-region-title">
      <div className="region-overview">
        <span className="region-marker" aria-hidden="true"><MapPin size={20} /></span>
        <div><p className="region-eyebrow">YOUR LEARNING REGION</p><h2 id="learning-region-title">Built around where you learn.</h2><p>Your device time zone helps us prepare a learning route that feels local from the start.</p></div>
      </div>
      <div className="region-current" aria-live="polite">
        <span className={`region-source is-${locationSource}`}><i />{sourceCopy[locationSource]}</span>
        <div className="region-current-place"><CountryFlag code={country || undefined} className="country-flag" /><div><strong>{locationName}</strong><small>{selectedContinent} learning context</small></div><button className="region-refresh" type="button" onClick={syncDeviceContext} disabled={checkingLocation} aria-label="Update learning region"><RefreshCw size={15} className={checkingLocation ? "is-spinning" : ""} /><span>Update</span></button></div>
        <div className="region-timezone"><Clock3 size={15} /><span>Your local time</span><strong>{displayLocalTime}</strong></div>
      </div>
      <div className="region-controls">
        <label><span>CONTINENT</span><select value={continent} onChange={(event) => chooseContinent(event.target.value)} aria-label="Select continent"><option value="" disabled>Choose a continent</option>{continents.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>
        <div className="country-picker"><span>COUNTRY</span><button type="button" onClick={() => setCountryOpen(!countryOpen)} aria-expanded={countryOpen} aria-haspopup="listbox"><CountryFlag code={country || undefined} className="country-button-flag" /><b>{country ? selectedCountry : "Choose a country"}</b><ChevronDown size={16} /></button>{countryOpen && <><button className="country-options-backdrop" type="button" aria-label="Close country picker" onClick={() => setCountryOpen(false)} /><div className="country-options" role="listbox" aria-label="Countries"><div className="country-options-search"><Search size={16} /><input autoFocus placeholder="Search any country" value={countrySearch} onChange={(event) => setCountrySearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setCountryOpen(false); }} aria-label="Search countries" /><button type="button" onClick={() => setCountryOpen(false)} aria-label="Close country picker"><X size={16} /></button></div><div className="country-options-list">{matchingCountries.map((item) => <button type="button" key={item.code} role="option" aria-selected={item.code === country} onClick={() => chooseCountry(item.code)}><CountryFlag code={item.code} className="country-option-flag" /><b>{item.name}</b><small>{continents.find((entry) => entry.code === item.continent)?.name}</small></button>)}</div></div></>}</div>
      </div>
      <div className="region-note"><CheckCircle2 size={17} /><p>Your learning region helps tailor what you see first. You can change it any time.</p></div>
    </section>
    <section className="home-context"><p>THE TRUSSLINE ROUTE</p><div><span>Kenya CBE/CBC</span><span>USA standards</span><span>England National Curriculum</span><span>Interactive mastery</span><span>Curriculum intelligence</span></div></section>
  </main>;
}
