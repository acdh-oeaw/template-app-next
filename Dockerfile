# syntax=docker/dockerfile:1

ARG PNPM_VERSION=11.0.8
ARG BASE_IMAGE=oven/bun:alpine

# setup
# ---------------------------------------------------------------------------------------------------------------------

FROM ${BASE_IMAGE} AS setup

ARG PNPM_VERSION
ARG TARGETARCH

RUN apk add --no-cache ca-certificates curl tar

RUN case "${TARGETARCH}" in \
      amd64) pnpm_arch="x64" ;; \
      arm64) pnpm_arch="arm64" ;; \
      *) echo "Unsupported target architecture: ${TARGETARCH}" >&2; exit 1 ;; \
    esac \
    && mkdir -p /opt/pnpm \
    && curl -fsSL "https://github.com/pnpm/pnpm/releases/download/v${PNPM_VERSION}/pnpm-linux-${pnpm_arch}-musl.tar.gz" \
      | tar -xz -C /opt/pnpm

# base
# ---------------------------------------------------------------------------------------------------------------------

FROM ${BASE_IMAGE} AS base

ENV PNPM_HOME=/pnpm
ENV PATH="${PNPM_HOME}/bin:${PATH}"

RUN mkdir -p "${PNPM_HOME}/bin"

COPY --from=setup /opt/pnpm /opt/pnpm
RUN ln -sf /opt/pnpm/pnpm /usr/local/bin/pnpm

# build
# ---------------------------------------------------------------------------------------------------------------------

FROM base AS build

RUN pnpm fetch

COPY . .

RUN pnpm install --frozen-lockfile --offline

ENV BUILD_MODE=standalone
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_APP_BASE_URL
ARG NEXT_PUBLIC_BOTS
ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
ARG NEXT_PUBLIC_IMPRINT_SERVICE_BASE_URL
ARG NEXT_PUBLIC_MATOMO_BASE_URL
ARG NEXT_PUBLIC_MATOMO_ID
ARG NEXT_PUBLIC_REDMINE_ID

# to mount secrets which need to be available at build time
# @see {@link https://docs.docker.com/build/building/secrets/}
RUN pnpm run build

# serve
# ---------------------------------------------------------------------------------------------------------------------

FROM base AS serve

USER bun

ENV NODE_ENV=production

COPY --from=build --chown=bun:bun /app/next.config.ts ./
COPY --from=build --chown=bun:bun /app/public ./public
COPY --from=build --chown=bun:bun /app/.next/standalone ./
COPY --from=build --chown=bun:bun /app/.next/static ./.next/static

EXPOSE 3000

CMD ["bun", "server.js"]
