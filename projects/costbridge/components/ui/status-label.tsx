import { BadgeCheck, CircleAlert, FlaskConical } from "lucide-react";
import type { VerificationStatus } from "@/lib/types";

export function StatusLabel({
  status,
  isSample,
}: {
  status: VerificationStatus;
  isSample?: boolean;
}) {
  if (isSample || status === "sample") {
    return (
      <span className="status-label status-sample">
        <FlaskConical aria-hidden="true" size={14} /> Sample data
      </span>
    );
  }
  if (status === "verified") {
    return (
      <span className="status-label status-verified">
        <BadgeCheck aria-hidden="true" size={14} /> Verified
      </span>
    );
  }
  return (
    <span className="status-label status-unverified">
      <CircleAlert aria-hidden="true" size={14} /> Not yet verified
    </span>
  );
}
