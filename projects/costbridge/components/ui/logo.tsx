import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="CostBridge home">
      <span className="logo-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span>CostBridge</span>
    </Link>
  );
}
