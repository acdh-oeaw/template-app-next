#!/usr/bin/env bash

set -euo pipefail
umask 077

: "${BASE_URL:?}" "${ENV_FILE:?}" "${IMAGE:?}" "${KUBE_CONFIG:?}" "${NAME:?}" "${NAMESPACE:?}"

directory="$(mktemp --directory)"
trap 'rm -rf -- "${directory:?}"' EXIT

export KUBECONFIG="$directory/kubeconfig"
base64 --decode <<< "$KUBE_CONFIG" > "$KUBECONFIG"
kubectl config set-context --current --namespace "$NAMESPACE" > /dev/null

HOST="${BASE_URL#*://}"
HOST="${HOST%%/*}"
SERVICE_ID="$(jq --raw-output --exit-status '.SERVICE_ID' "$ENV_FILE")"

# only resources with this label are pruned.
MANAGED_BY="deploy-action"

# the name contains a hash of the content, so that changed values restart the pods, and a rollback restores the values.
hash="$(jq --compact-output --sort-keys . "$ENV_FILE" | sha256sum | cut -c 1-10)"
SECRET_NAME="$NAME-env-$hash"

export HOST IMAGE MANAGED_BY NAME SECRET_NAME SERVICE_ID

selector="app.kubernetes.io/instance=$NAME,app.kubernetes.io/managed-by=$MANAGED_BY"

jq --arg instance "$NAME" --arg managed_by "$MANAGED_BY" --arg name "$SECRET_NAME" '{
  apiVersion: "v1",
  kind: "Secret",
  metadata: {
    name: $name,
    labels: { "app.kubernetes.io/instance": $instance, "app.kubernetes.io/managed-by": $managed_by }
  },
  type: "Opaque",
  immutable: true,
  data: map_values(@base64)
}' "$ENV_FILE" > "$directory/secret.json"

manifests="$directory/manifests"
mkdir "$manifests"

for file in kubernetes/*.yaml; do
  # shellcheck disable=SC2016
  envsubst '$HOST $IMAGE $MANAGED_BY $NAME $SECRET_NAME $SERVICE_ID' < "$file" > "$manifests/${file##*/}"
done

if grep --line-number --recursive --fixed-strings "\${" "$manifests"; then
  echo "::error::Unknown placeholder in kubernetes/"
  exit 1
fi

# server-side, because client-side apply stores the values of the secret in an annotation. conflicts are with changes
# from outside of the repository, like a rollback.
apply() {
  kubectl apply --server-side --force-conflicts --field-manager "$MANAGED_BY" \
    --filename "$directory/secret.json" --filename "$manifests" "$@"
}

# rejects all changes when the cluster does not accept one of them.
apply --dry-run=server > /dev/null

previous_revision="$(
  kubectl get deployment "$NAME" --ignore-not-found \
    --output 'jsonpath={.metadata.annotations.deployment\.kubernetes\.io/revision}'
)"

apply

if ! kubectl rollout status "deployment/$NAME" --timeout 360s; then
  echo "::group::Pods"
  kubectl describe pods --selector "$selector" || true
  kubectl logs --selector "$selector" --all-containers --ignore-errors --prefix --tail 100 || true
  echo "::endgroup::"

  if [ -n "$previous_revision" ]; then
    echo "::error::Deployment failed, rolling back to revision $previous_revision"
    kubectl rollout undo "deployment/$NAME" --to-revision "$previous_revision"
    # not `rollout status`, which still sees the failure of the previous rollout.
    kubectl wait "deployment/$NAME" --for condition=Available --timeout 360s
  else
    echo "::error::First deployment failed, there is no revision to roll back to"
  fi

  exit 1
fi

# deletes the resources on stdin, except for the ones to keep.
prune() {
  { grep --invert-match --line-regexp --fixed-strings "$1" || true; } |
    xargs --no-run-if-empty kubectl delete
}

# without persistent volume claims, because that deletes their data.
applied="$(kubectl get --filename "$manifests" --output name)"
kubectl get cronjobs,deployments,ingresses,services --selector "$selector" --output name | prune "${applied:?}"

# secrets of revisions in the history are kept for rollbacks.
used="$(
  kubectl get cronjobs,jobs,replicasets --selector "$selector" --output json |
    jq --raw-output '.. | objects | .secretRef?.name // empty | "secret/" + .'
)"
kubectl get secrets --selector "$selector" --output name | prune "${used:?}"
