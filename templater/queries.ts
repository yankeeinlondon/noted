import { Templater } from "./index";

export async function getProducts<P extends readonly string[]>(tp: Templater): Promise<P> {
  return [] as unknown as P;
}

export async function getCompanies<P extends readonly string[]>(tp: Templater): Promise<P> {
  return [] as unknown as P;
}

/**
 * **getFile(tp, page)**
 * 
 * Gets the text contents of a file.
 */
export async function getFile<P extends string>(
  tp: Templater, 
  page: P
): Promise<string> {
  const f =  await tp.file.find_tfile(page);
  if (f && f.extension === "md") {
    return tp.obsidian.Vault.read(f);
  } else {
    if (f) {
      throw new Error(`File '${page}' found but extension was not '.md'!`);
    }

    throw new Error(`File '${page}' was not found!`)
  }
}
