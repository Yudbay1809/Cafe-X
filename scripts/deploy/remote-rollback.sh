#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="$1"
HEALTH_URL="$2"

CURRENT_LINK="${DEPLOY_PATH}/current"
PREVIOUS_LINK="${DEPLOY_PATH}/previous"

if [[ ! -L "${PREVIOUS_LINK}" ]]; then
  echo "No previous release link available"
  exit 1
fi

PREV_TARGET="$(readlink "${PREVIOUS_LINK}")"
rm -f "${CURRENT_LINK}"
ln -s "${PREV_TARGET}" "${CURRENT_LINK}"

set +e
curl -fsS --max-time 10 "${HEALTH_URL}" >/dev/null
HEALTH_CODE=$?
set -e

if [[ ${HEALTH_CODE} -ne 0 ]]; then
  echo "Rollback health check failed"
  exit 1
fi

echo "Rollback success"
