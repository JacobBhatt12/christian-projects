import Link from "next/link";
import { ArrowUpRight, CalendarClock, MapPin, Phone } from "lucide-react";
import { SaveButton } from "@/components/actions/save-button";
import { ShareButton } from "@/components/actions/share-button";
import { StatusLabel } from "@/components/ui/status-label";
import type { ResourceResult } from "@/lib/types";

export function ResourceRow({ resource, zip }: { resource: ResourceResult; zip: string }) {
  const detailUrl = `/resources/${resource.id}?zip=${encodeURIComponent(zip)}`;
  return (
    <article className="result-row resource-row">
      <div className="result-row-main">
        <div className="result-kicker">
          <StatusLabel status={resource.verificationStatus} isSample={resource.isSample} />
          {resource.free ? <span>Free services listed</span> : resource.discounted ? <span>Reduced-cost help</span> : null}
        </div>
        <h3><Link href={detailUrl}>{resource.organizationName}</Link></h3>
        <p className="result-description">{resource.description}</p>
        <div className="resource-facts">
          <p><MapPin aria-hidden="true" size={17} /> {resource.location.address}, {resource.location.city}, {resource.location.state} {resource.location.zip} <span>({resource.distance.toFixed(1)} mi estimated)</span></p>
          <p><Phone aria-hidden="true" size={17} /> <a href={`tel:${resource.phone}`}>{resource.phone}</a></p>
          <p><CalendarClock aria-hidden="true" size={17} /> {resource.hours[0]}</p>
        </div>
        <ul className="service-tags" aria-label="Services offered">
          {resource.services.slice(0, 4).map((service) => <li key={service}>{service}</li>)}
        </ul>
        <p className="eligibility-preview"><strong>Eligibility:</strong> {resource.eligibility}</p>
        <div className="result-actions print:hidden">
          <Link href={detailUrl} className="text-action">View details <ArrowUpRight aria-hidden="true" size={17} /></Link>
          <SaveButton itemType="resource" itemId={resource.id} />
          <ShareButton title={resource.organizationName} url={detailUrl} />
        </div>
      </div>
      <aside className="freshness-block">
        <span>{resource.isSample ? "Sample information date" : resource.verificationStatus === "verified" ? "Last verified" : "Information submitted"}</span>
        <strong>{new Date(`${resource.lastVerified}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong>
        <small>Call before making a trip</small>
      </aside>
    </article>
  );
}
