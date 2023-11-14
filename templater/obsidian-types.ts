import { FileEvent, OnlyRenameEvent, Semver } from "./other-types";
import { Url } from "./kinds";
import type { DataviewApi } from "obsidian-dataview/lib/api/plugin-api";

export type OnConfigFileChange = (...args: unknown[]) => any & {
  cancel: (...args: unknown[]) => any;
  run: (...args: unknown[]) => any;
}

export type ObsidianPlugin<
  TProps extends Object = {},
  TSettings extends Record<string, any> = Record<string, any>
> =  {
  app: Record<string, any>;
  settings: TSettings;
  manifest:{
    id: string;
    name: string;
    author: string;
    authorUrl: string;
    description: string;
    dir: string;
    isDesktopOnly: boolean;
    minAppVersion: Semver;
    version: Semver;
  }
  onConfigFileChange?: OnConfigFileChange
} & TProps;


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
export interface TemplateFile  {
  stat: FileStats;

  /**
   * Filename without extension
   */
  basename: string;
  /**
   * the file's extension; often "md"
   */
  extension: string;

  name: string;

  parent?: TemplateFile;

  /**
   * the full path to the file including the filename
   */
  path: string;


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
  getName: ()=> string;

  /**
   * Check if something exists at the given path.
   * @param normalizedPath - path to file/folder, use {@link normalizePath} to normalize beforehand.
   * @param sensitive - Some file systems/operating systems are case-insensitive, set to true to force a case-sensitivity check.
   * @public
   */
  exists: (normalizedPath: string, sensitive?: boolean)=> Promise<boolean>;
  /**
   * Retrieve metadata about the given file/folder.
   * @param normalizedPath - path to file/folder, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  stat: (normalizedPath: string)=> Promise<Stat | null>;
  /**
   * Retrieve a list of all files and folders inside the given folder, non-recursive.
   * @param normalizedPath - path to folder, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  list: (normalizedPath: string)=> Promise<ListedFiles>;
  /**
   * @param normalizedPath - path to file, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  read: (normalizedPath: string) => Promise<string>;
  /**
   * @param normalizedPath - path to file, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  readBinary: (normalizedPath: string) => Promise<ArrayBuffer>;
  /**
   * Write to a plaintext file.
   * If the file exists its content will be overwritten, otherwise the file will be created.
   * @param normalizedPath - path to file, use {@link normalizePath} to normalize beforehand.
   * @param data - new file content
   * @param options - (Optional)
   * @public
   */
  write: (normalizedPath: string, data: string, options?: DataWriteOptions) => Promise<void>;
  /**
   * Write to a binary file.
   * If the file exists its content will be overwritten, otherwise the file will be created.
   * @param normalizedPath - path to file, use {@link normalizePath} to normalize beforehand.
   * @param data - the new file content
   * @param options - (Optional)
   * @public
   */
  writeBinary: (normalizedPath: string, data: ArrayBuffer, options?: DataWriteOptions)=> Promise<void>;
  /**
   * Add text to the end of a plaintext file.
   * @param normalizedPath - path to file, use {@link normalizePath} to normalize beforehand.
   * @param data - the text to append.
   * @param options - (Optional)
   * @public
   */
  append: (normalizedPath: string, data: string, options?: DataWriteOptions) => Promise<void>;
  /**
   * Atomically read, modify, and save the contents of a plaintext file.
   * @param normalizedPath - path to file/folder, use {@link normalizePath} to normalize beforehand.
   * @param fn - a callback function which returns the new content of the file synchronously.
   * @param options - write options.
   * @returns string - the text value of the file that was written.
   * @public
   */
  process: (normalizedPath: string, fn: (data: string) => string, options?: DataWriteOptions)=> Promise<string>;
  /**
   * Returns an URI for the browser engine to use, for example to embed an image.
   * @param normalizedPath - path to file/folder, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  getResourcePath: (normalizedPath: string) => string;
  /**
   * Create a directory.
   * @param normalizedPath - path to use for new folder, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  mkdir: (normalizedPath: string) => Promise<void>;
  /**
   * Try moving to system trash.
   * @param normalizedPath - path to file/folder, use {@link normalizePath} to normalize beforehand.
   * @returns Returns true if succeeded. This can fail due to system trash being disabled.
   * @public
   */
  trashSystem: (normalizedPath: string) => Promise<boolean>;
  /**
   * Move to local trash.
   * Files will be moved into the `.trash` folder at the root of the vault.
   * @param normalizedPath - path to file/folder, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  trashLocal: (normalizedPath: string)=> Promise<void>;
  /**
   * Remove a directory.
   * @param normalizedPath - path to folder, use {@link normalizePath} to normalize beforehand.
   * @param recursive - If `true`, delete folders under this folder recursively, if `false´ the folder needs to be empty.
   * @public
   */
  rmdir: (normalizedPath: string, recursive: boolean) => Promise<void>;
  /**
   * Delete a file.
   * @param normalizedPath - path to file, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  remove: (normalizedPath: string) => Promise<void>;

  /**
   * Rename a file or folder.
   * @param normalizedPath - current path to file/folder, use {@link normalizePath} to normalize beforehand.
   * @param normalizedNewPath - new path to file/folder, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  rename: (normalizedPath: string, normalizedNewPath: string) => Promise<void>;
  /**
   * Create a copy of a file.
   * This will fail if there is already a file at `normalizedNewPath`.
   * @param normalizedPath - path to file, use {@link normalizePath} to normalize beforehand.
   * @param normalizedNewPath - path to file, use {@link normalizePath} to normalize beforehand.
   * @public
   */
  copy: (normalizedPath: string, normalizedNewPath: string) => Promise<void>;
}

/**
 * @public
 */
export interface Events {

  /**
   * @public
   */
  on: (name: string, callback: (...data: any) => any, ctx?: any) => EventRef;
  /**
   * @public
   */
  off: (name: string, callback: (...data: any) => any) => void;
  /**
   * @public
   */
  offref: (ref: EventRef) => void;
  /**
   * @public
   */
  trigger: (name: string, ...data: any[]) => void;
  /**
   * @public
   */
  tryTrigger: (evt: EventRef, args: any[]) => void;
}


/**
 * Manage the creation, deletion and renaming of files from the UI.
 * @public
 */
export interface FileManager {

  /**
   * Gets the folder that new files should be saved to, given the user's preferences.
   * @param sourcePath - The path to the current open/focused file,
   * used when the user wants new files to be created "in the same folder".
   * Use an empty string if there is no active file.
   * @param newFilePath - The path to the file that will be newly created,
   * used to infer what settings to use based on the path's extension.
   * @public
   */
  getNewFileParent: (sourcePath: string, newFilePath?: string) => TFolder;

  /**
   * Rename or move a file safely, and update all links to it depending on the user's preferences.
   * @param file - the file to rename
   * @param newPath - the new path for the file
   * @public
   */
  renameFile: (file: TAbstractFile, newPath: string) => Promise<void>;

  /**
   * Generate a markdown link based on the user's preferences.
   * @param file - the file to link to.
   * @param sourcePath - where the link is stored in, used to compute relative links.
   * @param subpath - A subpath, starting with `#`, used for linking to headings or blocks.
   * @param alias - The display text if it's to be different than the file name. Pass empty string to use file name.
   * @public
   */
  generateMarkdownLink: (file: TFile, sourcePath: string, subpath?: string, alias?: string) => string;

  /**
   * Atomically read, modify, and save the frontmatter of a note.
   * The frontmatter is passed in as a JS object, and should be mutated directly to achieve the desired result.
   *
   * Remember to handle errors thrown by this method.
   *
   * @param file - the file to be modified. Must be a markdown file.
   * @param fn - a callback function which mutates the frontMatter object synchronously.
   * @param options - write options.
   * @throws YAMLParseError if the YAML parsing fails
   * @throws any errors that your callback function throws
   * @public
   */
  processFrontMatter: (file: TFile, fn: (frontmatter: any) => void, options?: DataWriteOptions) => Promise<void>;

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
  getAbstractFileByPath: (path: string)=> TAbstractFile | null;

  /**
   * Get the root folder of the current vault.
   * @public
   */
  getRoot:() => TFolder;

  /**
   * Create a new plaintext file inside the vault.
   * @param path - Vault absolute path for the new file, with extension.
   * @param data - text content for the new file.
   * @param options - (Optional)
   * @public
   */
  create: (path: string, data: string, options?: DataWriteOptions) => Promise<TFile>;
  /**
   * Create a new binary file inside the vault.
   * @param path - Vault absolute path for the new file, with extension.
   * @param data - content for the new file.
   * @param options - (Optional)
   * @throws Error if file already exists
   * @public
   */
  createBinary: (path: string, data: ArrayBuffer, options?: DataWriteOptions)=> Promise<TFile>;
  /**
   * Create a new folder inside the vault.
   * @param path - Vault absolute path for the new folder.
   * @throws Error if folder already exists
   * @public
   */
  createFolder: (path: string)=>  Promise<TFolder>;
  /**
   * Read a plaintext file that is stored inside the vault, directly from disk.
   * Use this if you intend to modify the file content afterwards.
   * Use {@link Vault.cachedRead} otherwise for better performance.
   * @public
   */
  read: (file: TFile)=> Promise<string>;
  /**
   * Read the content of a plaintext file stored inside the vault
   * Use this if you only want to display the content to the user.
   * If you want to modify the file content afterward use {@link Vault.read}
   * @public
   */
  cachedRead: (file: TFile) => Promise<string>;
  /**
   * Read the content of a binary file stored inside the vault.
   * @public
   */
  readBinary: (file: TFile) => Promise<ArrayBuffer>;

  /**
   * Returns an URI for the browser engine to use, for example to embed an image.
   * @public
   */
  getResourcePath: (file: TFile) => string;
  /**
   * Deletes the file completely.
   * @param file - The file or folder to be deleted
   * @param force - Should attempt to delete folder even if it has hidden children
   * @public
   */
  delete: (file: TAbstractFile, force?: boolean)=> Promise<void>;
  /**
   * Tries to move to system trash. If that isn't successful/allowed, use local trash
   * @param file - The file or folder to be deleted
   * @param system - Set to `false` to use local trash by default.
   * @public
   */
  trash: (file: TAbstractFile, system: boolean) => Promise<void>;
  /**
   * Rename or move a file.
   * @param file - the file to rename/move
   * @param newPath - vault absolute path to move file to.
   * @public
   */
  rename: (file: TAbstractFile, newPath: string) => Promise<void>;
  /**
   * Modify the contents of a plaintext file.
   * @param file - The file
   * @param data - The new file content
   * @param options - (Optional)
   * @public
   */
  modify: (file: TFile, data: string, options?: DataWriteOptions) => Promise<void>;
  /**
   * Modify the contents of a binary file.
   * @param file - The file
   * @param data - The new file content
   * @param options - (Optional)
   * @public
   */
  modifyBinary: (file: TFile, data: ArrayBuffer, options?: DataWriteOptions) => Promise<void>;
  /**
   * Add text to the end of a plaintext file inside the vault.
   * @param file - The file
   * @param data - the text to add
   * @param options - (Optional)
   * @public
   */
  append: (file: TFile, data: string, options?: DataWriteOptions) => Promise<void>;
  /**
   * Atomically read, modify, and save the contents of a note.
   * @param file - the file to be read and modified.
   * @param fn - a callback function which returns the new content of the note synchronously.
   * @param options - write options.
   * @returns string - the text value of the note that was written.
   * @public
   */
  process: (file: TFile, fn: (data: string) => string, options?: DataWriteOptions) => Promise<string>;
  /**
   * Create a copy of the selected file.
   * @param file - The file
   * @param newPath - Vault absolute path for the new copy.
   * @public
   */
  copy: (file: TFile, newPath: string) => Promise<TFile>;
  /**
   * Get all files and folders in the vault.
   * @public
   */
  getAllLoadedFiles: () => TAbstractFile[];

  /**
   * Get all markdown files in the vault.
   * @public
   */
  getMarkdownFiles: () => TFile[];
  /**
   * Get all files in the vault.
   * @public
   */
  getFiles: () => TFile[];

  /**
   * Called when a file is created, modified, deleted, or renamed.
   * 
   * **create:**
   * - this is also called when the vault is first loaded for each existing file
   * - if you do not wish to receive create events on vault load, register your event handler inside {@link Workspace.onLayoutReady}.
   *
   * **modify:**
   * - called when a file is modified.
   * **delete**:
   * - called when a file is deleted.
   * 
   * **rename:**
   * - called when a file is renamed; receives both new and old name
   */
  on: <TEvent extends FileEvent>(
      name: TEvent, 
      callback: (file: TAbstractFile, oldPath: OnlyRenameEvent<TEvent>) => any, 
      ctx?: any
    ) => EventRef;


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

export type Callback<
  A extends readonly unknown[] = readonly unknown[], 
  R extends unknown = unknown
> = (...args: A) => R

export interface ObAccount {
  company: string;
  email: string | null;
  expiry: number;
  key?: unknown;
  keyValidation: string;
  license: string | null;
  name: string | null;
  seats: number;
  token: string | null;
}

export interface ObCommand {
  checkCallback: Callback;
  /** 
   * typically a Lucide icon which might look like 
   * "lucide-arrow-left" 
   */
  icon: string;
  /** 
   * a unique id for the command using format of
   * `[PLUGIN]:[dasherized-name]`.
   */
  id: string;
  /** human readable name for the command */
  name: string;
}

export interface ObRibbonItem {
  callback: Callback;
  hidden: boolean;
  icon: string;
  id: string;
  title: string;
}

export interface ObEditorCommand extends ObCommand {
  editorCallback: Callback;
}

export interface ObUserMeta {
  author: string;
  authorUrl: Url;
  dir: string;
  minAppVersion: Semver;
  name: string;
  version: Semver;
}

export interface ObHotKey {
  /**
   * one or more modifiers comma-delimited
   */
  modifiers: string;
  key: string;
}

export interface ObInternalPlugin {
  addedButtonEls: HTMLElement[];
  commands: Record<string, ObCommand>;
  enabled: boolean;
  hasStatusBarItem: boolean;
  instance: Record<string, unknown>;
  lastSave: number;
  manager: unknown;
  mobileFileInfo: unknown[];
  onConfigFileChange: Callback;
  ribbonItems: ObRibbonItem[];
  statusBarEl: HTMLElement | null;
  views: Record<string, unknown>;
}

export interface ObPlugin {
  manifest?: ObUserMeta;
  onConfigFileChange: Callback;
  settings?: Record<string, unknown>
  [key: string]: unknown;
}

export interface ObScope {
    cb: Callback;
    keys: unknown[];
    parent?: ObScope;
    tabFocusContainerEl: HTMLElement | null;
}

export interface ObMermaid {
  contentLoaded: () => void;
  detectType: Callback;
  init: (i: unknown, a: unknown, f: unknown) => Promise<unknown>;
  initialize: (i: unknown) => unknown;
  mermaidAPI: {
    defaultConfig: Record<string, unknown>;
    getConfig: Callback;
    getDiagramFromText: Callback;
    getSiteConfig: Callback;
    globalReset: ()=> unknown;
    parse:  (i: unknown, a: unknown) => Promise<unknown>;
    parseDirective: (i: unknown, a: unknown, f: unknown, p: unknown) => unknown;
    render: (i: unknown, a: unknown, f: unknown) => unknown;
    run:  (i: unknown) => Promise<unknown>;
    setParseErrorHandler: Callback;
    startOnLoad: boolean;
  }
}

export interface ObLinkHover {
  display: string;
  defaultMod: boolean;
}

/**
 * The App context object exposed by Obsidian as a global variable
 */
export interface ObsidianApp {
  account: ObAccount;
  appId: string;
  appMenuBarManager: {
    app: {
      account: ObAccount;
      appId: string;
      // not sure if I should continue
    };
    requestRender: () => void;
    requestUpdateViewStatus: () => void;
  };
  commands: Record<string, ObCommand>;
  editorCommands: Record<string, ObEditorCommand>;
  customCss: {
    boundRaw: () => void;
    cssCache: Map<string, string>;
    enabledSnippets: Set<string>;
    extraStyleEls: HTMLStyleElement[];
    oldThemes: string[];
    queue: Promise<any>;
    requestLoadSnippets: () => void;
    requestLoadTheme: () => void;
    requestReadThemes: () => void;
    snippets: string[];
    styleEl: HTMLStyleElement;
    theme: string;
    themes: Record<string, ObUserMeta>;
  }
    dom: unknown;
    dragManager: {
      actionEl: HTMLBodyElement | null;
      dragStart: unknown;
      draggable: unknown;
      ghostEl: HTMLElement | null;
      hoverClass: string;
      hoverEl: HTMLElement | null;
      onTouchEnd: Callback;
      overlayEl: HTMLElement | null;
      shouldHideOverlay: boolean;
      sourceClass: string;
      sourceEls: HTMLElement[] | null;
    };
    embedRegistry: {
      embedByExtension: {
        "3gp": Callback;
        bmp: Callback;
        canvas: Callback;
        flac: Callback;
        gif: Callback;
        jpeg: Callback;
        jpg: Callback;
        m4a: Callback;
        md: Callback;
        mkv: Callback;
        mov: Callback;
        mp3: Callback;
        mp4: Callback;
        oga: Callback;
        ogg: Callback;
        ogv: Callback;
        opus: Callback;
        pdf: Callback;
        png: Callback;
        svg: Callback;
        wav: Callback;
        webm: Callback;
        webp: Callback;
      }
    };
    fileManager: FileManager;
    foldManager: unknown;
    hotKeyManager: {
      baked: boolean;
      bakedHotkeys: ObHotKey[];
      bakedIds: string[];
      customKeys: Record<string, ObHotKey[]>;
      defaultKeys: Record<string, ObHotKey[]>;
    };
    internalPLugins: {
      config: Record<string, boolean>;
      plugins: Record<string, ObInternalPlugin>;
      requestSaveConfig: () => void;
    };
    isMobile: boolean;
    keymap: {
      modifiers: string;
      prevScopes: unknown[];
      rootScope: {
        keys: unknown[];
        parent?: unknown;
        tabFocusContainerEl: HTMLElement | null;
      };
      scope: {
        cb: Callback;
        keys: unknown[];
        parent: Record<string, unknown> | null;
        tabFocusContainerEl: HTMLElement | null;
      }
    };
    lastEvent: null | unknown;
    loadProgress: {
      doc: Document;
      el: HTMLElement;
      line1El: HTMLElement;
      line2El: HTMLElement;
      lineEl: HTMLElement;
      messageEl: HTMLElement;
      showTimeout: number;
    };
    metadataCache: {};
    metadataTypeManager: {};
    mobileNavbar: unknown | null;
    mobileToolbar: unknown | null;
    nextFrameEvents: unknown[];
    nextFrameTimer: unknown | null;

    plugins: {
      enabledPlugins: Set<string>;
      loadingPluginId: null | unknown;
      manifests: Record<string, ObUserMeta>;
      /**
       * Dictionary of plugins where keys are the name of
       * the plugin (using dasherized style of naming)
       */
      plugins: Record<string, ObPlugin>;

      requestSaveConfig: () => void;
      updates: Record<string, unknown>;
    };
    scope: ObScope;

    setting: {
      activeTab: unknown | null;
      addSettingsTab: Callback;
      bgEl: HTMLElement | null;
      bgOpacity: `${number}`;
      communityPluginTabContainer: HTMLElement | null;
      communityPluginTabHeaderGroup: HTMLElement | null;
      containerEl: HTMLElement | null;
      corePluginTabContainer: HTMLElement | null;
      corePluginTabHeaderGroup: HTMLElement | null;
      dimBackground: boolean;
      lastTabId: string;
      modalEl: HTMLElement | null;
      onClose: Callback;
      onOpen: Callback;
      onWindowClose: Callback;
      openTab: Callback;
      openTabById: Callback;
      pluginTabs: unknown[];
      removeSettingTab: Callback;
      scope: ObScope;
      selection: {
        focusEl: HTMLElement | null;
        range: {
          collapsed: boolean;
          commonAncestorContainer: HTMLElement | null;
          endContainer: HTMLElement | null;
          endOffset: number;
          startContainer: HTMLElement | null;
          startOffset: number;
        };
        /** Global objects on window */
        win: {
          DataviewAPI?: DataviewApi;
          mermaid?: ObMermaid;
          customElements: CustomElementRegistry;

          activeDocument: Document;
          createSvg: (t: unknown, e: unknown, n: unknown) => unknown;
          createDiv: Callback;
          createSpan: Callback;
          createImageBitmap: Callback;
          matchMedia: Callback;

          [key: string]: unknown;
        }
      }

    };
    shareReceiver: unknown;
    statusBar: unknown;
    /** Obsidian title string with version */
    title: string;
    vault: Vault;
    viewRegistry: {
      typeByExtension: Record<string,string>;
      viewByType: Record<string, <T>() => T>;
    }
    workspace: {
      activeEditor: unknown;
      activeLeaf: unknown;
      activeTabGroup: unknown;
      containerEl: HTMLElement;
      editorExtensions: unknown[];
      editorSuggest: unknown;
      floatingSplit: unknown;
      hoverLinkResources: {
        bookmarks: ObLinkHover;
        editor: ObLinkHover;
        "file-explorer": ObLinkHover;
        graph: ObLinkHover;
        preview: ObLinkHover;
        search: ObLinkHover;
      }
      lastActiveFile: TFile;
      lastTabGroupStacked: boolean;
      layoutReady: boolean;
      leftRibbon: unknown;
      leftSidebarToggleButtonEl: HTMLElement;
      leftSplit: unknown;
      mobileFileInfos: unknown[];
      onLayoutReadyCallbacks: unknown | null;
      protocolHandlers: Map<string, Callback>;
      recentFileTracker: unknown;
      requestActiveLeafEvents: () => unknown;
      requestResize: () => unknown;
      requestSaveLayout: () => unknown;
      requestUpdateLayout: () => unknown;
      rightRibbon: unknown;
      rightSidebarToggleButtonEl: HTMLElement;
      rootSplit: unknown;
      scope: ObScope;
    }
}
