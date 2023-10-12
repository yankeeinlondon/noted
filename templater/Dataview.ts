import { TemplateFile } from "./obsidian-types";
import { Frontmatter } from "./Templater";

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
