"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button type="button" className="button button-secondary print:hidden" onClick={() => window.print()}>
      <Printer aria-hidden="true" size={18} /> Print results
    </button>
  );
}
