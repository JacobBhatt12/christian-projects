import Link from "next/link";
import { Bookmark, Plus } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export function SiteHeader() {
  return (
    <header className="site-header print:hidden">
      <div className="site-header-inner">
        <Logo />
        <nav aria-label="Main navigation" className="main-nav">
          <Link href="/search">Find savings</Link>
          <Link href="/suggest" className="nav-secondary">
            <Plus aria-hidden="true" size={17} />
            Suggest a resource
          </Link>
          <Link href="/saved" className="nav-saved">
            <Bookmark aria-hidden="true" size={17} />
            Saved
          </Link>
        </nav>
      </div>
    </header>
  );
}
