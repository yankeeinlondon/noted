import { Mutable } from "./Mutable";

/**
 * Converts a Tuple type into a _union_ of the tuple elements
 * 
 * ```ts
 * const arr = [1, 3, 5] as const;
 * // 1 | 3 | 5
 * type U = TupleToUnion<typeof arr>;
 * ```
 * 
 * **Note:** an empty array will be converted to a `string` type.
 */
export type TupleToUnion<T> = Mutable<T> extends readonly unknown[] 
  ? Mutable<T>[number]
  : never;