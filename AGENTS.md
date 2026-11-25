Use Bun instead of Node.js, npm, pnpm or yarn.

- Use `bun install` to install dependencies, and `bun add`/`bun remove` to change them
- Use `bun run <script>` to run `package.json` scripts, and `bunx <package> <command>` instead of `npx`
- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun check` instead of `tsc --noEmit`
- Use `bun lint` and `bun fmt` instead of `eslint` and `prettier`
- Environment variables from `.env` files are loaded automatically, so don't use `dotenv`
- The `dev` script sets `BUN_OPTIONS=--no-env-file`, so `next dev` loads `.env` files itself and reloads them on change (see https://github.com/oven-sh/bun/issues/47916). After upgrading Next.js, follow the checks in `readme.md`

## Translations

next-intl extracts the messages of `t()` into `messages/*.po`, in `next dev` and `next build`. Run `bun run i18n:extract` to update them without either, like after adding or removing messages, then translate the new entries, which have an empty `msgstr`.

## Patched dependencies

Some dependencies are patched via `patchedDependencies` in `package.json`, with patch files in `patches/`.

- To change a dependency, use `bun patch <pkg>`, edit it in `node_modules/`, then `bun patch --commit <pkg>`. Never edit `node_modules/` without committing a patch.
- Patches are pinned to exact versions, so `bun update` keeps patched packages at their version (`kept … (patched, … available)`). To update one, use `bun update --latest <pkg>` or bump its version, then re-create the patch with `bun patch`.

## Local services

Define containers for third-party services in local development, like a Typesense server, in `docker/compose.yaml`, not in the `Dockerfile`, which builds the production image. See `readme.md`.

- Services read variables from `.env.local`: run them with `docker compose --env-file .env.local --file docker/compose.yaml up --detach`
- Define variables that a service shares with the app in `lib/env/schema.ts`, or in the `env-schema.ts` of the feature that `lib/env/schema.ts` spreads, so `bun run env:sync` generates them, and reference them as `${NAME:?}`

## Deployment

`.github/workflows/build-deploy.yaml` builds the image, and deploys the manifests in `kubernetes/` with `kubectl`. See `readme.md`.

- `bun run env:deploy` provides the variables in `lib/env/schema.ts`, so don't list them in the workflow. Set values that differ between deployments, and are not secret, in `configs/deployments.ts`, and others in GitHub. Set `phases` in the metadata of a server variable that is read while prerendering, like `v.metadata({ phases: ["build", "runtime"] })`
- Give each resource in `kubernetes/` the labels of the others, so that it is deleted when it is removed. Add new placeholders to `envsubst` in `.github/actions/deploy/deploy.sh`

## Testing

Use `bun test` to run tests.

## End-to-end tests

Use `bun run test:e2e` to run the Playwright tests in `e2e/`. Set `PORT` if port 3000 is taken, because Playwright reuses whatever server is listening there.

Add an end-to-end test for behavior that depends on the browser or the framework, like routing, i18n, focus management, metadata or accessibility. Use `bun test` for logic that runs without them, like utilities and reducers. Don't mock Next.js or React Aria to unit test a component. Test what the app configures and composes, not what its dependencies already guarantee, like keyboard handling in React Aria or date formatting in next-intl. An exception is a workaround for a bug in a dependency: test the behavior it fixes, so the test fails if an upgrade breaks it.

Locate elements by aria role with `getByRole`, not by element name with `locator("h1")`. `bun lint` enforces this with `playwright/no-raw-locators`.

- `cacheComponents` keeps previous pages in the DOM with `display: none` after client navigations. `getByRole` ignores hidden elements, plain locators also match them
- Elements without an aria role, like those in `<head>`, can use `locator()`. Add these selectors to `allowed` in `configs/oxlint/playwright.ts`

### Fixtures

Pages that only the end-to-end tests need, like one that uses a convention no page of the app uses yet, are fixtures in `app/[locale]/e2e/`, named after what they test, like `app/[locale]/e2e/search-params/`. Delete a fixture once a page of the app covers what it tests.

- Each fixture page calls `assertE2eFixture()` from `lib/e2e/fixtures.ts` first, which calls `notFound()` unless `BUILD_TARGET` is `e2e`, which Playwright sets for the build it starts. Other builds, and `next dev`, respond with 404. Not in a layout, because Next.js renders a page even when its layout calls `notFound()`, so its content would be in the response. `bun test` checks that every fixture page calls it
- Fixtures are pages like any other, so `bun check` type checks them and their routes are in the route types. Don't add them to the sitemap or the navigation, or give them metadata, which Next.js resolves even for a page that calls `notFound()`
- Use plain strings, not `t()`, so that they don't need translations, and next-intl doesn't extract them into `messages/*.po`

## Type checking

Use `bun check` to type check the project. It reads `tsconfig.json` and reports the same errors as `tsc`.

- Compiler options are in `configs/typescript.config.json`. `tsconfig.json` extends it and only sets what is resolved relative to the root, like `paths` and `include`, because Bun, Next.js and editors look for it there
- `bun check src/index.ts` checks one file and what it imports
- `lib` only includes what the `browserslist` targets in `package.json` support, but `bun-types` declares newer globals for the whole project, like `Error.isError`, so `bun check` doesn't report them. Check browser support for APIs in code that can run in the browser
- Route types (`PageProps`, `LayoutProps`) are generated into `.next/types` by `bun run types:generate`, which runs on `bun install`. Our Next.js patch also generates the global `RouteRegistry` for `href()` into `.next/types/navigation.d.ts`, which `next dev` keeps up to date. Don't import route types from `.next/types/routes.d.ts`: `next dev` writes its own copy to `.next/dev/types`, so imported types go stale in development

## Linting

`configs/oxlint/` sets every rule explicitly, with all categories off. `bun test configs` warns about rules that a Bun or plugin upgrade added, and fails when a rule is set by an alias, like `typescript/no-unused-vars` for `no-unused-vars`, which would override the rule's other setting.

- Relative globs in `overrides` resolve against `configs/`. Use `fromRoot()` for paths outside `configs/`, and a glob without a slash, like `*.config.ts`, to match a file name in any directory. Absolute globs don't match files inside `configs/`

`configs/stylelint.config.ts` also sets every rule explicitly, with `null` for rules that are off, and `bun test configs` warns about rules that a stylelint or plugin upgrade added.

## CSS

- Put all CSS in a cascade layer, like `@layer base`, so utilities can override it
- Separate primitive tokens (raw values, like `--color-neutral-950`) from semantic tokens (their purpose, like `--color-canvas-text`). Components use semantic tokens only
- Define color tokens that differ between color schemes with `light-dark()`, not with `dark:` variants. The `data-color-scheme` attribute on `<html>` overrides the system preference

## Pages

- Each page renders its own main landmark with `<MainContent>` from `components/main-content.tsx`, not with `<main>`, because it is the target of the skip link. This includes `not-found`, `error` and `loading` pages. The layout only renders the header and footer
- `lib/navigation/static-pages.ts` lists every page without params as included in the sitemap or excluded, so `bun check` reports a new page until it is added there. The end-to-end tests check every included page, like for accessibility
- Wrap request-time content in its own `<Suspense>`, close to the data, rather than adding `loading.tsx`, so the rest of the page stays in the static shell. Don't add a `loading.tsx` to `app/[locale]/`: it wraps every page in a boundary, so a page that reads uncached data outside `<Suspense>` no longer fails the build, and shows a full-page fallback instead

## Search params

A page that reads search params defines them in a `search-params.ts` next to its `page.tsx`, which exports `searchParamsCodec`, created with `createSearchParamsCodec()` from `lib/navigation/search-params.ts`. Each search param decodes from the url into a typed value and encodes back, validated with an optional valibot schema of the value, like `searchParam.number(v.pipe(v.number(), v.integer(), v.minValue(1)), { default: 1 })`.

- Our Next.js patch adds the codecs to the `RouteRegistry`, which `next dev` regenerates. `bun check` reports a `search-params.ts` without a valid `searchParamsCodec` export
- `href({ pathname, searchParams })` only accepts `encodeSearchParams()` with that page's codec, like `encodeSearchParams(searchParamsCodec, { page: page + 1 })`. It throws for invalid values, and leaves out defaults, so links are canonical. Pages without the file accept any search params
- Decode the `searchParams` prop, or `useSearchParams()`, with `parseSearchParams()`. Invalid search params fall back to their default, because urls are user input, and unknown ones are ignored. `parseSearchParamsWithIssues()` also returns the issues, like for a hint on the page
- With `cacheComponents`, read `searchParams` inside `<Suspense>`, so the rest of the page stays in the static shell

## React

- Avoid booleans for application state: name the states instead, like `status: "idle" | "loading" | "error"` rather than `isLoading` and `isError`, also when there are only two. Boolean props are fine when they mirror an html attribute or a third-party prop, like `disabled` or `isDisabled`
- Name booleans with an `is` or `has` prefix, like `isDisabled` or `hasError`. Html attributes keep their own names, like `disabled`
- Model state explicitly when it has several related values or meaningful transitions, like loading, success and error: use `useReducer` with a discriminated union rather than several `useState` calls, so impossible states cannot be represented. `useState` is fine for a single independent value
- Use `xstate` only for UI flows that outgrow a reducer, like a multi-step form with guards and async side effects. Ask before adding it as a dependency. Async functions outside components, like `request()`, stay plain code
- Prefer composition over configuration: pass content through `children` or slot props rather than adding config props that switch what a component renders
- Choose the element by behavior, not by looks: a link navigates, a button performs an action. A link can look like a button and a button like a link, by sharing style functions (like `buttonStyles()`) that return class names, not with polymorphic props like `<Button href>` or `as="a"`. Links cannot be disabled, so something that needs a disabled state is a button
- Use a native html element when one fits, like `<button>` or `<details>`. Otherwise use a React Aria component. Only build a custom widget when neither fits, and follow its pattern in the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/patterns/), including keyboard handling. Add an end-to-end test for it, since React Aria doesn't guarantee its behavior

## Errors

Throw errors for failures. Only server actions return them, as state, and services return expected outcomes as values (see [Services](#services)). Next.js is built around thrown errors: `notFound()` and `redirect()` throw, error boundaries render `error.tsx`, and an error while prerendering fails the build. `"use cache"` functions cannot return class instances, so not a `Result` wrapper either.

- Define an error class for each failure that a caller may handle, with a literal `name`, like `class SiteMetadataError extends Error { override readonly name = "SiteMetadataError"; }`. Callers narrow with `instanceof`
- Pass the original error as `cause` when wrapping it
- Only catch errors you handle, and rethrow the rest. Handle an expected error where it has a meaning for the user, like an `HttpError` with status 404 for a missing record, which becomes `notFound()`. Let everything else reach the error boundary, or fail the build
- Don't wrap bugs, like an invalid url, in an error class: they throw as they are
- Server actions return expected failures, like invalid form data, as serializable state for `useActionState`, because Next.js hides the message of a thrown error in production. `createServerAction()` does this, see below
- Make http requests with `request()` from `lib/request/request.ts`, not with `fetch`. It throws a subclass of `RequestError` from `lib/request/errors.ts`, like `HttpError` or `TimeoutError`, and handles timeouts, retries and unread response bodies
- `request()` always passes a `signal` to `fetch`, which opts out of the memoization of identical `GET` requests during a render. Wrap a request that several components make in a function with `"use cache"`, or with React's `cache()` for data that must not be cached across requests. `cache()` from outside is not shared with `"use cache"` functions
- Send credentials in headers, like `Authorization`, never in search params, which end up in logs and error messages. If an api only accepts them as search params, redact them where that api is called

## Server actions

Create server actions with `createServerAction()` from `lib/server-actions/create-server-action.ts`, in a file with `"use server"`, and use them with `useActionState`, starting from `idleActionState`.

- `schema` validates the form data. Leave it out for actions without input, and the handler receives an empty object. It is created for each request, so that its messages can be translated with `await getExtracted({ locale })`, and checks without a message get a generic translated one. next-intl only extracts messages of a `t` bound to the result of `getExtracted()`, so don't pass `t` around. Invalid input returns `fieldErrors`, keyed by the field name, which React Aria's `<Form validationErrors>` shows on the fields
- Throw an `ActionError` with a translated message for an expected failure. Other errors are logged, and the user sees a generic message
- The error state contains the submitted values, because a form resets after its action. Use them as the `defaultValue` of each field, and list fields like passwords in `omitValues`, so that their values are not sent back
- Server actions are public endpoints, so check authorization in each action, also when only authorized users see the form. Check it in `guard`, which runs before `schema`, so that async checks in the schema, like whether a name is taken, don't run for unauthorized callers. Return what `schema` and `handler` need from the check, like the user, so they receive it in their context instead of loading it again
- Rate limit actions that can be abused, like sign-in or contact forms, with `rateLimit()` from `lib/server-actions/rate-limit.ts` in `guard`, and a limiter created with `createRateLimiter()` at module level. It limits the client address by default, so call it before authorization to slow down guessing passwords, or pass the user id as key after it
- `next/root-params` throws in server actions, so use the `locale` from the handler's context

## Services

Put business logic in framework-agnostic modules in `services/<feature>/`, like `services/contact/`. Pages and server actions are thin adapters: they read the request, check authorization, validate and translate, call a service, and map its result to the framework, like `notFound()`, `redirect()` or an `ActionError`. `lib/` holds infrastructure, like `request()` or `Mailer`, and framework helpers.

- `bun lint` forbids imports of Next.js, React, next-intl, `server-only`, `app/`, `components/`, `lib/env/` and `lib/server-actions/` in `services/`. Pass configuration and clients, like `env` values or a `Mailer`, as a dependencies parameter, so that tests pass fakes instead of mocking modules
- Services return no user-facing messages, because translating needs the locale. Return data, and translate in the adapter
- Test services with `bun test`

### Errors in services

Return expected outcomes, which the caller decides how to handle, as a discriminated union, like `{ status: "sent" } | { status: "spam" }`. Throw failures, like an unreachable server, or a bug. Map the outcomes with a `switch` in the adapter: `typescript/switch-exhaustiveness-check` and `noImplicitReturns` report each adapter that misses a new outcome.

- Outcomes are plain objects, so that they serialize through `"use cache"`. Name the states, as in React state, rather than returning booleans. `T | null` is fine when "not found" is the only outcome
- Don't add a Result type library. Failures reach an error boundary or `createServerAction()`, which handle them generically, so only the outcomes that callers branch on belong in the return type
- Don't catch a failure to return it as an outcome, unless callers handle it differently from other failures

## Optional features

`configs/features.ts` lists the features that apps can remove. To remove one, follow `.claude/skills/remove-feature/SKILL.md`. To set up a new app from the template, which also removes the features it doesn't keep, follow `.claude/skills/template-setup/SKILL.md`. When adding a feature, list it there, and keep its references findable by `bun check`: import its code and env schema, and link to its pages with `href()`, so that deleting its paths leaves type errors. List only what `bun check` cannot find in `steps`. Then remove the feature once on a throwaway branch, to check that the steps are complete.

## Code comments

- Only add a comment when something needs explanation, like a non-obvious reason or constraint. Don't restate what the code does
- Keep comments concise
- For workarounds, link to the upstream issue where appropriate, with `@see {@link url}`, so the workaround can be removed once the issue is fixed
- Avoid comments that easily get out of sync with the code, like ones that repeat values or describe other files, and don't document the discussion or history that led to the code. That belongs in the commit message

## Commits

- Keep commits atomic: one logical change per commit, including its tests and docs. Each commit should work on its own, so a change and what it depends on go in the same commit
- Don't mix unrelated changes, even when they are already staged together. Split them, or ask
- Start commit subjects in lowercase, without a conventional commits prefix like `feat:`. Names keep their case, like `Next.js`

## Pull requests

- Pull requests are squash merged, so the pr title becomes the commit subject on `main`. Write it like a commit subject
- Keep each pull request to one logical change, since it is squashed into one commit
- In the description, explain what the change does and why: what a reviewer can't see in the diff, like the motivation for a design decision or the alternatives considered. Leave out anything not relevant to the change itself

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
