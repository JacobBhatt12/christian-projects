import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { alternatives as seedAlternatives } from "@/lib/data/alternatives";
import { assistanceResources as seedResources } from "@/lib/data/resources";
import { getCoordinatesForZip } from "@/lib/location";
import type {
  Alternative,
  AssistanceResource,
  ResourceSubmission,
  SavedItem,
  VerificationRecord,
  VerificationStatus,
} from "@/lib/types";
import type { ResourceSubmissionInput } from "@/lib/validation";

type ResourceOverride = Pick<
  AssistanceResource,
  "verificationStatus" | "lastVerified"
>;

type LocalState = {
  submissions: ResourceSubmission[];
  savedItems: SavedItem[];
  approvedResources: AssistanceResource[];
  resourceOverrides: Record<string, ResourceOverride>;
  verificationRecords: VerificationRecord[];
};

const emptyState: LocalState = {
  submissions: [],
  savedItems: [],
  approvedResources: [],
  resourceOverrides: {},
  verificationRecords: [],
};

const dataDirectory = path.join(process.cwd(), ".local-data");
const dataFile = path.join(dataDirectory, "costbridge.json");

function publicSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

function adminSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
}

async function readLocalState(): Promise<LocalState> {
  try {
    const contents = await readFile(dataFile, "utf8");
    return { ...emptyState, ...(JSON.parse(contents) as Partial<LocalState>) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { ...emptyState };
    throw error;
  }
}

async function writeLocalState(state: LocalState) {
  await mkdir(dataDirectory, { recursive: true });
  const temporaryFile = `${dataFile}.${crypto.randomUUID()}.tmp`;
  await writeFile(temporaryFile, JSON.stringify(state, null, 2), "utf8");
  await rename(temporaryFile, dataFile);
}

function mapLocation(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    address: String(row.address),
    city: String(row.city),
    state: String(row.state),
    zip: String(row.zip),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
  };
}

function mapResource(row: Record<string, unknown>): AssistanceResource {
  const location = (row.location ?? row.locations) as Record<string, unknown>;
  return {
    id: String(row.id),
    category: row.category_slug as AssistanceResource["category"],
    organizationName: String(row.organization_name),
    description: String(row.description),
    location: mapLocation(location),
    phone: String(row.phone),
    website: String(row.website),
    hours: (row.hours as string[]) ?? [],
    services: (row.services as string[]) ?? [],
    eligibility: String(row.eligibility),
    requiredDocuments: (row.required_documents as string[]) ?? [],
    languages: (row.languages as string[]) ?? [],
    applicationInstructions: String(row.application_instructions),
    lastVerified: String(row.last_verified),
    verificationStatus: row.verification_status as VerificationStatus,
    isSample: Boolean(row.is_sample),
    free: Boolean(row.is_free),
    discounted: Boolean(row.is_discounted),
    transitAccessible: Boolean(row.transit_accessible),
    onlineAvailable: Boolean(row.online_available),
    tags: (row.tags as string[]) ?? [],
  };
}

function mapAlternative(row: Record<string, unknown>): Alternative {
  const location = (row.location ?? row.locations) as Record<string, unknown> | null;
  return {
    id: String(row.id),
    category: row.category_slug as Alternative["category"],
    title: String(row.title),
    provider: String(row.provider),
    description: String(row.description),
    price: Number(row.price),
    quantity: Number(row.quantity),
    unit: String(row.unit),
    comparisonLabel: String(row.comparison_label),
    comparisonPrice: Number(row.comparison_price),
    comparisonQuantity: Number(row.comparison_quantity),
    monthlyUses: Number(row.monthly_uses),
    tradeoffs: String(row.tradeoffs),
    location: location ? mapLocation(location) : undefined,
    free: Boolean(row.is_free),
    discounted: Boolean(row.is_discounted),
    transitAccessible: Boolean(row.transit_accessible),
    onlineAvailable: Boolean(row.online_available),
    isSample: Boolean(row.is_sample),
    tags: (row.tags as string[]) ?? [],
  };
}

export async function getSearchData() {
  const supabase = publicSupabaseClient();
  if (!supabase) {
    const state = await readLocalState();
    const resources = [...seedResources, ...state.approvedResources].map((resource) => ({
      ...resource,
      ...(state.resourceOverrides[resource.id] ?? {}),
    }));
    return { alternatives: seedAlternatives, resources, source: "sample" as const };
  }

  const [resourceResult, alternativeResult] = await Promise.all([
    supabase.from("assistance_resources").select("*, locations(*)").eq("is_published", true),
    supabase.from("alternatives").select("*, locations(*)").eq("is_published", true),
  ]);
  if (resourceResult.error) throw resourceResult.error;
  if (alternativeResult.error) throw alternativeResult.error;

  return {
    resources: (resourceResult.data ?? []).map((row) => mapResource(row)),
    alternatives: (alternativeResult.data ?? []).map((row) => mapAlternative(row)),
    source: "supabase" as const,
  };
}

export async function getResourceById(id: string) {
  const { resources } = await getSearchData();
  return resources.find((resource) => resource.id === id) ?? null;
}

export async function createResourceSubmission(input: ResourceSubmissionInput) {
  const now = new Date().toISOString();
  const submission: ResourceSubmission = {
    ...input,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
  const supabase = publicSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("resource_submissions")
      .insert({
        id: submission.id,
        organization_name: submission.organizationName,
        contact_name: submission.contactName,
        contact_email: submission.contactEmail,
        contact_phone: submission.contactPhone || null,
        category_slug: submission.category,
        description: submission.description,
        address: submission.address,
        city: submission.city,
        state: submission.state,
        zip: submission.zip,
        website: submission.website || null,
        services: submission.services,
        eligibility: submission.eligibility,
        hours: submission.hours,
        languages: submission.languages,
        application_instructions: submission.applicationInstructions,
        attestation: submission.attestation,
        status: submission.status,
      })
      .select("id, created_at")
      .single();
    if (error) throw error;
    return { id: String(data.id), createdAt: String(data.created_at) };
  }

  const state = await readLocalState();
  state.submissions.unshift(submission);
  await writeLocalState(state);
  return { id: submission.id, createdAt: submission.createdAt };
}

function mapSubmission(row: Record<string, unknown>): ResourceSubmission {
  return {
    id: String(row.id),
    organizationName: String(row.organization_name),
    contactName: String(row.contact_name),
    contactEmail: String(row.contact_email),
    contactPhone: row.contact_phone ? String(row.contact_phone) : undefined,
    category: row.category_slug as ResourceSubmission["category"],
    description: String(row.description),
    address: String(row.address),
    city: String(row.city),
    state: String(row.state),
    zip: String(row.zip),
    website: row.website ? String(row.website) : undefined,
    services: String(row.services),
    eligibility: String(row.eligibility),
    hours: String(row.hours),
    languages: String(row.languages),
    applicationInstructions: String(row.application_instructions),
    attestation: Boolean(row.attestation),
    status: row.status as ResourceSubmission["status"],
    reviewerNotes: row.reviewer_notes ? String(row.reviewer_notes) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function listResourceSubmissions() {
  const supabase = adminSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("resource_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapSubmission(row));
  }
  return (await readLocalState()).submissions;
}

function approvedResourceFromSubmission(submission: ResourceSubmission): AssistanceResource {
  const coordinates = getCoordinatesForZip(submission.zip);
  return {
    id: `submitted-${submission.id}`,
    category: submission.category,
    organizationName: submission.organizationName,
    description: submission.description,
    location: {
      id: `submitted-location-${submission.id}`,
      address: submission.address,
      city: submission.city,
      state: submission.state,
      zip: submission.zip,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    },
    phone: submission.contactPhone || "Call organization for details",
    website: submission.website || "",
    hours: submission.hours.split(/\n|;/).map((item) => item.trim()).filter(Boolean),
    services: submission.services.split(/\n|,/).map((item) => item.trim()).filter(Boolean),
    eligibility: submission.eligibility,
    requiredDocuments: ["Call to confirm which documents are required"],
    languages: submission.languages.split(/\n|,/).map((item) => item.trim()).filter(Boolean),
    applicationInstructions: submission.applicationInstructions,
    lastVerified: new Date().toISOString().slice(0, 10),
    verificationStatus: "unverified",
    isSample: false,
    free: false,
    discounted: false,
    transitAccessible: false,
    onlineAvailable: Boolean(submission.website),
    tags: submission.services.toLowerCase().split(/\W+/).filter((word) => word.length > 3).slice(0, 12),
  };
}

export async function updateResourceSubmission(
  id: string,
  update: Pick<ResourceSubmission, "status"> & {
    reviewerNotes?: string;
    edits?: Partial<Pick<ResourceSubmission, "organizationName" | "description" | "eligibility" | "hours">>;
  },
) {
  const supabase = adminSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("resource_submissions")
      .update({
        status: update.status,
        reviewer_notes: update.reviewerNotes || null,
        ...(update.edits?.organizationName ? { organization_name: update.edits.organizationName } : {}),
        ...(update.edits?.description ? { description: update.edits.description } : {}),
        ...(update.edits?.eligibility ? { eligibility: update.edits.eligibility } : {}),
        ...(update.edits?.hours ? { hours: update.edits.hours } : {}),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    const updated = mapSubmission(data);
    if (updated.status === "approved") {
      const resource = approvedResourceFromSubmission(updated);
      const { error: locationError } = await supabase.from("locations").upsert({
        id: resource.location.id,
        address: resource.location.address,
        city: resource.location.city,
        state: resource.location.state,
        zip: resource.location.zip,
        latitude: resource.location.latitude,
        longitude: resource.location.longitude,
      });
      if (locationError) throw locationError;
      const { error: resourceError } = await supabase.from("assistance_resources").upsert({
        id: resource.id,
        category_slug: resource.category,
        location_id: resource.location.id,
        organization_name: resource.organizationName,
        description: resource.description,
        phone: resource.phone,
        website: resource.website,
        hours: resource.hours,
        services: resource.services,
        eligibility: resource.eligibility,
        required_documents: resource.requiredDocuments,
        languages: resource.languages,
        application_instructions: resource.applicationInstructions,
        last_verified: resource.lastVerified,
        verification_status: "unverified",
        is_sample: false,
        is_free: false,
        is_discounted: false,
        transit_accessible: false,
        online_available: resource.onlineAvailable,
        is_published: true,
        tags: resource.tags,
      });
      if (resourceError) throw resourceError;
    }
    return updated;
  }

  const state = await readLocalState();
  const index = state.submissions.findIndex((submission) => submission.id === id);
  if (index < 0) throw new Error("Submission not found.");
  const updated: ResourceSubmission = {
    ...state.submissions[index],
    ...update.edits,
    status: update.status,
    reviewerNotes: update.reviewerNotes,
    updatedAt: new Date().toISOString(),
  };
  state.submissions[index] = updated;
  if (update.status === "approved") {
    const resource = approvedResourceFromSubmission(updated);
    const existing = state.approvedResources.findIndex((item) => item.id === resource.id);
    if (existing >= 0) state.approvedResources[existing] = resource;
    else state.approvedResources.unshift(resource);
  }
  await writeLocalState(state);
  return updated;
}

export async function verifyResource(id: string, method: string, notes: string) {
  const verifiedAt = new Date().toISOString();
  const supabase = adminSupabaseClient();
  if (supabase) {
    const [{ error: resourceError }, { error: verificationError }] = await Promise.all([
      supabase.from("assistance_resources").update({ verification_status: "verified", last_verified: verifiedAt.slice(0, 10) }).eq("id", id),
      supabase.from("verification_records").insert({ resource_id: id, verified_at: verifiedAt, method, notes, verified_by: "CostBridge admin" }),
    ]);
    if (resourceError) throw resourceError;
    if (verificationError) throw verificationError;
    return { id, verifiedAt };
  }

  const state = await readLocalState();
  const exists = [...seedResources, ...state.approvedResources].some((resource) => resource.id === id);
  if (!exists) throw new Error("Resource not found.");
  state.resourceOverrides[id] = {
    verificationStatus: "verified",
    lastVerified: verifiedAt.slice(0, 10),
  };
  state.verificationRecords.unshift({
    id: crypto.randomUUID(),
    resourceId: id,
    verifiedAt,
    method,
    notes,
    verifiedBy: "CostBridge admin",
  });
  await writeLocalState(state);
  return { id, verifiedAt };
}

export async function listSavedItems(clientId: string) {
  const supabase = adminSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("saved_items")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row): SavedItem => ({
      id: String(row.id),
      clientId: String(row.client_id),
      itemType: row.item_type as SavedItem["itemType"],
      itemId: String(row.item_id),
      createdAt: String(row.created_at),
    }));
  }
  return (await readLocalState()).savedItems.filter((item) => item.clientId === clientId);
}

export async function saveItem(input: Omit<SavedItem, "id" | "createdAt">) {
  const supabase = adminSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("saved_items")
      .upsert(
        { client_id: input.clientId, item_type: input.itemType, item_id: input.itemId },
        { onConflict: "client_id,item_type,item_id" },
      )
      .select("*")
      .single();
    if (error) throw error;
    return {
      id: String(data.id),
      clientId: String(data.client_id),
      itemType: data.item_type as SavedItem["itemType"],
      itemId: String(data.item_id),
      createdAt: String(data.created_at),
    } satisfies SavedItem;
  }

  const state = await readLocalState();
  const existing = state.savedItems.find(
    (item) => item.clientId === input.clientId && item.itemType === input.itemType && item.itemId === input.itemId,
  );
  if (existing) return existing;
  const saved: SavedItem = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  state.savedItems.unshift(saved);
  await writeLocalState(state);
  return saved;
}

export async function removeSavedItem(clientId: string, itemType: SavedItem["itemType"], itemId: string) {
  const supabase = adminSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("saved_items").delete().eq("client_id", clientId).eq("item_type", itemType).eq("item_id", itemId);
    if (error) throw error;
    return;
  }

  const state = await readLocalState();
  state.savedItems = state.savedItems.filter(
    (item) => !(item.clientId === clientId && item.itemType === itemType && item.itemId === itemId),
  );
  await writeLocalState(state);
}
