import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata: Metadata = { title: "Admin review" };

export default function AdminPage() {
  return (
    <main id="main-content" className="admin-page">
      <header className="admin-page-heading">
        <p className="eyebrow">CostBridge operations</p>
        <h1>Review and verification</h1>
        <p>Approve suggestions carefully, edit unclear language, and record how published information was checked.</p>
      </header>
      <AdminDashboard />
    </main>
  );
}
