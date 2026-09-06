import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer print:hidden">
      <div className="site-footer-inner">
        <div>
          <p className="footer-title">CostBridge</p>
          <p className="footer-copy">
            Practical ways to spend less and find nearby support. No account needed.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="footer-nav">
          <Link href="/search">Search</Link>
          <Link href="/suggest">Suggest a resource</Link>
          <Link href="/admin">Admin</Link>
        </nav>
        <p className="privacy-note">
          We use only the ZIP code you enter. We do not request precise location or sell personal information.
        </p>
      </div>
    </footer>
  );
}
