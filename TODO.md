# TODO

## Next up

- [ ] Site metadata
  - [x] Localized `generateMetadata` in `app/[locale]/layout.tsx` (title template, description, `metadataBase`)
  - [x] `manifest.ts`
  - [x] `robots.ts`, `sitemap.ts`
  - [ ] JSON-LD (`WebSite`, with social links as `sameAs`)
  - [x] Validate `content/*/metadata.json`
  - [ ] OpenGraph images
- [ ] Not-found pages are not server-rendered: `/en/nope` returns 404 with an empty `__next_error__` shell, and the
      localized not-found UI only renders client-side. Not caused by `partialPrefetching`, probably `cacheComponents`.
- [x] Playwright setup
  - [ ] Accessibility checks with `axe-core` and/or screen reader tests with `guidepup`
  - [ ] Mock upstream apis, once the app reads from one, to test error states: point the api base url at a small Bun mock
        server with an env variable, so it works for `next build` and at request time; `page.route()` for browser
        requests; unit tests for mapping errors to ui. Not `experimental.testProxy`: undocumented, no new features
        since 2024, only mocks request-time fetches (not prerendered or `"use cache"` data), and makes the server send
        requests to whatever port a test header names
- [ ] Browser e2e test for the not-found and error pages in `e2e/errors.test.ts` (curl only sees status codes, because
      of the client-rendered shell)
  - [ ] `/en/does-not-exist`: 404 with the localized `app/[locale]/not-found.tsx`, via the `[...rest]` catch-all
  - [ ] `/de/does-not-exist`: same, with the German message
  - [ ] Invalid locale, e.g. `/x.png`: 404 with `global-not-found.tsx`, not Next's default not-found page. Always renders
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
  - [ ] `href()` helper
  - [ ] `search-params.ts` convention
  - [ ] Derive the static pages in `app/sitemap.ts` from typed routes, or type check the list against `AppRoutes` from
        `.next/types/routes.d.ts`, so that new pages cannot be forgotten
- [ ] Clean up leftover `.gitignore` entries (`.pnpm-store/`, `/docker/.env`, `.turbo/`, ...)
