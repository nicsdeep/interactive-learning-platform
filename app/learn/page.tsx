import Link from "next/link";
import { ArrowLeft, BellRing, Sparkles } from "lucide-react";
import BrandLogo from "../brand-logo";

export default function LearnPage(){return <main className="coming-soon"><Link href="/" aria-label="Back to Trussline Interactive Learning"><ArrowLeft size={17}/><BrandLogo /></Link><section><Sparkles size={24}/><p>INTERACTIVE LEARNING IS ON ITS WAY</p><h1>We&apos;re building this with care.</h1><span>The Trussline learning experience is not open yet. Join the waitlist to hear when the first international learning routes are ready.</span><button><BellRing size={16}/> Join the waitlist</button></section></main>}
