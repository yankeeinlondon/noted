import { Frontmatter } from "./Templater";

export type CompanySize = "small" | "medium" | "large" | "huge";

export type Url = `https://${string}`

export interface Company extends Frontmatter {
  kind: "Company";
  categories: string[];
  size?: CompanySize | undefined;
  offices?: string[];
  website?: Url;
  wikipedia?: Url;
  svg_icon?: string;
}


export interface Product<K extends "Software Product" | "Hardware Product" | "Product" = "Software Product" | "Hardware Product" | "Product"> extends Frontmatter {
  kind: K;
  category?: string;
  sub_category?: string;
  similar?: string[];
  competitors?: string[];
  website?: Url;
  wikipedia?: Url;
  repo?: Url;
  docs?: Url;
  reviews?: Url[];
  svg_icon?: string;
}
