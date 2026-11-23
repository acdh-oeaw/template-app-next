---
name: remove-feature
description: Remove an optional feature of the template from the app, like the contact form. Use when the user wants to remove, drop or opt out of a feature listed in `configs/features.ts`.
---

# Remove a feature

`configs/features.ts` lists the features that apps can remove. Remove a feature's code rather than adding a flag to disable it. Deleting its paths leaves errors at the remaining references, so the checks find most of what to change.

1. Read the feature in `configs/features.ts`. If the user named none, list the features with their descriptions, and ask.
2. Delete its `paths`, and its entry in `configs/features.ts`.
3. Remove its `dependencies` with `bun remove`.
4. Remove its `composeServices` from `docker/compose.yaml`. Delete the file when no service remains, and update "Local services" in `readme.md`.
5. Run `bun run types:generate`, so that the route types no longer contain the removed pages. Then run `bun check`, `bun lint` and `bun test`, and remove each reference they report, like a navigation item, an entry in `lib/navigation/static-pages.ts`, or an env spread in `configs/env.config.ts`. Remove references, don't stub them.
6. Do each of the feature's `steps`.
7. Search the repository for the remaining mentions of its paths, dependencies, services and variables, like in `AGENTS.md`, `readme.md`, `TODO.md` and `.github/`, and remove the ones that only concern this feature. Keep conventions that other code can use, like the lint rules for `services/`.
8. Remove its variables from `.env.local`, which `bun run env:sync` adds but never removes.
9. Run `bun run build`, which also removes the feature's messages from `messages/*.po`, and `bun run test:e2e`.
10. Commit the removal as one commit, like `remove the contact form`.
