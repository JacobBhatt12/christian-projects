import Link from "next/link";
import { ArrowRight, BadgeCheck, HeartHandshake, Scale, ShieldCheck } from "lucide-react";
import { SearchForm } from "@/components/search/search-form";

export default function Home() {
  return (
    <main id="main-content">
      <section className="home-hero">
        <div className="home-intro">
          <p className="eyebrow">Spend less on essentials</p>
          <h1>A better price. A nearby hand. One search.</h1>
          <p className="hero-copy">
            Compare lower-cost options and find community programs for the expenses that cannot wait.
          </p>
          <ul className="trust-list" aria-label="CostBridge promises">
            <li><ShieldCheck aria-hidden="true" size={19} /> No account needed</li>
            <li><BadgeCheck aria-hidden="true" size={19} /> Freshness shown clearly</li>
            <li><HeartHandshake aria-hidden="true" size={19} /> No judgment, just useful choices</li>
          </ul>
        </div>
        <div className="bridge-note" aria-label="What your search includes">
          <span className="bridge-note-label">One search brings together</span>
          <ol>
            <li><span>01</span> Prices and unit prices</li>
            <li><span>02</span> Honest savings estimates</li>
            <li><span>03</span> Nearby community support</li>
          </ol>
        </div>
      </section>

      <section className="home-search" aria-labelledby="search-heading">
        <div className="section-heading">
          <p className="eyebrow">Start here</p>
          <h2 id="search-heading">What would make this month easier?</h2>
          <p>Three quick answers. Your ZIP code is used only to estimate distance.</p>
        </div>
        <SearchForm />
      </section>

      <section className="how-it-helps" aria-labelledby="help-heading">
        <div className="section-heading narrow">
          <p className="eyebrow">Clear choices, not pressure</p>
          <h2 id="help-heading">Use what helps. Leave what does not.</h2>
        </div>
        <div className="help-lines">
          <article>
            <Scale aria-hidden="true" size={24} />
            <h3>Compare the whole cost</h3>
            <p>See price, unit price, estimated monthly savings, distance, and important tradeoffs together.</p>
          </article>
          <article>
            <HeartHandshake aria-hidden="true" size={24} />
            <h3>Know before you call</h3>
            <p>Review hours, eligibility, documents, languages, and application steps without a qualification promise.</p>
          </article>
          <article>
            <ShieldCheck aria-hidden="true" size={24} />
            <h3>Keep your privacy</h3>
            <p>Search without an account. CostBridge does not ask for precise location or sell personal information.</p>
          </article>
        </div>
        <Link href="/search" className="text-link forward-link">See all expense categories <ArrowRight aria-hidden="true" size={18} /></Link>
      </section>
    </main>
  );
}
