import { DateTime } from "obsidian-dataview";
import { ObsidianPlugin } from "./obsidian-types";
import { Semver } from "./other-types";

export type IndexMap<TVal, TInv> = Map<string, TVal> & {
  getInverse: (find: string) => TInv;
}

export type FieldType = null | string | number | DateTime | PageLink;

export interface PageLink {
  display?: string;
  embed: boolean;
  path: string;
  /** 
   * the section on the page
   */
  subpath?: string;
  type: "file" | string;
}

export function isLink(item: unknown): item is PageLink {
  return typeof item === "object" && typeof item["embed"] === "boolean" && typeof item["path"] === "string";
}

export interface Position {
  line: number;
  col: number;
  offset: number;
}

export interface ListItem {
  blockId?: unknown;
  children: unknown[];
  fields: Map<string, FieldType | FieldType[]>;
  line: number;
  lineCount: number;
  link?: PageLink | null;
  links: PageLink[];
  list: number;
  position: {
    start: Position;
    end: Position;
  }
  /**
   * typically the `path` is pointed to the source page and
   * then the `subpath` points to the **H(_x_)** section.
   */
  section: PageLink;
  symbol: "-" | "+" | "*";

  /**
   * **tags**
   * 
   * - Use `tags.get('kind/Concept.md')` to lookup the tags on a given page
   * - Use `tags.getInverse('#kind')` to lookup the markdown files which have a particular tag
   */
  tags: IndexMap<Set<string>, Set<string>>;
  /**
   * The _pre-rendered_ source text of the list item
   */
  text: string;
}

/**
 * **PageMetaData**
 * 
 * A lookup of a page's metadata
 */
export interface PageMetaData {

    aliases: Set<string>;
    ctime: DateTime;
    day?: unknown;
    /**
     * A `Map` of frontmatter properties where properties which point to
     * another page are represented as `Link`'s
     */
    fields: Map<string, FieldType | FieldType[]>;
    /**
     * **frontmatter**
     * 
     * A dictionary object of the frontmatter properties. Same basic content as is found in the `fields`
     * except that:
     * 
     * - it uses an object rather than a Map to contain the properties
     * - the page links in `fields` are `PageLink` objects whereas in the `frontmatter` prop they are just
     * string with square brackets around them.
     */
    frontmatter: Record<string, any>;
    /**
     * A list of all the page links on the given page
     */
    links: Array<PageLink>;

    /**
     * An array of all bulleted lists items on the page
     */
    lists: Array<ListItem>;
    mtime: DateTime;
    path: string;
    size: number;
    tags: Set<string>;
    etags: Set<string>;
}

export interface FileProps {
  children: FileProps[];
  deleted: boolean;
  name: string;
  parent: FileProps;
  path: string;
  /** only shows for files not folders */
  basename?: string;
  /** only shows for files not folders */
  extension?: string;
  /** only shows for files not folders */
  saving?: boolean;
  /** only shows for files not folders */
  state?: {
    ctime: number;
    mtime: number;
    size: number;
  }
}

export type FileRepresentation = {
  type: "file";
  realpath: string;
  ctime: number;
  mtime: number;
  size: number;
}
export type FolderRepresentation = {
  type: "folder";
  realpath: string;
}
export type FileOrFolder = FileRepresentation | FolderRepresentation;

export interface VaultInfo {
  adapter: {
    basePath: string;
    /**
     * **files**
     * 
     * All the files and folders in the vault. Keys are the full path and then meta is
     * the value.
     */
    files: Record<string, FileOrFolder>;
  }
  cacheLimit: number;
  config: {

  };
  /** typically `.obsidian` */
  configDir: string;
  fileMap: Record<string, FileProps>;
}


export type Dataview = ObsidianPlugin<
  {
    index: {
      /**
       * **pages**
       * 
       * Pass in a page path (including filename) and get back all the metadata associated
       * with that page.
       */
      pages: Map<string,PageMetaData>;
      
      /**
       * **tags**
       * 
       * - Use `tags.get('kind/Concept.md')` to lookup the tags on a given page
       * - Use `tags.getInverse('#kind')` to lookup the markdown files which have a particular tag
       */
      tags: Set<string>;
      links: IndexMap<Set<string>,Set<string>>;
      /**
       * **etags**
       * 
       * - Use `etags.get('kind/Concept.md')` to lookup the tags on a given page
       * - Use `etags.getInverse('#kind')` to lookup the markdown files which have a particular tag
       */
      etags: IndexMap<Set<string>, Set<string>>;
      revision: number;
      vault: VaultInfo;
      initialized: boolean;
      indexVersion: Semver;

    }
  },
  {
    allowHtml: boolean;
    /** by default will be `dataviewjs` */
    dataviewJsKeyword: string;
    /** by default will be "MMMM, dd, yyy" */
    defaultDateFormat: string;
    /** by default "h:mm a - MMMM dd, yyyy" */
    defaultDateTimeFormat: string;
    enableDataviewJs: boolean;
    enableInlineDataviewJs: boolean;
    /** by default will be "$=" */
    inlineJsQueryPrefix: string;
    inlineQueryPrefix: string;
    inlineQueriesInCodeblocks: boolean;
    renderNullAs: string;
    taskCompletionTracking: boolean;
    taskCompletionUseEmojiShorthand: boolean;
    taskCompletionText: string;
    taskCompletionDateFormat: string;
    recursiveSubTaskCompletion:boolean;
    warnOnEmptyResult:boolean;
    refreshEnabled:boolean;
    refreshInterval: number;
    maxRecursiveRenderDepth: number;
    tableIdColumnName: string;
    tableGroupColumnName: string;
    showResultCount:boolean;
    enableInlineDataview:boolean;
    prettyRenderInlineFields:boolean;
  }
>;



export interface GlobalContext {
  plugins: {
    dataview?: ObsidianPlugin<Dataview>;
    excalibrain?: ObsidianPlugin;
    "templater-obsidian": ObsidianPlugin;
    [key: string]: ObsidianPlugin;
  }
  /**
   * **pages**
   * 
   * Pass in a page path (including filename) and get back all the metadata associated
   * with that page.
   */
  pages: ObsidianPlugin<Dataview>["index"]["pages"];
  /**
   * **tags**
   * 
   * - Use `tags.get('kind/Concept.md')` to lookup the tags on a given page
   * - Use `tags.getInverse('#kind')` to lookup the markdown files which have a particular tag
   */ 
  tags: ObsidianPlugin<Dataview>["index"]["tags"];
  /**
   * **etags**
   * 
   * - Use `etags.get('kind/Concept.md')` to lookup the tags on a given page
   * - Use `etags.getInverse('#kind')` to lookup the markdown files which have a particular tag
   */ 
  etags: ObsidianPlugin<Dataview>["index"]["etags"];
  vault: ObsidianPlugin<Dataview>["index"]["vault"];
}

interface App {
  plugins: {
    plugins: Record<string, ObsidianPlugin>
  },
}

/**
 * **get_context()**
 * 
 * Provides a dictionary of useful lookups including the full list of plugins being used, 
 * and a lot of indexing lookups provided by the `dataview` plugin.
 */
export const get_context = (): GlobalContext => ({
  /**
   * A dictionary hash of all the plugins installed
   */
  plugins: (globalThis.app as unknown as App)?.plugins?.plugins as GlobalContext["plugins"],
  pages:((globalThis.app as unknown as App).plugins.plugins["dataview"] as ObsidianPlugin<Dataview>).index.pages,
  tags: ((globalThis.app as unknown as App).plugins.plugins["dataview"] as ObsidianPlugin<Dataview>).index.tags,

  etags: ((globalThis.app as unknown as App).plugins.plugins["dataview"] as ObsidianPlugin<Dataview>).index.etags,
  vault: ((globalThis.app as unknown as App).plugins.plugins["dataview"] as ObsidianPlugin<Dataview>).index.vault,
});
