# syntax=docker/dockerfile:1

# using alpine base image to avoid `sharp` memory leaks.
# @see https://sharp.pixelplumbing.com/install#linux-memory-allocator

# no default, so that `devEngines` in `package.json` stays the single source of truth for the version.
ARG BUN_VERSION

# build
FROM oven/bun:${BUN_VERSION:?required}-alpine AS build

WORKDIR /app

ENV CI=true

COPY package.json bun.lock ./
COPY ./patches ./patches

# lifecycle scripts are skipped because the `prepare` script needs the full source tree.
RUN --mount=type=cache,target=/root/.bun/install/cache \
	bun install --frozen-lockfile --ignore-scripts

COPY ./ ./

ENV BUILD_MODE=standalone
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# public and build-time environment variables are passed as a single `.env` file secret.
# @see https://docs.docker.com/build/building/secrets/
# secrets do not invalidate the build cache, so the sha256 hash of the secret is passed as `DOTENV_HASH` build arg.
# @see https://github.com/moby/buildkit/issues/2547#issuecomment-1005052682
ARG DOTENV_HASH
# enables version skew protection.
# @see https://nextjs.org/docs/app/guides/self-hosting#version-skew
ARG NEXT_DEPLOYMENT_ID
ENV NEXT_DEPLOYMENT_ID="${NEXT_DEPLOYMENT_ID:?build arg is required}"
RUN --mount=type=secret,id=dotenv,target=/app/.env.production.local,required=true \
	echo "${DOTENV_HASH:?build arg is required}  .env.production.local" | sha256sum -c - \
	&& bun run build

# serve
FROM oven/bun:${BUN_VERSION}-alpine AS serve

WORKDIR /app

COPY --from=build --chown=bun:bun /app/public ./public
COPY --from=build --chown=bun:bun /app/.next/standalone ./
COPY --from=build --chown=bun:bun /app/.next/static ./.next/static

# ensure folder is owned by bun:bun when mounted as volume
RUN mkdir -p /app/.next/cache/images && chown -R bun:bun /app/.next/cache

USER bun

ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "server.js"]
