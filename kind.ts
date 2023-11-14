import { TFolder } from "obsidian";
import { Templater } from "./templater/index";
import { GlobalContext, PageMetaData, get_context, isLink, PageLink } from "./templater/global-context";

export type KindCommand = "create" | "update";

export type PageContext = {
  tp: Templater;
  active_page: PageMetaData;
  target_page: PageMetaData;
} & GlobalContext;

function all_kinds(ctx: PageContext) {
  return Array.from(ctx.etags.getInverse('#kind')).filter(i => i.startsWith("kind/"));
}

const pages = (ctx: PageContext) => (path: string) => ctx.pages.get(path);

/**
 * converts `PageMetaData` to a `PageLink`
 */
const link = (page: PageMetaData): PageLink => ({
  embed: false,
  path: page.path,
  type: "file",
});

async function create_page(ctx: PageContext): Promise<string> {
  const {tp, etags} = ctx;

  const kind_pages = all_kinds(ctx).map(pages(ctx));
  const kind_names = kind_pages.map(i => i.path.split("/").slice(-1)[0].replace(".md",""));
  const summary_pages = Array.from(etags.getInverse('#summary'));
  const summary_kind = kind_pages.find(i => summary_pages.includes(i.path));  

  const template_dir = "templates/t/pages";
  const current_dir = tp.file.folder();
  const lookup = {
    "Software Product": ["Software Page",[ "software", current_dir], false ],
    "Hardware Product": ["Hardware Page", ["hardware", current_dir], false ],
    "Company": ["Company Page", ["company", current_dir], false ],
    "Person": ["Person Page", ["peeps", current_dir], false ],
    "Purchase": ["Purchase Page", [current_dir, "purchase"], false ],
    "Kind": ["Purchase Page", ["kind", "kind/category", current_dir], false ],
    "Other": ["Generic Page", [current_dir], false ],
  }

  const name: string = await tp.system.prompt("Page Name");
  
  const kind_choice = await tp.system.suggester(kind_names, kind_names);
  const kind = kind_pages.find(p => p.path.includes(kind_choice));
  const use_date_prefix = kind.frontmatter.use_date_prefix || false;

  if (use_date_prefix) {
    const format = (d: Date) => `${d.getFullYear()}-${d.getMonth()+1> 9 ? "" : "0"}${d.getMonth()+1}-${d.getDate()+1 > 9 ? "" : "0"}${d.getDate()+1}`;

    tp.file.rename(`${format(new Date)} ${name}`)
  } else {
    tp.file.rename(name);
  }

  if (tp.file.content.trim() === "") {
    tp.file.cursor_append(`
---
kind: [[${kind.path.split("/").slice(-1)[0].replace(".md","")}]]
---

${[...kind.tags].filter(t => t !== "#kind").join(" ")}

# ${name}


`);
  }

  console.log({kind_choice, kind});
  



  // const [ template, folders, dateFile] = lookup[kind];
  // const folder: string = await tp.system.suggester(folders, folders);

  // const filename = `${template_dir}/${template}.md`

  // return [name, filename, folder];
  return "";
}

/**
 * Synchronize the page's tags and properties
 */
function sync(ctx: PageContext): { tags: Record<string, unknown>; props: Record<string, unknown> } {



  return {tags: {}, props: {}}
}

function get_kind(ctx: PageContext) {
  const tags = ctx.target_page.tags;
  const props = ctx.target_page.fields;
  const kind = props.get("kind");

  return isLink(kind)
    ? ctx.pages.get(kind.path)
    : all_kinds(ctx).map(pages(ctx)).find(p => [...p.tags].filter(i => i !== "#kind").some(s => [...tags].includes(s)));
}

async function add_tag(ctx: PageContext, tag: string) {
  console.log("add tag", tag);
}

function set_prop(ctx: PageContext, prop: string, val: unknown) {
  console.log(`set prop ${prop}: `, val);
}

async function update_page(ctx: PageContext): Promise<string> {
  const kind = get_kind(ctx);
  const kind_tags = [...kind.tags].filter(t => t !== "#kind");
  const page = ctx.target_page;
  let fm = page.frontmatter;
  let content = ctx.tp.file.content;

  console.log({fm,content});
  

  if (![...page.tags].some(t => kind_tags.includes(t))) {
      await add_tag(ctx, kind_tags[0]);
  }
  
  if (!isLink(page.fields.get("kind"))) {
    set_prop(ctx, "kind", link(kind))
  }
  
  return "";
}

/**
 * **kind**
 * 
 * Provides commands that relate to the data models provided by the `kind` property in
 * Frontmatter. Commands:
 * 
 * - **choose_template**
 *    - provides a list of templates to choose from
 *    - uses the current page's tags and folder to choose a good default value
 *    - initializes the template for the given type
 *        - uses either a "create" or an "update" template
 *        - to start we'll just focus on "create" coverage
 * - **data_model**
 *    - gets the data model for a given `kind`
 */
export async function kind(tp: Templater, cmd: KindCommand, ...params: unknown[]): Promise<any> {  

  const context = get_context();
  const active_page = tp.config.active_file 
    ? context.pages.get(tp.config.active_file.path) 
    : null;
  const target_page = tp.config.target_file 
    ? context.pages.get(tp.config.target_file.path)
    : null;
  const has_tags = active_page?.tags?.size > 0
    ? true
    : false;
  
  switch (cmd) {
    case "create":
      return has_tags
        ? update_page({...context, active_page, target_page, tp})
        : create_page({...context, active_page, target_page, tp});
      

    case "update":
      return update_page({...context, active_page, target_page, tp});
  }
}
