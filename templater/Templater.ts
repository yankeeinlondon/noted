// https://github.dev/SilentVoid13/Templater
import { TemplateFile, TFolder } from "./obsidian-types";
import { CALLOUT_TYPES } from "./constants";
import  { Vault, App, FileManager } from  "obsidian";

export type CalloutType = keyof typeof CALLOUT_TYPES;

export abstract class ObsidianApi {
  __kind: "ObsidianApi";
  public vault: App["vault"];
  public fileManager: App["fileManager"];

};

export interface Obsidian {
  dom: {
      appContainerEl: HTMLElement;
  };

  Vault: Vault;
  FileManager: FileManager
  DataAdapter: {
      basePath: string;
      fs: {
          uri: string;
      };
  }
}



export type Frontmatter<T extends Record<string, unknown> = {}> = Record<string, unknown> & T;

export interface FrontmatterDefaults extends Record<string, unknown | undefined> {
  kind?: string;
  type?: string;
  category?: any;
  sub_category?: any;
  parent?: any;
  siblings?: any[];
  date?: any;
}

/**
 * YYYY-MM-DD HH:mm
 */
export type DefaultDateFormat = `${number}-${number}-${number} ${number}:${number}`

export interface TemplaterFile {
  content: string;
  /**
   * Creates a new file in the current vault
   */
  create_new: (file: TemplateFile | string, filename?: string, open_new?: boolean, folder?: TFolder)=> Promise<unknown>;

  /**
   * Returns the file's creation date
   */
  creation_date:<F extends string>(format?: string)=> Promise<undefined extends F ? DefaultDateFormat : string>;

  /**
   * Places the cursor to this spot after templated is inserted
   */
  cursor:(order?: number)=> Promise<void>;

  /**
   * Appends text after the cursor in the active file
   */
  cursor_append: (content: string)=> Promise<void>;

  /**
   * Tests the existence of a filename. 
   * 
   * Note: must be a fully qualified file path from the root of the vault but does
   * not includes the trailing `.md` file extension.
   */
  exists: (file: string)=> boolean;

  /**
   * Search for a file and return the file's `TFile` if found.
   */
  find_tfile: (file: string)=> Promise<TemplateFile | null>;

  /**
   * returns the folder _name_ (absolute path by default)
   */
  folder: (relative?: boolean) => Promise<string>;

  /**
   * Include the file's link content; templates in the included content will be resolved.
   */
  include: (file: string | TemplateFile) => Promise<string>;

  last_modified_date: <F extends string>(format?: F) => Promise<undefined extends F ? DefaultDateFormat : string>;

  functions: {
    move: (new_path: string, file?: TemplateFile)=> Promise<void>;
  }

  /**
   * returns the file's active selection
   */
  selection: ()=> Promise<string>;

  path: ()=> Promise<any>;
  /**
   * renames the file
   */
  rename: (new_title: string)=> Promise<void>;
  /**
   * retrieves the file's tags
   */
  tags: string[];

  /** retrieves the file's title */
  title: () =>  Promise<string>;
}

export interface TemplaterDate {
  /**
   * retrieves the date for **today**; by default uses YYYY-MM-DD format.
   */
  now: <T extends Record<string, unknown | undefined>>(
    format?: T, offset?: number | string, reference?: string, ref_format?: string
  )=> Promise<string>;
  /**
   * retrieves the date for **tomorrow**; by default uses YYYY-MM-DD format.
   */
  tomorrow: <T extends Record<string, unknown | undefined>>(format?: T)=> Promise<string>;
  /**
   * retrieves the date for **yesterday**; by default uses YYYY-MM-DD format.
   */
  yesterday: <T extends Record<string, unknown | undefined>>(format?: T) =>Promise<string>;

  weekday: <T extends Record<string, unknown | undefined>>(
    format?: T,
    weekday?: number,
    reference?: string,
    reference_format?: string
  )=> Promise<string>;
}

export type RunMode = 
| "Create from new template"
| "Append to active file";

export interface TemplaterConfig {
  /** the Obsidian `TFile` representing the _template_ file */
  template_file: TemplateFile;
  /** the Obsidian `TFile` representing the _target_ file where the template will be inserted */
  target_file: TemplateFile;
  /**
   * the `RunMode`, representing how **Templater** was launched.
   * 
   * - Create from new template
   * - Append to active file
   * - ...
   */
  run_mode: RunMode;
  /** The active file -- if existing -- when launching **Templater**  */
  active_file?: TemplateFile;
}

export interface TemplaterSystem {
  /** returns the clipboard's content */
  clipboard:() => Promise<string>;

  /**
   * Prompts user for a text input
   */
  prompt: (prompt_text: string, default_value?: string, throw_on_cancel?: boolean, multiline?: boolean) => any;

  /** 
   * Prompts user with a list of options.
   */
  suggester: <T extends string | (<R>(result: R) => string)>(
    options: readonly string[], 
    results: readonly T[], 
    throw_or_cancel?: boolean, 
    placeholder?: string, 
    limit?: number 
  ) => Promise<T>;

}

export interface TemplaterWeb {
  /**
   * returns a random daily quote (from [Daily Quote API](https://api.quotable.io) )
   */
  daily_quote(): Promise<string>;
  /**
   * Get's a random picture from [**Unsplash**](https://unsplash.com)
   */
  random_picture(size?: string, query?: string, include_size?: boolean): Promise<string>;
}

export interface Templater<T extends Record<string, unknown | undefined> = FrontmatterDefaults> {
  /**
   * The configuration environment for the executing template
   */
  config: TemplaterConfig;

  file: TemplaterFile;
  obsidian: Obsidian
  frontmatter: Frontmatter<T>;
  date: TemplaterDate;
  /**
   * **system**
   * 
   * `clipboard`, `prompt` and `suggester` utilities to gain
   * context from the user/system.
   */
  system: TemplaterSystem;
  /**
   * Get content off of API's on the Internet (quotes, images)
   */
  web: TemplaterWeb;
}

