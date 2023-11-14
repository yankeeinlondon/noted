import { 
  Frontmatter, 
  Templater, 
  VALID_CATEGORY_TAGS, 
  ValidCategoryTag, 
  capitalize,  
  createYamlList, 
  ensureDoubleBracketed 
} from "./templater/index";

export interface PageConfig {
  selection: string;
  page: string;
  category: string;
  sub_category: string;
  frontmatter?: Frontmatter;
  category_of: ValidCategoryTag;
  tags: string[];
  parent?: string;
}

function kind(c: PageConfig) {
  return c.category_of === "#business"
    ? "Company"
    : c.category_of 
      ? `${capitalize(c.category_of.replace("#",""))} Product`
      :  ""
}

function category(c: PageConfig, parent?: string | false): [string,string] {
  return c.category_of === "#business"
    ? parent
      ? ["categories", createYamlList( [ensureDoubleBracketed(c.category), ensureDoubleBracketed(parent)]) ]
      : ["categories", createYamlList( [ensureDoubleBracketed(c.category)]) ] 
    : [ "category", `"[ [[${c.category}]] ]"` ]
}

function tags(c: PageConfig) {
  return c.category_of === "#business"
    ? ["#company"]
    : [ c.category_of, "#definition"]
}

/**
 * Builds the frontmatter content for a new or updated page
 */
function meta(c: PageConfig): string {
  const is_subcat = c.tags?.includes("#sub-category") || false;
  

  let fm: [string,string][] = [
    ["kind", kind(c)],
    category(c, c.parent),
    is_subcat && c?.sub_category
      ? ["sub_category", `"[[${c.sub_category}]]"` ]
      : ["sub_category",c.frontmatter?.sub_category as string || ""],
    ["company", ""],
    ...(
      c.category_of === "#software"
        ? [
          ["repo", ""],
          ["docs", ""],
        ]
        : [
          ["website", ""]
        ]
    ) as [string,string][],
    ["aliases", "[]"]
  ];

  return fm.map(i => `${i[0]}: ${i[1]}`).join("\n");
}

function abs_path(path: string, c: PageConfig) {
  return [
    path.startsWith("/") ? path : `/${path}`,
    c.page?.split(/\//)?.pop() || ""
  ].join("/")
}

async function create_page(tp: Templater, config: PageConfig) {
  const fm = `---
  ${meta(config)}
  ---
  `;
  const content = `
  ${tags(config).join(" ")}
  # ${config.page}
  `;
  
  const page_content = `${fm}${content}`;

  const filepath = (c: PageConfig) => {
    return c.category_of === "#business"
      ? abs_path("company", c)
      : c.page;
  }

  if (!filepath(config) || !config.page) {
    console.error(`Attempt to create a new page failed as the "page" property was malformed: ${filepath(config)} / ${config.page}`);
    return;
  }

  console.log("Creating file: ", filepath(config));
  
  
  const file = await tp.file.create_new( page_content, filepath(config));
  console.log("completed: ", file);
  
}

async function update_page(tp: Templater, config: PageConfig) {
  // 
}


/**
 * Evaluates all highlighted text for references to pages. 
 * 
 * 1. When a page reference is found it is created (if virtual) and it's types are 
 * set to `category` of the page currently on. It will also set the `sub_category` 
 * if the `#sub-category` tag is present on the host page.
 * 
 * 2. Once all pages have been created (or updated); the highlighted text will
 * be replaced with a **Dataview** query which will show all products of the 
 * page's specificity
 */
export async function category_convert(tp: Templater): Promise<string> {
  
  const selection = await tp.file.selection();
  const page = tp.file.content;
  const tags = tp.file.tags;
  // const vault = globalThis.app.vault;
  // const fileManager = globalThis.app.fileManager;
  
  const category = tags.includes("#category")
  ? tp.config.active_file?.basename || tp.config.target_file?.name?.replace(".md","") || ""
  : tp.frontmatter.category ? tp.frontmatter.category?.replace("[[", "").replace("]]", "").trim() || "" : "";

  const sub_category = tags.includes('#sub-category')
  ? tp.config.target_file?.name?.replace(".md","")
  : tp.frontmatter?.sub_category?.replace("[[", "").replace("]]", "").trim() || "";

  const parent = tags.includes("#business") && tp.frontmatter.parent
    ? tp.frontmatter.parent
    : undefined;

  const category_of = tags.filter(i => VALID_CATEGORY_TAGS.includes(i as ValidCategoryTag)).pop() as ValidCategoryTag;
  
  /**
   * All the references to page links found within the selected section
  */
  const ref_found = selection
  .split("[[")
  .map(b => b.replace(/(.*)\]\].*/s, "$1").trim())
  .slice(1);
  
  const exists = ref_found.filter(i => tp.file.find_tfile(i));
  const virtual = ref_found.filter(i => !tp.file.find_tfile(i));

  console.groupCollapsed("create_convert() fn received a request");
  // console.log("create_convert function received the following context");
  console.log("selected text:\n", selection);
  console.log(`category will be set to "${category}"`);
  console.log(`sub_category will be set to "${sub_category}"`);
  console.log(`the type of item being categorized is "${category_of}"`);
  console.log("tags are:", tags);
  if(parent) {
    console.log("parent node is: ", parent)
  }

  console.info("Existing page refs:",exists);
  console.info("Virtual page refs:",virtual);
  
  const choices = [`skip existing files: [ ${exists.join(", ")} ]`, "process anyway"] as const;
  let choice;
  
  if (exists.length > 0) {
    const msg = `There were <b>${ref_found}</b> page references found in the content selected; however <b>${exists}</b> point to pages which already exist. Help us to choose what to do with these entries:`;
    
    let c = await tp.system.suggester(choices, choices, false, "process anyway");
    console.info(`all virtual nodes [${virtual.length}] will be created automatically`);
    
    if (/.*skip existing.*/.test(c)) {
      console.info(`all actual nodes [${exists.length}] will be skipped`);
      choice = false;
    } else {
      console.info(`all actual nodes [${exists.length}] will be updated to ensure category information`);
      choice = false;
    }
  } else {
    console.info(`all ${ref_found.length} nodes are virtual nodes and will be created`);
  }

  console.groupEnd();

  const wait: Promise<any>[] = [];

  for (const page of virtual) {
    wait.push(create_page(tp, {page, category, sub_category, category_of, selection, tags, parent}));
  }

  for (const page of exists) {
    wait.push(update_page(tp, {page, category, sub_category, category_of, selection, tags, parent}));
  }

  await Promise.all(wait);

  const replaceChoices = [
    `replace all links with a Dataview query`, 
    `keep all text on current page unchanged`
  ] as const;

  const replace = await tp.system.suggester(replaceChoices,["replace","keep"]);

  console.groupCollapsed("category_convert() has completed");
  console.log(`all ${ref_found.length} pages were updated/created`);
  
  console.groupEnd();

  return selection;
}
