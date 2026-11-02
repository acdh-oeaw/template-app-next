# syntax=docker/dockerfile:1

# using alpine base image to avoid `sharp` memory leaks.
# @see https://sharp.pixelplumbing.com/install#linux-memory-allocator

# build
FROM oven/bun:1.4.4-alpine AS build

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

# to mount secrets which need to be available at build time
# @see https://docs.docker.com/build/building/secrets/
RUN bun run build

# serve
FROM oven/bun:1.4.4-alpine AS serve

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
