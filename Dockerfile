# syntax=docker/dockerfile:1-labs
# labs version is needed for `COPY --exclude`.
# @see https://docs.docker.com/reference/dockerfile/#copy---exclude

# build
FROM node:22-slim AS build

RUN corepack enable

RUN mkdir /app && chown -R node:node /app
WORKDIR /app

USER node

COPY --chown=node:node .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ./patches ./patches

ENV SKIP_INSTALL_SIMPLE_GIT_HOOKS=1

RUN pnpm fetch

COPY --chown=node:node ./ ./

ARG NEXT_PUBLIC_APP_BASE_URL
ARG NEXT_PUBLIC_BOTS
ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
ARG NEXT_PUBLIC_IMPRINT_SERVICE_BASE_URL
ARG NEXT_PUBLIC_MATOMO_BASE_URL
ARG NEXT_PUBLIC_MATOMO_ID
ARG NEXT_PUBLIC_REDMINE_ID

# disable validation for runtime environment variables
ENV ENV_VALIDATION=public

RUN pnpm install --frozen-lockfile --offline

ENV BUILD_MODE=standalone
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# to mount secrets which need to be available at build time
# @see https://docs.docker.com/build/building/secrets/
RUN pnpm run build

# serve
FROM node:22-slim AS serve

# @see https://sharp.pixelplumbing.com/install/#linux-memory-allocator
RUN apt-get update && apt-get install --force-yes -yy \
  libjemalloc1 \
  && rm -rf /var/lib/apt/lists/*
ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.1

RUN mkdir /app && chown -R node:node /app
WORKDIR /app

USER node

COPY --from=build --chown=node:node /app/next.config.ts ./
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

# ensure folder is owned by node:node when mounted as volume
RUN mkdir -p /app/.next/cache/images

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server.js"]
