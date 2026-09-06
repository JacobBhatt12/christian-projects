import { CircleAlert, Info } from "lucide-react";

export function Notice({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: "info" | "warning";
}) {
  const Icon = tone === "warning" ? CircleAlert : Info;
  return (
    <div className={`notice notice-${tone}`} role={tone === "warning" ? "alert" : "note"}>
      <Icon aria-hidden="true" size={20} />
      <div>{children}</div>
    </div>
  );
}
