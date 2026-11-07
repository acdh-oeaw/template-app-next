Use Bun instead of Node.js, npm, pnpm or yarn.

- Use `bun install` to install dependencies, and `bun add`/`bun remove` to change them
- Use `bun run <script>` to run `package.json` scripts, and `bunx <package> <command>` instead of `npx`
- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun check` instead of `tsc --noEmit`
- Use `bun lint` and `bun fmt` instead of `eslint` and `prettier`
- Environment variables from `.env` files are loaded automatically, so don't use `dotenv`
- The `dev` script sets `BUN_OPTIONS=--no-env-file`, so `next dev` loads `.env` files itself and reloads them on change (see https://github.com/oven-sh/bun/issues/47916). After upgrading Next.js, follow the checks in `readme.md`

## Patched dependencies

Some dependencies are patched via `patchedDependencies` in `package.json`, with patch files in `patches/`.

- To change a dependency, use `bun patch <pkg>`, edit it in `node_modules/`, then `bun patch --commit <pkg>`. Never edit `node_modules/` without committing a patch.
- Patches are pinned to exact versions, so `bun update` keeps patched packages at their version (`kept … (patched, … available)`). To update one, use `bun update --latest <pkg>` or bump its version, then re-create the patch with `bun patch`.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## End-to-end tests

Use `bun run test:e2e` to run the Playwright tests in `e2e/`. Set `PORT` if port 3000 is taken, because Playwright reuses whatever server is listening there.

Locate elements by aria role with `getByRole`, not by element name with `locator("h1")`. `bun lint` enforces this with `playwright/no-raw-locators`.

- `cacheComponents` keeps previous pages in the DOM with `display: none` after client navigations. `getByRole` ignores hidden elements, plain locators also match them
- Elements without an aria role, like those in `<head>`, can use `locator()`. Add these selectors to `allowed` in `configs/oxlint.config.ts`

## Type checking

Use `bun check` to type check the project. It reads `tsconfig.json` and reports the same errors as `tsc`.

- `bun check src/index.ts` checks one file and what it imports
- Route types (`PageProps`, `LayoutProps`) are generated into `.next/types` by `bun run types:prepare`, which runs on `bun install`

## CSS

- Put all CSS in a cascade layer, like `@layer base`, so utilities can override it
- Separate primitive tokens (raw values, like `--color-neutral-950`) from semantic tokens (their purpose, like `--color-canvas-text`). Components use semantic tokens only
- Define color tokens that differ between color schemes with `light-dark()`, not with `dark:` variants. The `data-color-scheme` attribute on `<html>` overrides the system preference

## Pages

- Each page renders its own main landmark with `<MainContent>` from `components/main-content.tsx`, not with `<main>`, because it is the target of the skip link. This includes `not-found`, `error` and `loading` pages. The layout only renders the header and footer

## React

- Avoid booleans for application state: name the states instead, like `status: "idle" | "loading" | "error"` rather than `isLoading` and `isError`, also when there are only two. Boolean props are fine when they mirror an html attribute or a third-party prop, like `disabled` or `isDisabled`
- Name booleans with an `is` or `has` prefix, like `isDisabled` or `hasError`. Html attributes keep their own names, like `disabled`
- Model state explicitly when it has several related values or meaningful transitions, like loading, success and error: use `useReducer` with a discriminated union rather than several `useState` calls, so impossible states cannot be represented. `useState` is fine for a single independent value
- Use `xstate` only for flows that outgrow a reducer, like multi-step processes with guards or async side effects. Ask before adding it as a dependency
- Prefer composition over configuration: pass content through `children` or slot props rather than adding config props that switch what a component renders

## Documentation

For more information, read the Bun docs in `node_modules/bun-types/docs/**.mdx`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
