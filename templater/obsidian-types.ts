

/**
 * @public
 */
export interface FileStats {
  /**
   * Time of creation, represented as a unix timestamp, in milliseconds.
   * @public
   */
  ctime: number;
  /**
   * Time of last modification, represented as a unix timestamp, in milliseconds.
   * @public
   */
  mtime: number;
  /**
   * Size on disk, as bytes.
   * @public
   */
  size: number;
}

/**
 * @public
 */
export class TemplateFile {
  stat: FileStats;

  /**
   * Filename without extension
   */
  basename: string;
  /**
   * the file's extension; often "md"
   */
  extension: string;

  name?: string;

  parent?: TemplateFile;

  /**
   * the full path to the file including the filename
   */
  path: string;

  vault?: unknown;
  saving?: boolean;
  deleted: boolean;
}

/**
 * @public
 */
export interface DataWriteOptions {
  /**
   * Time of creation, represented as a unix timestamp, in milliseconds.
   * Omit this if you want to keep the default behaviour.
   * @public
   * */
  ctime?: number;
  /**
   * Time of last modification, represented as a unix timestamp, in milliseconds.
   * Omit this if you want to keep the default behaviour.
   * @public
   */
  mtime?: number;
}

/**
 * @public
 */
export interface EventRef {

}

/** @public */
export interface Stat {
  /** @public */
  type: 'file' | 'folder';
  /**
   * Time of creation, represented as a unix timestamp.
   * @public
   * */
  ctime: number;
  /**
   * Time of last modification, represented as a unix timestamp.
   * @public
   */
  mtime: number;
  /**
   * Size on disk, as bytes.
   * @public
   */
  size: number;
}

/**
 * @public
 */
export interface ListedFiles {
  /** @public */
  files: string[];
  /** @public */
  folders: string[];
}


/**
 * Work directly with files and folders inside a vault.
 * If possible prefer using the {@link Vault} API over this.
 * @public
 */
export interface DataAdapter {

  /**
   * @public
   */
  getName(): string;

  /**
   * Check if something exists at the given path.
   * @param normalizedPath - path to file/folder, use {@link normalizePath} to normalize beforehand.
   * @param sensitive - Some file systems/operating systems are case-insensitive, set to true to force a case-sensitivity check.
   * @public
   */
  exists(normalizedPath: string, sensitive?: boolean): Promise<boolean>;
  /**
   * Retrieve metadata about the given file/folder.
   * @param normalizedPath - path to file/folder, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  stat(normalizedPath: string): Promise<Stat | null>;
  /**
   * Retrieve a list of all files and folders inside the given folder, non-recursive.
   * @param normalizedPath - path to folder, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  list(normalizedPath: string): Promise<ListedFiles>;
  /**
   * @param normalizedPath - path to file, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  read(normalizedPath: string): Promise<string>;
  /**
   * @param normalizedPath - path to file, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  readBinary(normalizedPath: string): Promise<ArrayBuffer>;
  /**
   * Write to a plaintext file.
   * If the file exists its content will be overwritten, otherwise the file will be created.
   * @param normalizedPath - path to file, use {@link normalizePath} to normalize beforehand.
   * @param data - new file content
   * @param options - (Optional)
   * @public
   */
  write(normalizedPath: string, data: string, options?: DataWriteOptions): Promise<void>;
  /**
   * Write to a binary file.
   * If the file exists its content will be overwritten, otherwise the file will be created.
   * @param normalizedPath - path to file, use {@link normalizePath} to normalize beforehand.
   * @param data - the new file content
   * @param options - (Optional)
   * @public
   */
  writeBinary(normalizedPath: string, data: ArrayBuffer, options?: DataWriteOptions): Promise<void>;
  /**
   * Add text to the end of a plaintext file.
   * @param normalizedPath - path to file, use {@link normalizePath} to normalize beforehand.
   * @param data - the text to append.
   * @param options - (Optional)
   * @public
   */
  append(normalizedPath: string, data: string, options?: DataWriteOptions): Promise<void>;
  /**
   * Atomically read, modify, and save the contents of a plaintext file.
   * @param normalizedPath - path to file/folder, use {@link normalizePath} to normalize beforehand.
   * @param fn - a callback function which returns the new content of the file synchronously.
   * @param options - write options.
   * @returns string - the text value of the file that was written.
   * @public
   */
  process(normalizedPath: string, fn: (data: string) => string, options?: DataWriteOptions): Promise<string>;
  /**
   * Returns an URI for the browser engine to use, for example to embed an image.
   * @param normalizedPath - path to file/folder, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  getResourcePath(normalizedPath: string): string;
  /**
   * Create a directory.
   * @param normalizedPath - path to use for new folder, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  mkdir(normalizedPath: string): Promise<void>;
  /**
   * Try moving to system trash.
   * @param normalizedPath - path to file/folder, use {@link normalizePath} to normalize beforehand.
   * @returns Returns true if succeeded. This can fail due to system trash being disabled.
   * @public
   */
  trashSystem(normalizedPath: string): Promise<boolean>;
  /**
   * Move to local trash.
   * Files will be moved into the `.trash` folder at the root of the vault.
   * @param normalizedPath - path to file/folder, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  trashLocal(normalizedPath: string): Promise<void>;
  /**
   * Remove a directory.
   * @param normalizedPath - path to folder, use {@link normalizePath} to normalize beforehand.
   * @param recursive - If `true`, delete folders under this folder recursively, if `false´ the folder needs to be empty.
   * @public
   */
  rmdir(normalizedPath: string, recursive: boolean): Promise<void>;
  /**
   * Delete a file.
   * @param normalizedPath - path to file, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  remove(normalizedPath: string): Promise<void>;

  /**
   * Rename a file or folder.
   * @param normalizedPath - current path to file/folder, use {@link normalizePath} to normalize beforehand.
   * @param normalizedNewPath - new path to file/folder, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  rename(normalizedPath: string, normalizedNewPath: string): Promise<void>;
  /**
   * Create a copy of a file.
   * This will fail if there is already a file at `normalizedNewPath`.
   * @param normalizedPath - path to file, use {@link normalizePath} to normalize beforehand.
   * @param normalizedNewPath - path to file, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  copy(normalizedPath: string, normalizedNewPath: string): Promise<void>;
}

/**
 * @public
 */
export interface Events {

  /**
   * @public
   */
  on(name: string, callback: (...data: any) => any, ctx?: any): EventRef;
  /**
   * @public
   */
  off(name: string, callback: (...data: any) => any): void;
  /**
   * @public
   */
  offref(ref: EventRef): void;
  /**
   * @public
   */
  trigger(name: string, ...data: any[]): void;
  /**
   * @public
   */
  tryTrigger(evt: EventRef, args: any[]): void;
}


/**
 * Work with files and folders stored inside a vault.
 * @see {@link https://docs.obsidian.md/Plugins/Vault}
 * @public
 */
export interface Vault extends Events {
  /**
   * @public
   */
  adapter: DataAdapter;

  /**
   * Gets the path to the config folder.
   * This value is typically `.obsidian` but it could be different.
   * @public
   */
  configDir: string;

  /**
   * Gets the name of the vault.
   * @public
   */
  getName(): string;

  /**
   * Get a file or folder inside the vault. If you need a file, you should test the returned object with `instanceof TFile`. Otherwise, if you need a folder, you should test it with `instanceof TFolder`.
   * @param path - vault absolute path to the folder or file, with extension, case sensitive.
   * @returns the abstract file, if it's found.
   * @public
   */
  getAbstractFileByPath(path: string): TAbstractFile | null;

  /**
   * Get the root folder of the current vault.
   * @public
   */
  getRoot(): TFolder;

  /**
   * Create a new plaintext file inside the vault.
   * @param path - Vault absolute path for the new file, with extension.
   * @param data - text content for the new file.
   * @param options - (Optional)
   * @public
   */
  create(path: string, data: string, options?: DataWriteOptions): Promise<TemplateFile>;
  /**
   * Create a new binary file inside the vault.
   * @param path - Vault absolute path for the new file, with extension.
   * @param data - content for the new file.
   * @param options - (Optional)
   * @throws Error if file already exists
   * @public
   */
  createBinary(path: string, data: ArrayBuffer, options?: DataWriteOptions): Promise<TemplateFile>;
  /**
   * Create a new folder inside the vault.
   * @param path - Vault absolute path for the new folder.
   * @throws Error if folder already exists
   * @public
   */
  createFolder(path: string): Promise<TFolder>;
  /**
   * Read a plaintext file that is stored inside the vault, directly from disk.
   * Use this if you intend to modify the file content afterwards.
   * Use {@link Vault.cachedRead} otherwise for better performance.
   * @public
   */
  read(file: TemplateFile): Promise<string>;
  /**
   * Read the content of a plaintext file stored inside the vault
   * Use this if you only want to display the content to the user.
   * If you want to modify the file content afterward use {@link Vault.read}
   * @public
   */
  cachedRead(file: TemplateFile): Promise<string>;
  /**
   * Read the content of a binary file stored inside the vault.
   * @public
   */
  readBinary(file: TemplateFile): Promise<ArrayBuffer>;

  /**
   * Returns an URI for the browser engine to use, for example to embed an image.
   * @public
   */
  getResourcePath(file: TemplateFile): string;
  /**
   * Deletes the file completely.
   * @param file - The file or folder to be deleted
   * @param force - Should attempt to delete folder even if it has hidden children
   * @public
   */
  delete(file: TAbstractFile, force?: boolean): Promise<void>;
  /**
   * Tries to move to system trash. If that isn't successful/allowed, use local trash
   * @param file - The file or folder to be deleted
   * @param system - Set to `false` to use local trash by default.
   * @public
   */
  trash(file: TAbstractFile, system: boolean): Promise<void>;
  /**
   * Rename or move a file.
   * @param file - the file to rename/move
   * @param newPath - vault absolute path to move file to.
   * @public
   */
  rename(file: TAbstractFile, newPath: string): Promise<void>;
  /**
   * Modify the contents of a plaintext file.
   * @param file - The file
   * @param data - The new file content
   * @param options - (Optional)
   * @public
   */
  modify(file: TemplateFile, data: string, options?: DataWriteOptions): Promise<void>;
  /**
   * Modify the contents of a binary file.
   * @param file - The file
   * @param data - The new file content
   * @param options - (Optional)
   * @public
   */
  modifyBinary(file: TemplateFile, data: ArrayBuffer, options?: DataWriteOptions): Promise<void>;
  /**
   * Add text to the end of a plaintext file inside the vault.
   * @param file - The file
   * @param data - the text to add
   * @param options - (Optional)
   * @public
   */
  append(file: TemplateFile, data: string, options?: DataWriteOptions): Promise<void>;
  /**
   * Atomically read, modify, and save the contents of a note.
   * @param file - the file to be read and modified.
   * @param fn - a callback function which returns the new content of the note synchronously.
   * @param options - write options.
   * @returns string - the text value of the note that was written.
   * @public
   */
  process(file: TemplateFile, fn: (data: string) => string, options?: DataWriteOptions): Promise<string>;
  /**
   * Create a copy of the selected file.
   * @param file - The file
   * @param newPath - Vault absolute path for the new copy.
   * @public
   */
  copy(file: TemplateFile, newPath: string): Promise<TemplateFile>;
  /**
   * Get all files and folders in the vault.
   * @public
   */
  getAllLoadedFiles(): TAbstractFile[];

  /**
   * @public
   */
  // static recurseChildren(root: TFolder, cb: (file: TAbstractFile) => any): void;
  /**
   * Get all markdown files in the vault.
   * @public
   */
  getMarkdownFiles(): TemplateFile[];
  /**
   * Get all files in the vault.
   * @public
   */
  getFiles(): TemplateFile[];

  /**
   * Called when a file is created.
   * This is also called when the vault is first loaded for each existing file
   * If you do not wish to receive create events on vault load, register your event handler inside {@link Workspace.onLayoutReady}.
   * @public
   */
  on(name: 'create', callback: (file: TAbstractFile) => any, ctx?: any): EventRef;
  /**
   * Called when a file is modified.
   * @public
   */
  on(name: 'modify', callback: (file: TAbstractFile) => any, ctx?: any): EventRef;
  /**
   * Called when a file is deleted.
   * @public
   */
  on(name: 'delete', callback: (file: TAbstractFile) => any, ctx?: any): EventRef;
  /**
   * Called when a file is renamed.
   * @public
   */
  on(name: 'rename', callback: (file: TAbstractFile, oldPath: string) => any, ctx?: any): EventRef;

}


/**
 * This can be either a `TFile` or a `TFolder`.
 * @public
 */
export abstract class TAbstractFile {
  /**
   * @public
   */
  vault: Vault;
  /**
   * @public
   */
  path: string;
  /**
   * @public
   */
  name: string;
  /**
   * @public
   */
  parent: TFolder | null;

}

/**
 * @public
 */
export interface TFolder extends TAbstractFile {
  /**
   * @public
   */
  children: TAbstractFile[];

  /**
   * @public
   */
  isRoot(): boolean;

}

