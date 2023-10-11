import { DvPage } from "./Dataview";

export type Gender = "male" | "female" | "unspecified";

export const RELN_SINGULAR = [
  "father",
  "mother",
  "son",
  "daughter",
  "child",

] as const;
export const RELN_PLURAL = [
  "grand_parents",
  "parents",
  "children",
  "sons",
  "daughters",
  "step_children",
  "friends",
  "family",
  
] as const;

export interface Relationship {
  grand_parents?: DvPage[];
  parents?: DvPage[];
  father?: DvPage[];
  mother?: DvPage[];

  partner?: DvPage;
  wife?: DvPage;
  husband?: DvPage;

  children?: DvPage[];
  son?: DvPage;
  sons?: DvPage[];
  daughter?: DvPage;
  daughters?: DvPage[];

}

export interface Person {
  title?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  gender?: Gender;

  picture?: DvPage;

  /** the primary area in which a person is associated */
  primary_geo?: DvPage;
  /** a secondary area in which a person is associated */
  secondary_geo?: DvPage;
  /** areas previously associated with this person */
  prior_geos: DvPage[];

  home?: string;
  home_alt?: string;
  work?: string;
  work_alt?: string;


}
