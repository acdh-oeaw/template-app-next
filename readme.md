# template-app-next

Template for Next.js apps at ACDH, using Bun.

## Getting started

```sh
bun install
bun run dev
```

`bun install` also creates `.env.local` (see [Environment variables](#environment-variables)) and generates route types.

The `prepare` script sets `BUN_OPTIONS=--bun`, because `run.bun` in `bunfig.toml` doesn't apply to lifecycle scripts, so
`next typegen` would run with Node.js. Remove it once [oven-sh/bun#44584](https://github.com/oven-sh/bun/issues/44584)
is fixed.

## Environment variables

All environment variables are defined as Valibot schemas in [`configs/env.config.ts`](configs/env.config.ts), which is the
single source of truth.

- **Public variables** start with `NEXT_PUBLIC_`. They are validated when bundling, and inlined into client and server
  bundles at build time. Import them from `#/lib/env/public.ts`.
- **Server variables** are validated when first read, and all of them at server startup. Import them from
  `#/lib/env/server.ts`. A server variable that is read while prerendering must also be provided at build time.

Don't read `process.env` directly, the linter only allows it in `lib/env/`.

`bun run env:sync` adds missing variables to `.env.local`, with their descriptions and generated development values.
It never changes existing entries, unless you pass `--force`, which overwrites the whole file.

## End-to-end tests

End-to-end tests live in `e2e/` and run with Playwright in Chromium, Firefox and WebKit, against a production build
started by Playwright, or an already running server on port 3000. Set `PORT` to use a different port.

```sh
bun run test:e2e:install
bun run test:e2e
```

## Docker

[`.dockerignore`](.dockerignore) is an allowlist: when the build needs a new top-level file or folder, add it there.

Public and build-time variables are passed to `docker build` as a single `dotenv` secret. Secrets don't invalidate the
build cache, so the sha256 hash of the secret must be passed as `DOTENV_HASH` build arg, and the build fails if it
doesn't match.

```sh
docker build \
  --secret id=dotenv,src=.env.production.local \
  --build-arg DOTENV_HASH="$(sha256sum .env.production.local | cut -d " " -f 1)" \
  .
```

In GitHub Actions:

```yaml
- id: dotenv
  env:
    NEXT_PUBLIC_APP_BASE_URL: ${{ vars.NEXT_PUBLIC_APP_BASE_URL }}
    NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: ${{ secrets.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY }}
  run: |
    file="${{ runner.temp }}/dotenv"
    printf 'NEXT_PUBLIC_APP_BASE_URL=%s\nNEXT_SERVER_ACTIONS_ENCRYPTION_KEY=%s\n' \
      "$NEXT_PUBLIC_APP_BASE_URL" "$NEXT_SERVER_ACTIONS_ENCRYPTION_KEY" > "$file"
    echo "file=$file" >> "$GITHUB_OUTPUT"
    echo "hash=$(sha256sum "$file" | cut -d " " -f 1)" >> "$GITHUB_OUTPUT"

- uses: docker/build-push-action@v7
  with:
    secret-files: dotenv=${{ steps.dotenv.outputs.file }}
    build-args: DOTENV_HASH=${{ steps.dotenv.outputs.hash }}
```

Server variables that are only read at runtime are passed to the container, not to `docker build`.

## Upgrading Next.js

Public variables are inlined with a getter on `compiler.define` in [`next.config.ts`](next.config.ts), which relies on
two undocumented behaviours. After upgrading, check that:

- `bun run types:prepare` (`next typegen`) still succeeds without public variables, i.e. it doesn't read
  `compiler.define`
- editing a public variable in `.env.local` while `bun run dev` is running updates the page without a restart, i.e.
  `next dev` still reads `compiler.define` again when `.env*` files change

The `dev` script sets `BUN_OPTIONS=--no-env-file`, so that Next.js, not Bun, loads `.env` files and can reload them.
Remove it once [oven-sh/bun#47916](https://github.com/oven-sh/bun/issues/47916) is fixed.

## License

The source code is licensed under the [MIT license](license.txt). Logos are not covered by it: they belong to their
respective owners, and are listed in the [license notice](assets/images/logos/license.txt). This applies to the files in
[`assets/images/logos/`](assets/images/logos/), and to the icons in `app/` and `public/`.

Add logos to that folder, and import them from there rather than putting them in `public/`. When adding an icon to
`app/` or `public/`, add it to the license notice.

Fonts are downloaded at build time, are not part of this repository, and are licensed under the
[SIL Open Font License](https://openfontlicense.org).
