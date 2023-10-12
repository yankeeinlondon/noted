import { Templater } from "./Templater";


export const wikipedia = (tp: Templater) => tp.frontmatter.wikipedia 
    ? `[wikipedia](${tp.frontmatter.wikipedia})`
    : `[wikipedia](https://en.wikipedia.com/?search="${tp.config.target_file.basename}")`;

export const website = (tp: Templater) => tp.frontmatter.website
    ? `[website](${tp.frontmatter.website})`
    : null;

export const product_page = (tp: Templater) => tp.frontmatter.product_page
    ? `[product](${tp.frontmatter.product_page})`
    : null;

export const repo_url = (tp: Templater) => tp.frontmatter.repo_url
    ? `[repo](${tp.frontmatter.repo_url})`
    : null;

/**
 * **links**
 * 
 * Provides markdown links to external pages referenced in metadata
 * such as `wikipedia`, `repo_url`, etc.
 */
export const links = (tp: Templater) => [website(tp), product_page(tp), repo_url(tp), wikipedia(tp)].filter(i => i).join(", ");


/**
 * **page_name**
 * 
 * Provides the current page's "basename"
 */
export const page_name = (tp: Templater) => tp.config.target_file.basename;


/**
 * **keep_if_set**`(tp,prop,ask)`
 * 
 * Keeps a frontmatter "as is" if it's set otherwise it prompts for
 * a value.
 */
export const keep_if_set = async <C extends [string[],string[]]>(
    tp: Templater, 
    prop: string,
    ask: string,
    choices?: C
) => tp.frontmatter[prop]
    ? tp.frontmatter[prop]
    : choices
        ? await tp.system.suggester(choices[0], choices[1], true, ask)
        : await tp.system.prompt(ask);

    
export function capitalize<T extends string>(str: T): Capitalize<T> {
    return `${str?.slice(0,1).toUpperCase()}${str?.slice(1)}` as Capitalize<T>;
    }
