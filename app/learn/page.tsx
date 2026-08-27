import Link from "next/link";
import { ArrowLeft, BellRing, Sparkles } from "lucide-react";
import BrandLogo from "../brand-logo";

export default function LearnPage(){return <main className="coming-soon"><header><div className="coming-soon-brand"><BrandLogo /></div><Link href="/" className="coming-soon-back"><ArrowLeft size={17}/> Back to home</Link></header><section><Sparkles size={24}/><p>INTERACTIVE LEARNING IS ON ITS WAY</p><h1>We&apos;re building this with care.</h1><span>The Trussline learning experience is not open yet. Get launch updates when the first learner experiences are ready.</span><button><BellRing size={16}/> Get launch updates</button></section></main>}
