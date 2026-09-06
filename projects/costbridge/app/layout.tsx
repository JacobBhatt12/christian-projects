import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CostBridge | Lower costs, nearby help",
    template: "%s | CostBridge",
  },
  description:
    "Compare lower-cost alternatives for essential expenses and find community assistance near your ZIP code.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
