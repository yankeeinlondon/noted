# Noted

> My scripts for interacting with Obsidian via the [Templater](https://silentvoid13.github.io/Templater/settings.html) plugin.

## Goals for Project

People are free to use as they wish but this is a "me project" where my primary aim is to meeting my note taking needs.

As for contribution, if you are thinking you have a PR that you'd like to contribute then i'm happy to consider it but please no plain issues as I am struggling to find time for all my repos.

All that said, I do hope that this repo can serve as a good set of "examples" for people wanting to do more advanced things with the **Templater** plugin.

## Directory Overview

- The `src` folder:
  - contains several **Typescript** files at the _root_ of this folder which map one-to-one to the functions which will be exposed to you inside **Obsidian** and more specifically, the **Templater** plugin.
  - Templater -- to work properly -- requires not only Javascript files but **CommonJS** Javascript files. In order to _transpile_ the Typescript to CJS we use a two stage process:
    - We use the popular [**tsup**](https://github.com/egoist/tsup) npm module to transpile TS to JS
    - Unfortunately the idea of a "default export" is different enough between CJS and the more modern ES Modules that the CJS exports that **tsup** produces are not actually picked up by **Templater**.
    - To address this i've created a simply shell script which wraps up the entire "build process" and this can be run in the following ways:
      - running `./transpile` from the root of the repo runs the shell script directly (be sure to provide the file executable permissions)
      - alternatively you can simply run `pnpm build` (replace "pnpm" with whatever package manager you're using if not **pnpm**)
      - finally, if you want to run a watcher process to recompile whenever a change is made to the typescript content you can run `pnpm watch`
- The `src/utilities` directory:
  - This is where we find a set of useful abstractions for both the runtime as well as types.
  - If you're script need to import anything it's likely that importing from `src/utilities/index.ts` is all you'll need.
- The `dist` folder:
  - this contains all of the transpiled JS code and while you shouldn't be modifying this directly knowing its existence (or timestamps on the files) can sometimes be useful

## Example Usage

### Smart Callouts

I have setup a hotkey which I use whenever I'm on a page where I want to
