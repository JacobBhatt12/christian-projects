import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, ExternalLink, Globe2, Languages, MapPin, Phone } from "lucide-react";
import { PrintButton } from "@/components/actions/print-button";
import { SaveButton } from "@/components/actions/save-button";
import { ShareButton } from "@/components/actions/share-button";
import { Notice } from "@/components/ui/notice";
import { StatusLabel } from "@/components/ui/status-label";
import { calculateDistanceMiles, getCoordinatesForZip } from "@/lib/location";
import { getResourceById } from "@/lib/server/repository";
import { zipSchema } from "@/lib/validation";

type ResourcePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(props: ResourcePageProps): Promise<Metadata> {
  const { id } = await props.params;
  if (!/^[a-z0-9-]{3,80}$/i.test(id)) return { title: "Resource not found" };
  const resource = await getResourceById(id);
  return { title: resource?.organizationName ?? "Resource not found" };
}

export default async function ResourceDetailPage(props: ResourcePageProps) {
  const [{ id }, searchParams] = await Promise.all([props.params, props.searchParams]);
  if (!/^[a-z0-9-]{3,80}$/i.test(id)) notFound();
  const resource = await getResourceById(id);
  if (!resource) notFound();

  const parsedZip = zipSchema.safeParse(
    Array.isArray(searchParams.zip) ? searchParams.zip[0] : searchParams.zip,
  );
  const distance = parsedZip.success
    ? calculateDistanceMiles(getCoordinatesForZip(parsedZip.data), resource.location)
    : null;

  return (
    <main id="main-content" className="resource-detail-page">
      <Link href={parsedZip.success ? `/results?zip=${parsedZip.data}&category=${resource.category}&need=` : "/search"} className="back-link print:hidden">
        <ArrowLeft aria-hidden="true" size={18} /> Back to results
      </Link>

      <header className="resource-detail-heading">
        <div>
          <div className="result-kicker">
            <StatusLabel status={resource.verificationStatus} isSample={resource.isSample} />
            <span>{resource.isSample ? "Sample information date" : resource.verificationStatus === "verified" ? "Last verified" : "Information submitted"}: {new Date(`${resource.lastVerified}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
          <h1>{resource.organizationName}</h1>
          <p>{resource.description}</p>
        </div>
        <div className="heading-actions print:hidden">
          <SaveButton itemType="resource" itemId={resource.id} />
          <ShareButton title={resource.organizationName} />
          <PrintButton />
        </div>
      </header>

      {resource.isSample ? (
        <Notice tone="warning"><strong>Sample listing:</strong> This fictional development record must not be used to plan a visit or application.</Notice>
      ) : resource.verificationStatus !== "verified" ? (
        <Notice tone="warning">This listing has not yet been independently verified. Contact the organization before relying on it.</Notice>
      ) : null}

      <div className="resource-detail-grid">
        <div className="resource-detail-primary">
          <section aria-labelledby="services-title">
            <h2 id="services-title">Services offered</h2>
            <ul className="plain-check-list">
              {resource.services.map((service) => <li key={service}>{service}</li>)}
            </ul>
          </section>

          <section aria-labelledby="eligibility-title">
            <h2 id="eligibility-title">Who the program may serve</h2>
            <p>{resource.eligibility}</p>
            <p className="caution-copy">The organization makes the final eligibility decision. A listing on CostBridge does not mean you will qualify.</p>
          </section>

          <section aria-labelledby="documents-title">
            <h2 id="documents-title">Documents to ask about</h2>
            <ul className="plain-list">
              {resource.requiredDocuments.map((document) => <li key={document}>{document}</li>)}
            </ul>
          </section>

          <section aria-labelledby="apply-title">
            <h2 id="apply-title">How to get started</h2>
            <p>{resource.applicationInstructions}</p>
          </section>
        </div>

        <aside className="resource-contact" aria-label="Contact and visit information">
          <h2>Contact and visit</h2>
          <dl>
            <div>
              <dt><MapPin aria-hidden="true" size={18} /> Address</dt>
              <dd>{resource.location.address}<br />{resource.location.city}, {resource.location.state} {resource.location.zip}{distance !== null ? <small>About {distance.toFixed(1)} miles from {parsedZip.data}</small> : null}</dd>
            </div>
            <div>
              <dt><Phone aria-hidden="true" size={18} /> Phone</dt>
              <dd><a href={`tel:${resource.phone}`}>{resource.phone}</a></dd>
            </div>
            {resource.website ? (
              <div>
                <dt><Globe2 aria-hidden="true" size={18} /> Website</dt>
                <dd><a href={resource.website} target="_blank" rel="noreferrer">Visit organization site <ExternalLink aria-hidden="true" size={15} /></a></dd>
              </div>
            ) : null}
            <div>
              <dt><CalendarClock aria-hidden="true" size={18} /> Hours</dt>
              <dd><ul>{resource.hours.map((hours) => <li key={hours}>{hours}</li>)}</ul></dd>
            </div>
            <div>
              <dt><Languages aria-hidden="true" size={18} /> Languages listed</dt>
              <dd>{resource.languages.join(", ")}</dd>
            </div>
          </dl>
          <p className="call-first">Hours and availability can change. Call before making a trip.</p>
        </aside>
      </div>
    </main>
  );
}
