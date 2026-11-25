#!/usr/bin/env bash

# requests the app like a visitor, because ready pods don't mean that the ingress works. for example, Traefik responds
# with 404 when a middleware does not exist.

set -euo pipefail

: "${URL:?}"

# the first certificate can take some minutes.
timeout="${TIMEOUT:-300}"
interval="${INTERVAL:-5}"

while true; do
  # without `--location`, because a health check does not redirect.
  if result="$(curl --silent --show-error --max-time 10 --output /dev/null --write-out '%{http_code}' "$URL" 2>&1)" &&
    [ "$result" = "200" ]; then
    echo "$URL responds"
    exit 0
  fi

  if [ "$SECONDS" -ge "$timeout" ]; then
    break
  fi

  sleep "$interval"
done

echo "::error::The deployment is ready, but $URL does not respond with 200: ${result//$'\n'/ }. It is not rolled back, because a rollback does not include the ingress."
exit 1
