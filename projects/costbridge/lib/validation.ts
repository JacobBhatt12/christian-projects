import { z } from "zod";
import { categorySlugs } from "@/lib/types";
import { sanitizeMultilineText, sanitizeText, sanitizeUrl } from "@/lib/sanitize";

const shortText = (label: string, max = 120) =>
  z
    .string()
    .trim()
    .min(2, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`)
    .transform(sanitizeText);

const optionalShortText = (max = 120) =>
  z
    .string()
    .trim()
    .max(max, `Please use ${max} characters or fewer.`)
    .transform(sanitizeText)
    .optional()
    .or(z.literal(""));

const longText = (label: string, max = 1200) =>
  z
    .string()
    .trim()
    .min(8, `Please add a little more detail for ${label.toLowerCase()}.`)
    .max(max, `${label} must be ${max} characters or fewer.`)
    .transform(sanitizeMultilineText);

export const zipSchema = z
  .string()
  .trim()
  .regex(/^\d{5}$/, "Enter a 5-digit ZIP code.");

export const searchSchema = z.object({
  zip: zipSchema,
  category: z.enum(categorySlugs),
  need: z
    .string()
    .trim()
    .max(120, "Keep your search to 120 characters or fewer.")
    .transform(sanitizeText)
    .optional()
    .default(""),
  distance: z.coerce.number().min(1).max(100).optional().default(25),
  sort: z.enum(["price", "distance", "savings"]).optional().default("savings"),
  free: z.coerce.boolean().optional().default(false),
  discounted: z.coerce.boolean().optional().default(false),
  transitAccessible: z.coerce.boolean().optional().default(false),
  onlineAvailable: z.coerce.boolean().optional().default(false),
});

export const resourceSubmissionSchema = z.object({
  organizationName: shortText("Organization name"),
  contactName: shortText("Contact name"),
  contactEmail: z
    .email("Enter a valid email address.")
    .max(200)
    .transform((value) => value.toLowerCase()),
  contactPhone: optionalShortText(30),
  category: z.enum(categorySlugs),
  description: longText("Description", 800),
  address: shortText("Street address", 180),
  city: shortText("City", 80),
  state: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "Use a 2-letter state abbreviation.")
    .transform((value) => value.toUpperCase()),
  zip: zipSchema,
  website: z
    .string()
    .trim()
    .max(300)
    .transform(sanitizeUrl)
    .optional()
    .or(z.literal("")),
  services: longText("Services offered", 1000),
  eligibility: longText("Eligibility information", 1000),
  hours: longText("Hours", 500),
  languages: longText("Languages", 300),
  applicationInstructions: longText("Application instructions", 1200),
  attestation: z.literal(true, {
    error: "Confirm that this information is accurate to the best of your knowledge.",
  }),
});

export const savedItemSchema = z.object({
  clientId: z.string().uuid("Saved-list identifier is invalid."),
  itemType: z.enum(["resource", "alternative"]),
  itemId: z.string().regex(/^[a-z0-9-]{3,80}$/i, "Item identifier is invalid."),
});

export const adminSubmissionUpdateSchema = z.object({
  entity: z.literal("submission"),
  id: z.string().regex(/^[a-z0-9-]{3,80}$/i),
  status: z.enum(["pending", "approved", "changes_requested", "rejected"]),
  reviewerNotes: z
    .string()
    .max(1200)
    .transform(sanitizeMultilineText)
    .optional()
    .default(""),
  edits: z
    .object({
      organizationName: optionalShortText(120),
      description: z.string().max(800).transform(sanitizeMultilineText).optional(),
      eligibility: z.string().max(1000).transform(sanitizeMultilineText).optional(),
      hours: z.string().max(500).transform(sanitizeMultilineText).optional(),
    })
    .optional(),
});

export const adminResourceUpdateSchema = z.object({
  entity: z.literal("resource"),
  id: z.string().regex(/^[a-z0-9-]{3,80}$/i),
  action: z.literal("verify"),
  method: shortText("Verification method", 200),
  notes: z.string().max(800).transform(sanitizeMultilineText).optional().default(""),
});

export const adminUpdateSchema = z.discriminatedUnion("entity", [
  adminSubmissionUpdateSchema,
  adminResourceUpdateSchema,
]);

export type ResourceSubmissionInput = z.infer<typeof resourceSubmissionSchema>;
