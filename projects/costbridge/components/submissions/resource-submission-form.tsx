"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";
import { categories } from "@/lib/data/categories";

type FieldErrors = Record<string, string[] | undefined>;

function FieldError({ name, errors }: { name: string; errors: FieldErrors }) {
  const message = errors[name]?.[0];
  return message ? <p id={`${name}-error`} className="field-error">{message}</p> : null;
}

function describedBy(name: string, errors: FieldErrors, help?: string) {
  return [help, errors[name] ? `${name}-error` : null].filter(Boolean).join(" ") || undefined;
}

export function ResourceSubmissionForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrors({});
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      ...Object.fromEntries(formData.entries()),
      attestation: formData.get("attestation") === "on",
    };

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        error?: string;
        fields?: FieldErrors;
        message?: string;
      };
      if (!response.ok) {
        setErrors(data.fields ?? {});
        setMessage(data.error ?? "Please check the form and try again.");
        setStatus("error");
        return;
      }
      form.reset();
      setMessage(data.message ?? "Thank you. The resource is queued for review.");
      setStatus("success");
    } catch {
      setMessage("We could not send the suggestion. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="submission-success" role="status">
        <CheckCircle2 aria-hidden="true" size={34} />
        <h2>Suggestion received</h2>
        <p>{message}</p>
        <p>Reviewers may contact the organization before publishing or verifying anything.</p>
        <div className="success-actions">
          <button type="button" className="button button-secondary" onClick={() => setStatus("idle")}>Suggest another</button>
          <Link href="/search" className="button button-primary">Return to search</Link>
        </div>
      </div>
    );
  }

  return (
    <form className="submission-form" onSubmit={submit} noValidate>
      {status === "error" ? <div className="form-summary-error" role="alert"><strong>We could not submit the form.</strong><span>{message}</span></div> : null}

      <fieldset>
        <legend><span>1</span> About the resource</legend>
        <div className="field-grid two-columns">
          <label className="field-group">
            <span>Organization or program name</span>
            <input name="organizationName" maxLength={120} required aria-invalid={Boolean(errors.organizationName)} aria-describedby={describedBy("organizationName", errors)} />
            <FieldError name="organizationName" errors={errors} />
          </label>
          <label className="field-group">
            <span>Expense category</span>
            <select name="category" defaultValue="" required aria-invalid={Boolean(errors.category)} aria-describedby={describedBy("category", errors)}>
              <option value="" disabled>Choose one</option>
              {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
            </select>
            <FieldError name="category" errors={errors} />
          </label>
          <label className="field-group full-column">
            <span>What does the program do?</span>
            <textarea name="description" rows={4} maxLength={800} required aria-invalid={Boolean(errors.description)} aria-describedby={describedBy("description", errors, "description-help")} />
            <small id="description-help">Use plain language. Do not include private client information.</small>
            <FieldError name="description" errors={errors} />
          </label>
          <label className="field-group full-column">
            <span>Services offered</span>
            <textarea name="services" rows={3} maxLength={1000} required placeholder="For example: food boxes, fresh produce, hygiene supplies" aria-invalid={Boolean(errors.services)} aria-describedby={describedBy("services", errors)} />
            <FieldError name="services" errors={errors} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend><span>2</span> Location and contact</legend>
        <div className="field-grid two-columns">
          <label className="field-group full-column">
            <span>Street address</span>
            <input name="address" autoComplete="street-address" maxLength={180} required aria-invalid={Boolean(errors.address)} aria-describedby={describedBy("address", errors)} />
            <FieldError name="address" errors={errors} />
          </label>
          <label className="field-group">
            <span>City</span>
            <input name="city" autoComplete="address-level2" maxLength={80} required aria-invalid={Boolean(errors.city)} aria-describedby={describedBy("city", errors)} />
            <FieldError name="city" errors={errors} />
          </label>
          <div className="field-row-split">
            <label className="field-group">
              <span>State</span>
              <input name="state" autoComplete="address-level1" maxLength={2} placeholder="FL" required aria-invalid={Boolean(errors.state)} aria-describedby={describedBy("state", errors)} />
              <FieldError name="state" errors={errors} />
            </label>
            <label className="field-group">
              <span>ZIP code</span>
              <input name="zip" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} required aria-invalid={Boolean(errors.zip)} aria-describedby={describedBy("zip", errors)} />
              <FieldError name="zip" errors={errors} />
            </label>
          </div>
          <label className="field-group">
            <span>Program website <small>(optional)</small></span>
            <input name="website" type="url" autoComplete="url" maxLength={300} placeholder="https://" aria-invalid={Boolean(errors.website)} aria-describedby={describedBy("website", errors)} />
            <FieldError name="website" errors={errors} />
          </label>
          <label className="field-group">
            <span>Public phone <small>(optional)</small></span>
            <input name="contactPhone" type="tel" autoComplete="tel" maxLength={30} aria-invalid={Boolean(errors.contactPhone)} aria-describedby={describedBy("contactPhone", errors)} />
            <FieldError name="contactPhone" errors={errors} />
          </label>
          <label className="field-group full-column">
            <span>Hours</span>
            <textarea name="hours" rows={3} maxLength={500} required placeholder="Include days, times, and whether an appointment is needed" aria-invalid={Boolean(errors.hours)} aria-describedby={describedBy("hours", errors)} />
            <FieldError name="hours" errors={errors} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend><span>3</span> What people should know</legend>
        <div className="field-grid">
          <label className="field-group">
            <span>Eligibility information</span>
            <textarea name="eligibility" rows={4} maxLength={1000} required aria-invalid={Boolean(errors.eligibility)} aria-describedby={describedBy("eligibility", errors, "eligibility-help")} />
            <small id="eligibility-help">Describe guidelines without promising that someone qualifies.</small>
            <FieldError name="eligibility" errors={errors} />
          </label>
          <label className="field-group">
            <span>Languages supported</span>
            <textarea name="languages" rows={2} maxLength={300} required placeholder="For example: English, Spanish, ASL by appointment" aria-invalid={Boolean(errors.languages)} aria-describedby={describedBy("languages", errors)} />
            <FieldError name="languages" errors={errors} />
          </label>
          <label className="field-group">
            <span>How to apply or get started</span>
            <textarea name="applicationInstructions" rows={4} maxLength={1200} required aria-invalid={Boolean(errors.applicationInstructions)} aria-describedby={describedBy("applicationInstructions", errors)} />
            <FieldError name="applicationInstructions" errors={errors} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend><span>4</span> Your contact information</legend>
        <p className="fieldset-intro">Used only if a reviewer needs to confirm the listing. It is not shown publicly.</p>
        <div className="field-grid two-columns">
          <label className="field-group">
            <span>Your name</span>
            <input name="contactName" autoComplete="name" maxLength={120} required aria-invalid={Boolean(errors.contactName)} aria-describedby={describedBy("contactName", errors)} />
            <FieldError name="contactName" errors={errors} />
          </label>
          <label className="field-group">
            <span>Your email</span>
            <input name="contactEmail" type="email" autoComplete="email" maxLength={200} required aria-invalid={Boolean(errors.contactEmail)} aria-describedby={describedBy("contactEmail", errors)} />
            <FieldError name="contactEmail" errors={errors} />
          </label>
        </div>
        <label className="attestation-check">
          <input type="checkbox" name="attestation" required aria-invalid={Boolean(errors.attestation)} aria-describedby={describedBy("attestation", errors)} />
          <span>This information is accurate to the best of my knowledge, and I understand it will be reviewed before publication.</span>
        </label>
        <FieldError name="attestation" errors={errors} />
      </fieldset>

      <div className="form-submit-row">
        <p>Submitting does not guarantee publication or verification.</p>
        <button type="submit" className="button button-primary" disabled={status === "submitting"}>
          <Send aria-hidden="true" size={18} /> {status === "submitting" ? "Sending…" : "Send for review"}
        </button>
      </div>
    </form>
  );
}
