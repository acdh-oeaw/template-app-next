# TODO

## Next up

- [ ] Site metadata
  - [x] Localized `generateMetadata` in `app/[locale]/layout.tsx` (title template, description, `metadataBase`)
  - [x] `manifest.ts`
  - [ ] `robots.ts`, `sitemap.ts`
  - [ ] JSON-LD (`WebSite`, with social links as `sameAs`)
  - [ ] Validate `content/*/metadata.json` once there is a validation library (see environment variables)
  - [ ] OpenGraph images
- [ ] Not-found pages are not server-rendered: `/en/nope` returns 404 with an empty `__next_error__` shell, and the
      localized not-found UI only renders client-side. Not caused by `partialPrefetching`, probably `cacheComponents`.
- [ ] Playwright setup
  - [ ] Accessibility checks with `axe-core` and/or screen reader tests with `guidepup`
- [ ] Browser e2e test for the not-found pages (curl only sees status codes, because of the client-rendered shell)
  - [ ] `/en/does-not-exist`: 404 with the localized `app/[locale]/not-found.tsx`, via the `[...rest]` catch-all
  - [ ] Invalid locale, e.g. `/x.png`: 404 with `global-not-found.tsx`, not Next's default not-found page
  - [ ] `/en-GB`: redirected to `/en/en-GB` by the proxy, then 404
- [ ] Browser e2e test for canonical urls: content must only be reachable under the language prefix (`/en/*`), never
      under the internal locale (`/en-GB/*`) that the proxy rewrites to. Currently `/en-GB/*` redirects to
      `/en/en-GB/*`, also for RSC requests. Pages using `createPageMetadata()` emit a matching `<link rel="canonical">`.

## Missing

- [x] README
  - [x] Point to `configs/env.config.ts` as the place where environment variables are defined, and to `bun run env:sync`
- [ ] CI workflows (validate, build and deploy)
  - [ ] Pass public and build-time environment variables to `docker build` as the `dotenv` secret, and its sha256 hash as the `DOTENV_HASH` build arg
  - [ ] Explore deploying with `kubectl` and/or `helm` directly, instead of the reusable
        `acdh-oeaw/gl-autodevops-minimal-port` workflow
- [ ] `test` script and test setup
- [ ] App shell: layout, header, footer, navigation, locale switcher, color scheme switcher
  - [ ] Footer: hardcoded links to imprint and accessibility declaration, social links from `getSiteMetadata()`
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
- [ ] Clean up leftover `.gitignore` entries (`.pnpm-store/`, `/docker/.env`, `.turbo/`, ...)
