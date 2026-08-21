type BrandLogoProps = { dark?: boolean };

export default function BrandLogo({ dark = false }: BrandLogoProps) {
  return <span className={`brand-logo${dark ? " is-dark" : ""}`} aria-label="Trussline Interactive"><svg viewBox="0 0 72 54" aria-hidden="true"><path d="M8 41 25 22l15 10L59 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"/><path d="M7 42h59" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" opacity=".18"/><circle cx="8" cy="41" r="5" fill="#E8663D"/><circle cx="25" cy="22" r="5" fill="#1F44C9"/><circle cx="40" cy="32" r="5" fill="#17A07A"/><circle cx="59" cy="8" r="5" fill="#E8A32D"/></svg><span><strong>Trussline</strong><small>INTERACTIVE</small></span></span>;
}
