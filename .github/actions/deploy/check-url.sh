#!/usr/bin/env bash

# requests the app like a visitor, because ready pods don't mean that the ingress works. for example, Traefik responds
# with 404 when a middleware does not exist.

set -euo pipefail

# usage: check-url.sh <url> [<location>], where a location expects a permanent redirect to it, instead of 200.
url="${1:?}"
location="${2:-}"
expected="${location:+301 $location}"
expected="${expected:-200 }"

# the first certificate can take some minutes.
timeout="${TIMEOUT:-300}"
interval="${INTERVAL:-5}"

while true; do
  # without `--location`, so that a redirect is reported instead of followed.
  if result="$(curl --silent --show-error --max-time 10 --output /dev/null --write-out '%{http_code} %{redirect_url}' "$url" 2>&1)" &&
    [ "$result" = "$expected" ]; then
    echo "$url responds with ${expected% }"
    exit 0
  fi

  if [ "$SECONDS" -ge "$timeout" ]; then
    break
  fi

  sleep "$interval"
done

echo "::error::The deployment is ready, but $url does not respond with ${expected% }: ${result//$'\n'/ }. It is not rolled back, because a rollback does not include the ingress."
exit 1
