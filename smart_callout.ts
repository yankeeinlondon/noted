// Templater Docs: https://silentvoid13.github.io
// Templater Repo: 

import { Templater, CALLOUT_TYPES, page_name, links, website, wikipedia, product_page, repo_url } from "./templater";


/**
 * When no known `kind` is found than just proceed with a dump callout
 */
async function dumb(tp: Templater, type: string, override: string | null = null, content: string | null = null): Promise<string> {
    const top_line = await tp.system.suggester(
        ["Static", "Folding - Open", "Folding - Closed"],
        [
            `> [!${type}] `, 
            `> [!${type}]+ `, 
            `> [!${type}] `
        ]
    );
    const top_override = override || await tp.system.prompt("Replacement text for top/icon line (leave blank for none): ");
    const content_line = content || '';

    return `${top_line}${top_override}\n> ${content_line}`;
}

async function plugin(tp: Templater): Promise<null | string> {
    if (tp.frontmatter.kind !== "Plugin") {
        return null;
    }

    return dumb(tp, "info", "Software Plugin", `**${page_name(tp)}** [ ${links(tp)} ]`)
}

async function company(tp: Templater): Promise<null | string> {
    if (tp.frontmatter.kind !== "Company") {
        return null;
    } 

    const company = tp.config.target_file.basename;
    const links = [website(tp), product_page(tp), repo_url(tp), wikipedia(tp)].filter(i => i);

    const companyLink = `**${company}** [ ${links.join(", ")} ]`;
    
    return dumb(tp, "info", "Company Page", `${companyLink}`);
}

/**
 * Returns a **Dataview** query -- in string form -- which produces a callout with the clipboard content representing 
 * the primary content but also with an icon provided in upper right hand side.
 */
async function smart_wrap(tp: Templater, clippy: string): Promise<string> {
    const def_icon =  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="#888888" d="M15 5h2V3h-2m0 18h2v-2h-2M11 5h2V3h-2m8 2h2V3h-2m0 6h2V7h-2m0 14h2v-2h-2m0-6h2v-2h-2m0 6h2v-2h-2M3 5h2V3H3m0 6h2V7H3m0 6h2v-2H3m0 6h2v-2H3m0 6h2v-2H3m8 2h2v-2h-2m-4 2h2v-2H7M7 5h2V3H7v2Z"/></svg>';

    const icon = tp.frontmatter.svg_icon || def_icon;
    clippy = (clippy.trim() || "no content on clipboard!").split("\n").join("\n> ");

    const callout = (behave: string, icon: string) =>  `\n> [!info] <span style="display: flex; flex: 1;"><span style="width: 24px; position: absolute; right: 16">${icon}</span></span>`;


    return [
        "```dataviewjs",
        `const content = \`${clippy}\`;\n`,
        `let icon = dv.current().svg_icon ||  \`${icon}\`;\n`,
        `const callout = (behave, icon) => \`\n> [!\${kind}]\${behave} <span style="display: flex; flex: 1;"><span style="width: 24px; position: absolute; right: 16">\${icon}</span></span>\`;\n`,
        `const kind = "info";`,
        `const behavior_opt = { static: "", open: "+", closed: "-" };`,
        `const behavior = behavior_opt.open;\n`,
        `dv.paragraph(\`\${callout(behavior, icon)}\n> \${content}\n\`);`,
        "```"
    ].join("\n")
}


/**
 * Create a `Callout` leveraging the page's metadata
 */
export async function smart_callout(tp: Templater): Promise<string> {

    const selected = await tp.file.selection();
    const clippy = await tp.system.clipboard();
    if (selected) {
        console.log("selected:", selected);
        
        // content found so we'll assume a smart wrap
        return smart_wrap(tp, clippy);
    } else {
        console.log("no clipboard content found");
    }

    const type = await tp.system.suggester(["smart", ...CALLOUT_TYPES], ["smart", ...CALLOUT_TYPES]);
    const result = type === "smart"
        ? (await plugin(tp))
            || (await company(tp))
            || dumb(tp, type)
        : dumb(tp,type);

    return result;
}
