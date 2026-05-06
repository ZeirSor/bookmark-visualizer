import { createEmptyImportPlan, type ImportPlan } from "./schema";

export function createNetscapeHtmlImportPlan(): ImportPlan {
  const plan = createEmptyImportPlan("html");
  plan.warnings.push("Netscape bookmark HTML import is not implemented yet.");
  return plan;
}
