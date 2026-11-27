#!/usr/bin/env bash

set -euo pipefail
umask 077

: "${ENV_FILE:?}" "${IMAGE:?}" "${KUBE_CONFIG:?}" "${VALUES_FILE:?}"

action_path="${BASH_SOURCE[0]%/*}"

name="$(jq --raw-output --exit-status '.name' "$VALUES_FILE")"
namespace="$(jq --raw-output --exit-status '.namespace' "$VALUES_FILE")"

# only resources with this label are deleted when they are removed.
managed_by="deploy-action"
selector="app.kubernetes.io/instance=$name,app.kubernetes.io/managed-by=$managed_by"

directory="$(mktemp --directory)"
trap 'rm -rf -- "${directory:?}"' EXIT

export KUBECONFIG="$directory/kubeconfig"
base64 --decode <<< "$KUBE_CONFIG" > "$KUBECONFIG"
kubectl config set-context --current --namespace "$namespace" > /dev/null

# in a file, not in arguments, which other processes can read.
jq '{ env: . }' "$ENV_FILE" > "$directory/env.json"

manifests="$directory/manifests.yaml"
helm template "$name" "$action_path/chart" --namespace "$namespace" --values "$VALUES_FILE" \
  --values "$directory/env.json" --set-string "image=$IMAGE,managedBy=$managed_by" > "$manifests"

# server-side, because client-side apply stores the values of the secret in an annotation. conflicts are with changes
# from outside of the repository, like a rollback.
apply() {
  kubectl apply --server-side --force-conflicts --field-manager "$managed_by" "$@"
}

# rejects all changes when the cluster does not accept one of them.
applied="$(apply --filename "$manifests" --dry-run=server --output name | sort --unique)"

# the resources that deployments applied, so that those removed from the chart are deleted, of any kind. listing each
# kind by label would need permissions for each, and fail for api groups that the cluster does not serve. without
# secrets, which are deleted below, and persistent volume claims, because deleting them deletes their data.
inventory="$name-inventory"

write_inventory() {
  jq --null-input --arg name "$inventory" --arg instance "$name" --arg managed_by "$managed_by" --arg resources "$1" '{
    apiVersion: "v1",
    kind: "ConfigMap",
    metadata: {
      name: $name,
      labels: { "app.kubernetes.io/instance": $instance, "app.kubernetes.io/managed-by": $managed_by }
    },
    data: { resources: $resources }
  }' | apply --filename - > /dev/null
}

tracked="$(grep --invert-match --extended-regexp '^(secret|persistentvolumeclaim)/' <<< "$applied" || true)"
previous="$(kubectl get configmap "$inventory" --ignore-not-found --output 'jsonpath={.data.resources}')"

# before applying, so that a failed deployment does not lose track of the resources it added.
write_inventory "$(printf '%s\n%s\n' "$previous" "$tracked" | sed '/^$/d' | sort --unique)"

previous_revision="$(
  kubectl get deployment "$name" --ignore-not-found \
    --output 'jsonpath={.metadata.annotations.deployment\.kubernetes\.io/revision}'
)"

apply --filename "$manifests"

if ! kubectl rollout status "deployment/$name" --timeout 360s; then
  echo "::group::Pods"
  kubectl describe pods --selector "$selector" || true
  kubectl logs --selector "$selector" --all-containers --ignore-errors --prefix --tail 100 || true
  echo "::endgroup::"

  if [ -n "$previous_revision" ]; then
    echo "::error::Deployment failed, rolling back to revision $previous_revision"
    kubectl rollout undo "deployment/$name" --to-revision "$previous_revision"
    # not `rollout status`, which still sees the failure of the previous rollout.
    kubectl wait "deployment/$name" --for condition=Available --timeout 360s
  else
    echo "::error::First deployment failed, there is no revision to roll back to"
  fi

  exit 1
fi

removed="$(comm -23 <(sed '/^$/d' <<< "$previous" | sort --unique) <(printf '%s\n' "$tracked"))"
xargs --no-run-if-empty kubectl delete --ignore-not-found <<< "$removed"
write_inventory "$tracked"

# secrets of revisions in the history are kept for rollbacks.
used="$(
  kubectl get cronjobs,jobs,replicasets --selector "$selector" --output json |
    jq --raw-output '.. | objects | (.secretRef?.name, .secretKeyRef?.name, .secret?.secretName) // empty | "secret/" + .'
)"
kubectl get secrets --selector "$selector" --output name |
  { grep --invert-match --line-regexp --fixed-strings --file <(printf '%s\n%s\n' "$used" "$applied") || true; } |
  xargs --no-run-if-empty kubectl delete

if [ "$(jq --raw-output '.ingress.access' "$VALUES_FILE")" = public ]; then
  origin="$(jq --raw-output '.baseUrl | capture("^(?<origin>[a-z]+://[^/]+)").origin' "$VALUES_FILE")"
  path="$(
    kubectl get deployment "$name" \
      --output 'jsonpath={.spec.template.spec.containers[0].readinessProbe.httpGet.path}'
  )"

  "$action_path/check-url.sh" "$origin$path"

  for host in $(jq --raw-output '.ingress.tls.redirectHosts // [] | .[]' "$VALUES_FILE"); do
    "$action_path/check-url.sh" "https://$host$path" "$origin$path"
  done
fi
