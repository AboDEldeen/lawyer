import type { CaseStatus } from "@/types/database";

export function getStatusVariant(
  status: CaseStatus
): "open" | "closed" | "pending" | "archived" {
  return status as "open" | "closed" | "pending" | "archived";
}

export const CASE_TYPES = [
  "civil",
  "criminal",
  "family",
  "commercial",
  "labor",
  "administrative",
  "real_estate",
  "other",
] as const;

export const CASE_STATUSES: CaseStatus[] = [
  "open",
  "pending",
  "closed",
  "archived",
];
