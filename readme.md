# app template

template repository for next.js apps.

## how to run

prerequisites:

- [Node.js v20](https://nodejs.org/en/download)
- [pnpm](https://pnpm.io/installation)

set required environment variables in `.env.local`:

```bash
cp .env.local.example .env.local
```

adjust environment variables in `.github/workflows/validate.yml` and
`.github/workflows/build-deploy.yml`.

install dependencies:

```bash
pnpm install
```

run a development server on [http://localhost:3000](http://localhost:3000):

```bash
pnpm run dev
```

## how to deploy

set `KUBE_NAMESPACE` repository variable to the acdh-ch kubernetes namespace to deploy to. every git
push to the `main` branch will trigger a deployment if the validation pipeline passes.
