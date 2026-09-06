import { describe, expect, it } from "vitest";
import { assistanceResources } from "@/lib/data/resources";
import { alternatives } from "@/lib/data/alternatives";
import { resourceSubmissionSchema } from "@/lib/validation";

const validSubmission = {
  organizationName: "Neighborhood Help Center",
  contactName: "Jordan Lee",
  contactEmail: "JORDAN@example.org",
  contactPhone: "(813) 555-0199",
  category: "utilities",
  description: "Provides application help for household utility assistance.",
  address: "100 Main Street",
  city: "Tampa",
  state: "fl",
  zip: "33602",
  website: "example.org/help",
  services: "Electric bill application help and payment plan referrals.",
  eligibility: "Program staff review household income and current account information.",
  hours: "Monday through Friday, 9 AM to 4 PM.",
  languages: "English and Spanish are available.",
  applicationInstructions: "Call the office to complete an intake and confirm documents before visiting.",
  attestation: true,
} as const;

describe("resource submissions", () => {
  it("accepts, normalizes, and sanitizes a complete submission", () => {
    const parsed = resourceSubmissionSchema.parse({
      ...validSubmission,
      organizationName: "<b>Neighborhood Help Center</b>",
    });
    expect(parsed.organizationName).toBe("Neighborhood Help Center");
    expect(parsed.contactEmail).toBe("jordan@example.org");
    expect(parsed.state).toBe("FL");
    expect(parsed.website).toBe("https://example.org/help");
  });

  it("rejects an invalid ZIP and missing attestation", () => {
    const parsed = resourceSubmissionSchema.safeParse({
      ...validSubmission,
      zip: "3362",
      attestation: false,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      expect(fields.zip).toBeDefined();
      expect(fields.attestation).toBeDefined();
    }
  });

  it("ships at least 20 sample records of each result type", () => {
    expect(assistanceResources.length).toBeGreaterThanOrEqual(20);
    expect(alternatives.length).toBeGreaterThanOrEqual(20);
    expect(assistanceResources.every((item) => item.isSample)).toBe(true);
    expect(alternatives.every((item) => item.isSample)).toBe(true);
  });
});
