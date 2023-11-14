import { Url } from "./kinds";
import { Callback, TemplateFile } from "./obsidian-types";
import { Semver } from "./other-types";
import { Frontmatter } from "./Templater";
import type { DataviewApi as DV  } from 'obsidian-dataview/lib/api/plugin-api';

export type DvFns = "all" | "any" | "array" | "average" | "ceil" | "choice" | "contains" | "containsword" | "currencyformat" | "date" | "dateformat" | "dur" | "durationformat" | "econtains" | "elink" | "embed" | "endswith" | "extract" | "filter" | "flat" | "floor" | "icontains" | "join" | "ldefault" | "length" | "link" | "list" | "localtime" | "lower" | "map" | "max" | "maxby" | "meta" | "min" |"minby" | "none" | "nonnull" | "number" | "object" | "padleft" | "padright" | "product" | "reduce" | "regexmatch" | "regexreplace" | "regextest" | "replace" | "reverse" | "round" | "sort" | "split" | "startsWith" | "string" | "striptime" | "substring" | "sum" | "trunc" | "truncate" | "typeof" | "unique" | "upper"; 

export interface DataviewApi extends DV {
  func: Record<DvFns, Callback>
}


export interface DataviewSettings {
  allowHtml: boolean;
  dataviewJsKeyword: string;
  defaultDateFormat: string;
  enableDataviewJs: boolean;
  enableInlineDataview: boolean;
  enableInlineDataviewJS: boolean;
  inlineJsQueryPrefix: string;
  inlineQueriesInCodeblocks: boolean;
  inlineQueryPrefix: string;
  maxRecursiveRenderDepth: number;
  prettyRenderInlineFields: boolean;
  recursiveSubTaskCompletion: boolean;
  refreshEnabled: boolean;
  refreshInterval: number;
  renderNullAs: string;
  showResultCount: true;
  tableGroupColumnName: string;
  tableIdColumnName: string;
  taskCompletionText: string;
  taskCompletionTracking: boolean;
  taskCompletionUseEmojiSHorthand: boolean;
  warnOnEmptyResult: boolean;
};

export interface XX {
  evaluationContext: {
    binaryOps: {
      map: Map<string,Callback>;
    };
    functions: {
      all: Callback;
      any: Callback;
      array: Callback;
      average: Callback;
      ceil: Callback;
      choice: Callback;
      contains: Callback;
      containsword: Callback;
      currencyformat: Callback;
      date: Callback;
      dateformat: Callback;
      default: Callback;
      dur: Callback;
      durationFormat: Callback;

    };
    globals: any;
    linkHandler: any;
    settings: DataviewSettings;
  };
  func: unknown;
  index: unknown;
  io: {};
  luxon: unknown;
  settings: DataviewSettings;
  value: unknown;
  verNum: Semver;
  version: {
    compare: Callback;
    current: Semver;
    satisfies: Callback;
  };
  widget: {
    externalLink: (url: Url, display: string) => unknown;
    isExternalLink: (thing: unknown) => boolean;
    isListPair: (thing: unknown) => boolean;
    listPair: <K extends string, V extends unknown>(key: K, value: V) => unknown;
  }
}

/**
 * **DvPage**
 * 
 * A page in [`Dataview`]()
 */
export interface DvPage {
  file: {
    name: string;
    link: any;
    frontmatter: Frontmatter;
    tags: string[];
    etags: string[];
  };
  
}

export interface CodeBlockApi {
  // output

  // query

  /**
   * Query for a list of pages
   */
  pages(query: string): TemplateFile[];

  /**
   * Query for a singular page
   */
  page(query: string  | TemplateFile): TemplateFile | undefined;

  pagePaths(query: string | TemplateFile | TemplateFile[]): string[];

  // render

  el(element: string, text: string): void;

  header(level: 1 | 2 | 3 | 4 | 5 | 6, text: string): void;

  paragraph(text: string): void;

  span(text: string): void;

  execute(query: string); void;

  executeJs(inlineCode: string): void;

  view(path: string, params: Record<string, unknown>): Promise<void>;


  /**
   * Output a table to page
   */
  table(cols: string[], data: any[]): void;
  /**
   * Output a list to page
   */
  list(data: any[]): void;

}
