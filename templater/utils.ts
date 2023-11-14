
import { Templater } from "./Templater";
import { TupleToUnion } from "./TupleToUnion";
import {  ObsidianApp, TFolder, TemplateFile, Vault } from "./obsidian-types";
import { Company, Product } from "./kinds";
import { existsSync, readFileSync } from "node:fs";
import { CODE } from "./constants";
import { DataviewApi } from "./Dataview";


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
 * Returns the current folder (fully qualified path from vault's root).
 * 
 * Note: does _not_ include the filename.
 */
export async function current_folder(tp: Templater) {
    const path = await tp.file.path(true);
    return path.split("/").slice(0,-1).join("/");
}

/**
 * **page_name**
 * 
 * Provides the current page's "basename"
 */
export const page_name = (tp: Templater) => tp.config.target_file.basename;

export const cwd = (tp: Templater) => tp.config.target_file?.path?.replace(`${tp.config.target_file.basename}.md`, "")


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

    
/**
 * Capitalizes the first character in the passed in string
 */
export function capitalize<T extends string>(str: T): Capitalize<T> {
    return `${str?.slice(0,1).toUpperCase()}${str?.slice(1)}` as Capitalize<T>;
}

/**
 * **createListProperty(key,list)**
 * 
 * Adds a _list_ property to the frontmatter
 */
export function createListProperty<T extends readonly unknown[]>(key: string, list: T) {
    return `${key}:\n${list.map(i => `  - "${i}"`).join("\n")}`
}

/**
 * given just an array/list of elements, this converts this to a YAML based array value
 */
export function createYamlList<T extends readonly unknown[]>(list: T): string {
    return `\n  ${list.map(i => `  - "${i}"`).join("\n")}`;
} 


/**
 * checks that the trimmed value sent in is structured as a double bracketed
 * link; if it is it returns the trimmed string otherwise it returns false.
 */
export function isDoubleBracketedString(candidate: string): string | false {
    return candidate.trim().startsWith("[[") && candidate.trim().endsWith("]]")
        ? candidate.trim()
        : false;
}

export function ensureDoubleBracketed(candidate) {
    return isDoubleBracketedString(candidate)
        ? isDoubleBracketedString(candidate)
        : `[[${candidate}]]`;
}


export interface YesNoOpt {
    values?: [string, string];
    defaultValue?: boolean;
}


/**
 * provides a simple interface to ask a Yes/No or boolean question;
 * the result returned is either true or false
 */
export async function askYesNo(
    tp: Templater, 
    question: string, 
    opt?: YesNoOpt
) {
    const TRUE=0;
    const FALSE=1;
    
    
    const values = (
        opt?.values || ["yes","no"]
        ) as [truthy: string, falsy:string];
        
        const defVal = opt?.defaultValue !== undefined
        ? opt?.defaultValue ? values[TRUE] : values[FALSE]
        : values[TRUE];
        
        const ask = tp.system.suggester(
            values,
            values,
            true,
            question
        );
        ask.catch(reason => {
            console.log(`user escaped out of the process [ ${reason} ]`);
            console.groupEnd();
        });

        const response = (
            await ask
        ) as unknown as string;
                
    console.log("asking YES/NO", values, response);
    const truthy = values[TRUE];

    return response === truthy ? true : false;
}

export interface ListSelectOptions {
    values?: readonly unknown[];
    throwOnEsc?: boolean;
}

/**
 * The type for a selected list item
 */
export type SelectedListItem<
    TChoices extends readonly string[],
    TOptions extends ListSelectOptions
> = undefined extends TOptions["values"] 
    ? TupleToUnion<TChoices>
    : TupleToUnion<TOptions["values"]>



export async function selectFromList<
    TChoices extends readonly string[],
    TOptions extends ListSelectOptions | undefined
>(
    tp: Templater, 
    question: string, 
    choices: TChoices,
    opt?: TOptions
): Promise<SelectedListItem<TChoices, TOptions>> {
    const response = await tp.system.suggester(
        choices, 
        opt?.values ? opt.values : choices, 
        opt?.throwOnEsc !== undefined ? opt?.throwOnEsc || false : false,
        question
    ) as SelectedListItem<TChoices, TOptions>;

    return response;
}

export  function ifttt(
    tst: unknown, 
    whenTrue: string | string[], 
    whenFalse?: string | string[]
): string[] {
    if (tst) {
        return Array.isArray(whenTrue)
            ? whenTrue
            : [whenTrue]
    } else if (whenFalse !== undefined) {
        return Array.isArray(whenFalse)
            ? whenFalse
            : [whenFalse];
    } else {
        return [];
    }

}



export function codeblock<T>(lang: T, code: string) {
    return `\`\`\`${lang}\n${code}\n\`\`\``
}

export function dataviewjs(code_file: string) {
    const content = existsSync(code_file)
        ? readFileSync(code_file, {encoding: "utf-8"})
        : `dv.paragraph("- ERROR: problems getting code in call to dataviewjs()")`;
    return codeblock("dataviewjs", content);
}

export async function createNewCompany<TMeta extends Partial<Company>>(
    tp: Templater, 
    name?: string | undefined,
    meta?: TMeta
) {
    if (!name) {
        name = await tp.system.prompt("What is the name of the company?");
    }
    if(tp.file.exists(`/company/${name}.md`)) {
        console.warn(`The file '/company/${name}.md' already exists! Returning existing company.`);
        return tp.file.find_tfile(`/company/${name}.md`);
    } else {
        // File doesn't exist; so let's create it
        const fm: Company = {
            ...meta,
            kind: "Company",
            categories: meta.categories || [],
            aliases: []
        }
        const tags = ["company"].map(i => `#${i}`).join(' ');
        const content = `
# ${name}
> [!info] Company Page for **${name}**
> links: ${links(tp)}

## Products
${CODE.company_products}

## Subsidiaries and Brands

        `;

        tp.file.create_new(`${fm}\n${tags}\n${content}`, `/company/${name}.md`, true);
        console.info(`created new company: ${name}`);
    }
}

export async function createNewProduct<TMeta extends Product>(
    tp: Templater, 
    name?: string | undefined, 
    meta?: TMeta
) {
    if(!name) {
        name = await tp.system.prompt("What is the name of the product?");
    }
    let company = await createNewCompany(tp);

    tp.file.create_new(company, `${company}.md`, false)
}

export async function processFrontmatter(tp: Templater, file: string | TemplateFile, fmCallback: any) {
    //
}

/**
 * return the Obsidian App API surface by taking it out
 * of the globally provided `app` root.
 */
export function getApp() {
    return globalThis.app as unknown as ObsidianApp;
}

/**
 * return the Obsidian `Vault` API surface by taking it out
 * of the globally provided `app` root.
 */
export function getVault(): Vault {
    return getApp().vault;
}

export function getDataview(): DataviewApi | null {
    return getApp().setting.selection.win.DataviewAPI || null;
}


export function dv() {
    return getDataview()
}
