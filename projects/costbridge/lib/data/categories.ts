import type { Category } from "@/lib/types";

export const categories: Category[] = [
  {
    id: "cat-groceries",
    slug: "groceries",
    name: "Groceries",
    description: "Food, pantry staples, produce, and prepared meals",
  },
  {
    id: "cat-housing",
    slug: "housing",
    name: "Housing",
    description: "Rent, deposits, repairs, and short-term housing help",
  },
  {
    id: "cat-utilities",
    slug: "utilities",
    name: "Utilities",
    description: "Electric, water, gas, and home energy costs",
  },
  {
    id: "cat-transportation",
    slug: "transportation",
    name: "Transportation",
    description: "Bus fares, rides, fuel, bicycles, and car costs",
  },
  {
    id: "cat-healthcare",
    slug: "healthcare",
    name: "Healthcare",
    description: "Clinics, prescriptions, dental care, and screenings",
  },
  {
    id: "cat-childcare",
    slug: "childcare",
    name: "Childcare",
    description: "Daycare, after-school care, and early learning",
  },
  {
    id: "cat-clothing",
    slug: "clothing",
    name: "Clothing",
    description: "Everyday clothing, workwear, uniforms, and shoes",
  },
  {
    id: "cat-internet-phone",
    slug: "internet-phone",
    name: "Internet and phone",
    description: "Home internet, mobile service, and connected devices",
  },
];

export const categoryMap = new Map(
  categories.map((category) => [category.slug, category]),
);
