import { Templater } from "./templater/index";


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
export async function category_convert(tp: Templater): Promise<void> {
  const selection = await tp.file.selection();
  const category = tp.frontmatter.category;
  const sub_category = tp.frontmatter.sub_category;
  const page = tp.file.content;

  console.log({
    selection, category, sub_category, page
  });
  
}
