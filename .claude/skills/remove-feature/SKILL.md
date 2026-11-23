---
name: remove-feature
description: Remove an optional feature of the template from the app, like the contact form. Use when the user wants to remove, drop or opt out of a feature listed in `configs/features.ts`.
---

# Remove a feature

`configs/features.ts` lists the features that apps can remove. Remove a feature's code rather than adding a flag to disable it. Deleting its paths leaves errors at the remaining references, so the checks find most of what to change.

1. Read the feature in `configs/features.ts`. If the user named none, list the features with their descriptions, and ask.
2. Delete its `paths`, and its entry in `configs/features.ts`.
3. Run `bun check`, and remove each reference it reports, like an env spread in `configs/env.config.ts`. Remove references, don't stub them. Fix these first: `bun install`, `bun remove` and `bun run types:generate` load `next.config.ts`, which fails while `configs/env.config.ts` imports a deleted file.
4. Run `bun run types:generate`, so that the route types no longer contain the removed pages, and run `bun check` again, which now reports links to them, like a navigation item or an entry in `lib/navigation/static-pages.ts`.
5. Remove its `dependencies` with `bun remove`.
6. Remove its `composeServices` from `docker/compose.yaml`. Delete the file when no service remains.
7. Do each of the feature's `steps`.
8. Search the repository for the remaining mentions of its paths, dependencies, services and variables, like in `AGENTS.md`, `readme.md`, `TODO.md` and `.github/`. Remove the ones that only concern this feature, and reword the ones that use it as an example. Keep conventions that other code can use, like the lint rules for `services/`.
9. Remove its variables from `.env.local`, which `bun run env:sync` adds but never removes.
10. Run `bun run i18n:extract`, which removes the feature's messages from `messages/*.po`.
11. Run `bun lint`, `bun test`, `bun run build` and `bun run test:e2e`, with an unused `PORT`, because Playwright reuses a server that is already listening there.
12. Commit the removal as one commit, like `remove the contact form`.
