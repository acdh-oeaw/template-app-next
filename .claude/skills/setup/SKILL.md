---
name: setup
description: Set up a new app created from this template, by choosing which optional features to keep, naming the app, and replacing the template's defaults. Use when the user starts a new project from the template, or asks to set up or initialize the app.
---

# Set up an app from the template

Run this once, in a new repository created from the template. It removes the features the app doesn't need, so ask before anything else, and change nothing until the user has answered.

1. Check that this is a fresh copy: the `name` in `package.json` is `@acdh-oeaw/template-app-next`. Otherwise ask whether to continue.
2. Ask in one round:
   - Which features to keep, as a multiple choice of the features in `configs/features.ts`, with their descriptions
   - If the user may not keep `i18n-routing`, which locale the app is in, from `configs/i18n.config.ts`
   - The package name, like `@acdh-oeaw/<repository>`
   - The title and description of the app in each locale in `content/*/metadata.json`, and whether to keep the ACDH social links
   - The Redmine service id of the app, for the imprint, if it has one yet
3. Remove each feature that the user did not keep, with the `remove-feature` skill, and commit each removal on its own.
4. Name the app:
   - `name` in `package.json`, and the project `name` in `docker/compose.yaml` (the repository name), if the file still exists
   - The heading and first line of `readme.md`
   - `title`, `description` and `manifest` in each `content/*/metadata.json`, and `social` if the user did not keep the ACDH links
5. Set the Redmine service id as the `dev` value of `SERVICE_ID` in `configs/env.config.ts`, as `SERVICE_ID` in `.env.local`, and in the `env` of the `e2e` job in `.github/workflows/validate.yaml`. Without an id yet, keep the template's, and tell the user to replace it before the first deployment.
6. Delete the template's own files: `TODO.md`, which is the template's backlog, and this skill, `.claude/skills/setup/`.
7. Run `bun install`, `bun run i18n:extract`, `bun lint`, `bun check`, `bun test`, `bun run build`, and `bun run test:e2e` with an unused `PORT`, because Playwright reuses a server that is already listening there.
8. Commit the rest as one commit, like `set up the app`, and tell the user what is left for deployment, like `NEXT_PUBLIC_APP_BASE_URL` and the variables of the features they kept, see "Environment variables" and "Docker" in `readme.md`.
