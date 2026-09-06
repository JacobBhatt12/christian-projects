export const categorySlugs = [
  "groceries",
  "housing",
  "utilities",
  "transportation",
  "healthcare",
  "childcare",
  "clothing",
  "internet-phone",
] as const;

export type CategorySlug = (typeof categorySlugs)[number];

export type Category = {
  id: string;
  slug: CategorySlug;
  name: string;
  description: string;
};

export type Location = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
};

export type VerificationStatus = "sample" | "unverified" | "verified";

export type AssistanceResource = {
  id: string;
  category: CategorySlug;
  organizationName: string;
  description: string;
  location: Location;
  phone: string;
  website: string;
  hours: string[];
  services: string[];
  eligibility: string;
  requiredDocuments: string[];
  languages: string[];
  applicationInstructions: string;
  lastVerified: string;
  verificationStatus: VerificationStatus;
  isSample: boolean;
  free: boolean;
  discounted: boolean;
  transitAccessible: boolean;
  onlineAvailable: boolean;
  tags: string[];
};

export type Alternative = {
  id: string;
  category: CategorySlug;
  title: string;
  provider: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  comparisonLabel: string;
  comparisonPrice: number;
  comparisonQuantity: number;
  monthlyUses: number;
  tradeoffs: string;
  location?: Location;
  free: boolean;
  discounted: boolean;
  transitAccessible: boolean;
  onlineAvailable: boolean;
  isSample: boolean;
  tags: string[];
};

export type SortOption = "price" | "distance" | "savings";

export type SearchFilters = {
  free?: boolean;
  discounted?: boolean;
  transitAccessible?: boolean;
  onlineAvailable?: boolean;
};

export type SearchInput = {
  zip: string;
  category: CategorySlug;
  need?: string;
  distance?: number;
  sort?: SortOption;
  filters?: SearchFilters;
};

export type AlternativeResult = Alternative & {
  distance: number | null;
  unitPrice: number;
  comparisonUnitPrice: number;
  estimatedMonthlySavings: number;
};

export type ResourceResult = AssistanceResource & {
  distance: number;
};

export type SearchResults = {
  alternatives: AlternativeResult[];
  resources: ResourceResult[];
};

export type ResourceSubmission = {
  id: string;
  organizationName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  category: CategorySlug;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  website?: string;
  services: string;
  eligibility: string;
  hours: string;
  languages: string;
  applicationInstructions: string;
  attestation: boolean;
  status: "pending" | "approved" | "changes_requested" | "rejected";
  reviewerNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type VerificationRecord = {
  id: string;
  resourceId: string;
  verifiedAt: string;
  method: string;
  notes?: string;
  verifiedBy: string;
};

export type SavedItem = {
  id: string;
  clientId: string;
  itemType: "resource" | "alternative";
  itemId: string;
  createdAt: string;
};
