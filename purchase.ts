import { Currency, Frontmatter, StdDate, Templater, askYesNo, createNewProduct, current_folder, cwd, getCompanies, getFile, getProducts, ifttt, selectFromList } from "./templater";

export type PurchaseCommand = "frontmatter" | "summary";
export type Op = "create" | "update" | "ask";

export interface PurchaseMeta extends Frontmatter {
  kind: "Purchase";
  /** where is the product located in a house (or elsewhere) */
  place?: string;
  /** a reference to the product definition */
  product?: string;
  /** 
   * A reference to the **Company** which makes the product
   * which was purchased.
   */
  company?: string;
  /** the currency purchased in */
  currency?: Currency;
  /** the price purchased at */
  price?: number;
  /**
   * the price had it been priced in USD
   */
  usd_equiv?: number;

  /** 
   * A reference to the company which **sold** the product
   */
  retailer?: string;
  /**
   * The date the product was purchased
   */
  purchase_date?: StdDate;
  /**
   * The date the item was taken possession of
   */
  received?: StdDate;

  /**
   * The date the item was sold, thrown away, etc.
   */
  archived?: StdDate;
  archival_comment?: string;
}

async function meta_inquiry(
  tp: Templater, 
  op: Op
): Promise<PurchaseMeta> {
  let path = op === "update" 
    ? tp.file.path() 
    : `${cwd(tp)}/new_page.md`;

  if (op === "ask") {
    const updateThisPage = await askYesNo(tp, `Make current page -- ${tp.file.title} -- into a Purchase page?`)
    if (updateThisPage) {
      console.log(`- user requested that current page be used`)
      path = tp.file.path();
      op = "update"
    } else {
      console.log(`- user requested a new page be created`);
      const inCurrentDir = await askYesNo(tp, `Add new receipt page to the current directory (${cwd(tp)})?`);

      path = inCurrentDir ? `${cwd(tp)}/new_page.md` : tp.file.path();
      op = "create"
    }
  }

  const needsNewProduct = [
    "NEW HARDWARE",
    "NEW SOFTWARE",
    "NEW PRODUCT",
  ] as const;

  const product_choices = [
    ...needsNewProduct,
    ...(await getProducts(tp))
  ] as const;

  const product = (tp.frontmatter.product as string) || await selectFromList(
    tp, 
    "Which product did you purchase?",
    product_choices
  );

  const page = needsNewProduct.some(i => i === product)
    ? await createNewProduct(tp)
    : await getFile(tp, product);
  // const company = page && (page as TFile).

  const retailCompanies = [
    "NEW COMPANY",
    ...(await getCompanies(tp))
  ] as const;

  const retailer = (tp.frontmatter.retailer as string) || 
    await selectFromList(
      tp, 
      "Where was this purchased?",
      retailCompanies
    );

  return {
    ...tp.frontmatter,
    kind: "Purchase",
    product,
    retailer,
    
  }
}

function fm(tp: Templater, meta: PurchaseMeta) {
  const frontmatter = `
---
kind: "Purchase"
product: ${meta.product || ""}
purchase_date: ${meta.purchase_date || ""}
retailer: ${meta.retailer || ""}
price: ${meta.price || ""}
currency: ${meta.currency  || ""}
located: ${meta.located  || ""}
location: 
---
`;
  tp.file.cursor_append(frontmatter);
}

function summary(tp: Templater, meta: PurchaseMeta) {
  const lines: string[] = [
    `> [!info]+ <b>${meta.product}</b>`,
    `> Purchased the ${meta.product} made by ${meta.company}.`,
    ...ifttt(
      meta.purchase_date, 
      `> on ${meta.purchase_date} for the price of ${meta.currency}${meta.price}`),
    ...ifttt(
      meta.card,
      `> - The transaction was placed on the ${meta.card} card.`,
      `> - No card was associated with the transaction.`
    )
  ];

  return lines.join("\n");
}

function find_op(tp: Templater) {
  return tp.frontmatter.kind === "Purchase"
    ? "update"
    : tp.frontmatter?.kind ? "create" : "ask";
}

export async function purchase<T extends Templater, C extends PurchaseCommand>(tp: T, cmd: C, ctx?: unknown[]) {
  const op: Op = find_op(tp);
  console.groupCollapsed(`purchase(tp, ${cmd})`);
  console.log(`- called from the '${tp.file.title}' file`);
  console.log(`  residing in the '${await current_folder(tp)}' folder`)
  
  console.log(`page operation: ${op}`);
  
  const meta = await meta_inquiry(tp, op);
  console.log(`- "meta" property is`, meta);
  
  console.groupEnd();
  
  switch(cmd) {
    case "frontmatter":
      await fm(tp, meta);
    case "summary": 
      return summary(tp, meta);

  }
}


