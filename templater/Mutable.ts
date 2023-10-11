type MutableObject<T> = {
  -readonly [K in keyof T]: T[K] extends object
    ? MutableObject<T[K]> 
    : T[K] extends readonly (infer R)[]
      ? R[]
      : T[K];
};

type MutableArray<T extends readonly unknown[]> = [...T];


/**
 * **Mutable**`<T>`
 * 
 * Makes a readonly value to a mutable value without
 * widening the type.
 */
export type Mutable<T> = T extends readonly unknown[]
  ? MutableArray<T>
  : T extends object ? MutableObject<T> : T;



export type Immutable<T extends { [propName:string]: unknown }> ={
  readonly [key in keyof T]: T[key] extends { [propName:string]: unknown }
    ? Immutable<T[key]>
    : T[key]
};
