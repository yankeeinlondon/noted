import { Frontmatter, Templater,  dv,  getApp,  getVault } from "./templater";

export type FmCmd = "set" | "merge" | "defaults" | "exclude";

function excludeKeys(tp: Templater, keys: readonly string[]) {
  // 
}

function combineFrontmatter<T extends Frontmatter>(tp: Templater, cmd: Exclude<FmCmd, "exclude">, fm: T) {
  // let left = cmd === "defaults" || 
  //   ? fm
}

export type FmParam<T extends FmCmd> = T extends "exclude"
? readonly string[]
: Frontmatter;

export function fm<
  TCmd extends FmCmd,
  TParam extends FmParam<TCmd>
>(
  tp: Templater, 
  cmd: TCmd, 
  param: TParam
) {
  console.groupCollapsed(`fm(tp,${cmd},param)`);
  console.log("APP", getApp());


  try {
    if (cmd === "exclude") {
      return excludeKeys(
        tp, 
        param as FmParam<"exclude">
      );
    } else {
      return combineFrontmatter(
        tp, 
        cmd, 
        param as FmParam<"merge" | "set" | "defaults">
      )
    }
  } catch (e: unknown) {
    console.error("Error occurred running fm() script", e);
  } finally {
    console.groupEnd();
  }
}
