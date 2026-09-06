import type { Metadata } from "next";
import { ResourceSubmissionForm } from "@/components/submissions/resource-submission-form";

export const metadata: Metadata = { title: "Suggest a resource" };

export default function SuggestPage() {
  return (
    <main id="main-content" className="page-shell suggest-page">
      <header className="page-heading suggest-heading">
        <p className="eyebrow">Help keep the bridge useful</p>
        <h1>Suggest a community resource</h1>
        <p>Organizations and residents can share a program for review. Nothing becomes public automatically.</p>
      </header>
      <ResourceSubmissionForm />
    </main>
  );
}
