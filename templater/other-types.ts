import { Vault } from "./obsidian-types";

export type Currency = "USD" | "GBP" | "EUR" | "other";


export type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

export type Era = "19" | "20" | "21";
export type Decade = "1" | "2" | "3" | "8" | "9";

export type MM = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12";

export type DD = `0${Digit}` | `1${Digit}` | `2${Digit}` | `30` | `31`

/**
 * **StdDate**
 * 
 * A date format conforming to the YYYY-MM-DD format.
 */
export type StdDate = `${Era}${Decade}${Digit}-${MM}-${DD}`


export type FileEvent = "create" | "modify" | "delete" | "rename";
export type OnlyRenameEvent<T extends FileEvent> = T extends "rename"
  ? string
  : never;

/**
 * **ObRef**
 * 
 * A string value which references another (singular) page in 
 * the Obsidian vault.
 * 
 * **Related:** `ObListRef` 
 */
export type ObRef = `[[${string}]]`;

export type OptSpace = " " | "";

/**
 * **ObListRef**
 * 
 * A string value which contains an array of page references 
 * in the vault.
 * 
 * **Related:** `ObRef`
 */
export type ObListRef = `[${OptSpace}${ObRef}${`,${string}` | ""}${OptSpace}]`;


export type Semver = `${number}.${number}.${number}`;
