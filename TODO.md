# TODO

## Next up

- [ ] Site metadata
  - [x] Localized `generateMetadata` in `app/[locale]/layout.tsx` (title template, description, `metadataBase`)
  - [x] `manifest.ts`
  - [x] `robots.ts`, `sitemap.ts`
  - [ ] JSON-LD (`WebSite`, with social links as `sameAs`)
  - [x] Validate `content/*/metadata.json`
  - [ ] OpenGraph images
- [ ] Not-found behavior (measured on Next.js 16.4.5 production builds)
  - [ ] `notFound()` in a page or layout is not server-rendered: 404 with an empty `__next_error__` shell (no `lang`,
        title or landmarks), and the localized `not-found.tsx` only renders client-side
        (https://github.com/vercel/next.js/issues/99287). A fix is proposed in
        https://github.com/vercel/next.js/pull/100648, but it leaves fallback-param routes (params not returned by
        `generateStaticParams`) unchanged with `cacheComponents`
  - [ ] `notFound()` for params not returned by `generateStaticParams` responds with 200 on the first request, and 404
        once cached (https://github.com/vercel/next.js/issues/98518, closed without a fix)
  - [ ] Unmatched urls below a locale prefix render `global-not-found.tsx` in the default locale, also for
        `/de/does-not-exist`. Localizing it needs the locale from a request header, but `headers()` there makes every
        route partially prerendered, also inside `<Suspense>` or in `generateMetadata`. The alternative, a `[...rest]`
        catch-all calling `notFound()`, gets the empty shell above and interferes with parallel routes
  - [ ] Invalid locales the proxy skips, like `/x.png`, render Next's unstyled default 404, because `notFound()` in the
        root layout does not use `global-not-found.tsx` (https://github.com/vercel/next.js/issues/86095, closed as a
        duplicate of https://github.com/vercel/next.js/issues/85446). Workaround:
        a root `app/not-found.tsx` with its own `<html>` instead of `global-not-found.tsx`, but still client-rendered
- [x] Playwright setup
  - [x] Accessibility checks with `axe-core`
  - [ ] Screen reader tests with `guidepup`
  - [ ] Mock upstream apis, once the app reads from one, to test error states: point the api base url at a small Bun mock
        server with an env variable, so it works for `next build` and at request time; `page.route()` for browser
        requests; unit tests for mapping errors to ui. Not `experimental.testProxy`: undocumented, no new features
        since 2024, only mocks request-time fetches (not prerendered or `"use cache"` data), and makes the server send
        requests to whatever port a test header names
- [ ] Browser e2e test for the not-found and error pages in `e2e/errors.test.ts` (curl only sees status codes, because
      of the client-rendered shell)
  - [ ] `/en/does-not-exist`: 404 with `global-not-found.tsx`, server-rendered
  - [ ] A page calling `notFound()`: 404 with the localized `app/[locale]/not-found.tsx`
  - [ ] Invalid locale, e.g. `/x.png`: 404 with our not-found page, not Next's default not-found page. Always renders
        in the default locale, also for German visitors. Currently renders Next's default page, without our styles or
        `ColorSchemeScript`, so it ignores the stored color scheme
  - [ ] `/en-GB`: redirected to `/en/en-GB` by the proxy, then 404
  - [ ] Error page, once it exists
- [x] Browser e2e test for light and dark mode, with Playwright's `colorScheme` option
- [x] Browser e2e test for canonical urls: content must only be reachable under the language prefix (`/en/*`), never
      under the internal locale (`/en-GB/*`) that the proxy rewrites to. Currently `/en-GB/*` redirects to
      `/en/en-GB/*`, also for RSC requests. Pages using `createPageMetadata()` emit a matching `<link rel="canonical">`.
- [ ] Remove `lib/browser/defer-message-port-messages-in-bfcache.ts` once Firefox fixes
      https://bugzilla.mozilla.org/show_bug.cgi?id=2077455. Playwright cannot test bfcache restores, so check manually in
      a production build: leave the site with a mouse click on a React Aria link, go back, then follow a client link

## Missing

- [x] README
  - [x] Point to `configs/env.config.ts` as the place where environment variables are defined, and to `bun run env:sync`
- [ ] CI workflows
  - [x] Validate
  - [ ] Build and deploy
  - [ ] Pass public and build-time environment variables to `docker build` as the `dotenv` secret, its sha256 hash as
        the `DOTENV_HASH` build arg, and the Bun version from `devEngines` as the `BUN_VERSION` build arg
  - [ ] Explore deploying with `kubectl` and/or `helm` directly, instead of the reusable
        `acdh-oeaw/gl-autodevops-minimal-port` workflow
- [ ] `test` script and test setup
- [ ] App shell: `components/header.tsx`, `components/footer.tsx`, rendered in `app/[locale]/layout.tsx`
  - [x] Navigation
  - [ ] Mobile navigation: the menu button goes inside the navigation landmark, so it is found when navigating by
        landmarks
  - [ ] Navigation menus (nested items): add a `kind` to `NavigationItem`. React Aria collection components with `href`
        items, like `Menu`, need a `RouterProvider` for client navigation
  - [ ] `IconButton` component, once there is a first icon button: requires an accessible name, hides the icon from
        screen readers, and uses a `touch-area` utility, which enlarges the hit area with a pseudo-element
  - [x] Locale switcher
  - [ ] Footer: link to the accessibility declaration, social links from `getSiteMetadata()`
  - [x] Color scheme switcher in `components/color-scheme/`
  - [ ] Browser e2e test for client navigation with `instant()` from `@next/playwright`, once there are links and dynamic
        content. Pair positive assertions with a negative one like `toHaveCount(0)`, because nothing is held back when
        the testing API is missing
    - [x] Enable `experimental.exposeTestingApiInProductionBuild` for test builds only, with `BUILD_TARGET=e2e` in
          `configs/env.config.ts`, set in Playwright's `webServer.env` and never in the `Dockerfile`
    - [x] `e2e/instant-navigation.test.ts` with positive assertions for the existing pages
    - [ ] Negative assertions, once a page has request-time content
- [ ] Focus management and announcements after client navigation. Next.js has no API to choose where focus goes, or
      what screen readers announce, after a navigation. A locale switch replaces the root layout and drops focus to
      `<body>`, which the locale switcher works around with module state. Design the API we wish existed upstream, and
      carry it as a local patch until it is merged
  - [ ] Research: current Next.js behaviour (route announcer, scroll and focus handling, layout boundaries), other
        routers (React Router, TanStack Router, SvelteKit, Astro view transitions), and recommendations (the Fable
        Tech Labs user testing of client routing by Marcy Sutton)
  - [ ] Cases: link to a new page, same-page hash or search param change, back and forward, a navigation from a control
        that should keep focus (like a locale or filter switcher), form submission, not-found and error pages
  - [ ] API design, write it up before building it, and consider proposing it upstream
  - [ ] Implement as a patch, replace the workaround in `components/locale-switcher/`, and add e2e tests
- [ ] Pages: imprint (placeholder only), accessibility declaration, error, loading
- [ ] Devcontainer, issue templates

## Maybe

- [ ] Review the oxlint setup in `dariah-eric/dariah-website` (`configs/oxlint/*`) and decide what to copy, including
      the `nextjs` and `jsx-a11y` plugins
- [ ] Review the stylelint setup in `dariah-eric/dariah-website` and decide what to copy
- [ ] Scope messages passed to `NextIntlClientProvider` once there are client components
- [ ] Re-check Tailwind CSS source detection in the Docker build once the template has more code: the `.dockerignore`
      allowlist excludes `.gitignore`, which is fine since Tailwind v4.1.6 ignores `.next/` by default
      (tailwindlabs/tailwindcss#17892), but compare build time and CSS output with and without `.gitignore`
- [ ] Typed navigation: reimplement the ideas from `dariah-website` (Next.js patch plus `lib/navigation/*`) from
      scratch rather than copying
  - [x] `href()` helper
  - [x] `search-params.ts` convention
  - [x] Derive the static pages in `app/sitemap.ts` from typed routes, or type check the list against `AppRoutes` from
        `.next/types/routes.d.ts`, so that new pages cannot be forgotten
  - [ ] Links from a headless cms, once there is one: store a route and its params, like
        `{ pathname: "/posts/[id]", params: { id } }`, not a url, validate them with a valibot schema of the known
        routes, and pass them to `href()`. The route names need a runtime list, type checked against `Route` (could be
        shared with the sitemap). Matching cms pathnames against routes (`parseHref()`) only if the cms cannot store routes
  - [ ] Investigate moving the generic parts into a package, so that apps no longer carry their tests. Wait until the API
        has been stable in one or two apps, because a package puts every change behind a release
    - Generic: `search-params.ts`, `href.ts` (except stripping `[locale]`, which could be a type parameter, and the
      brand texts, which name the module) and `get-aria-current.ts`, with their tests
    - Stays in the app: the next-intl wrappers in `lib/i18n/navigation.ts`, `<Link>`, the lint restrictions, the
      sitemap record, `navigation.test-d.tsx`, and the fixture with its e2e tests
    - The patch cannot ship in a package. Either keep it in the app, which makes the format of `navigation.d.ts` a
      contract between two repositories, or generate the registry from the package, with a `next.config.ts` wrapper
      that generates once for `next typegen` and `next build`, and watches `app/` in `next dev`. That removes the patch,
      but reimplements how Next.js resolves routes (route groups, parallel and intercepting routes, private folders,
      `pageExtensions`). Prototype it first, to see how much is needed
    - A separate package with an example app for its e2e tests, like `acdh-oeaw/content-lib`, not `@acdh-oeaw/lib`,
      which depends on neither Next.js nor valibot
    - Ask Next.js upstream for a global route registry, which would also fix the stale route types in `next dev`
- [ ] After updating `@react-aria/optimize-locales-plugin` past 2.1.0, re-create our patch, and decide whether it should
      keep `locales: readonly string[]` in the Turbopack rule type, which upstream relaxed to `string[]` to satisfy
      Next.js's `JSONValue` (adobe/react-spectrum#10889, unreleased). `bun check` passes with the readonly type today
- [ ] Remove `fallback: []` from `firaCode` in `styles/fonts.ts` once https://github.com/vercel/next.js/pull/101397
      is in a stable release (it is in `16.5.0-canary.53`). Check that a Turbopack build emits no `Fira Code Fallback`
      face
- [x] Clean up leftover `.gitignore` entries (`.pnpm-store/`, `/docker/.env`, `.turbo/`, ...)
- [ ] Recommend the Bun VS Code extension (`oven.bun-vscode`) in `.vscode/extensions.json` once it lints and formats
      (https://github.com/oven-sh/bun/pull/46885). Narrow `bun.test.filePattern`, which also matches `e2e/`, and set
      `editor.formatOnSave` and `source.fixAll.bun` in `.vscode/settings.json`
