import { TupleToUnion } from "./TupleToUnion";
import { codeblock, dataviewjs } from "./utils";

export const CALLOUT_TYPES = [
  "info", 
  "tip", 
  "example", 
  "quote", 
  "warning", 
  "success", 
  "failure", 
  "abstract", 
  "question"
] as const;

export const VALID_CATEGORY_TAGS = [
  "#software", "#hardware", "#business", "#service", "#retail", "#brand", "#framework", "#standard"
] as const;

/**
 * A union type which includes all tags that can be
 * categorized or sub-categorized.
 */
export type ValidCategoryTag = TupleToUnion<typeof VALID_CATEGORY_TAGS>;


export const CODE = {
  company_products: dataviewjs("company_products.js")
}
