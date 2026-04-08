#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="$1"
RELEASE_NAME="$2"
HEALTH_URL="$3"

if [[ -z "${DEPLOY_PATH}" || -z "${RELEASE_NAME}" || -z "${HEALTH_URL}" ]]; then
  echo "Usage: remote-release.sh <deploy_path> <release_name> <health_url>"
  exit 1
fi

RELEASES_DIR="${DEPLOY_PATH}/releases"
CURRENT_LINK="${DEPLOY_PATH}/current"
PREVIOUS_LINK="${DEPLOY_PATH}/previous"
TARGET_RELEASE="${RELEASES_DIR}/${RELEASE_NAME}"

mkdir -p "${RELEASES_DIR}"
mkdir -p "${TARGET_RELEASE}"

if [[ -L "${CURRENT_LINK}" ]]; then
  CURRENT_TARGET="$(readlink "${CURRENT_LINK}")"
  rm -f "${PREVIOUS_LINK}"
  ln -s "${CURRENT_TARGET}" "${PREVIOUS_LINK}"
fi

rm -f "${CURRENT_LINK}"
ln -s "${TARGET_RELEASE}" "${CURRENT_LINK}"

cd "${CURRENT_LINK}/backend"
if [[ -f "composer.json" ]]; then
  composer install --no-interaction --prefer-dist --no-dev --optimize-autoloader
fi
if [[ -f "artisan" ]]; then
  php artisan migrate --force
  php artisan config:cache || true
  php artisan route:cache || true
fi

set +e
curl -fsS --max-time 10 "${HEALTH_URL}" >/dev/null
HEALTH_CODE=$?
set -e

if [[ ${HEALTH_CODE} -ne 0 ]]; then
  echo "Health check failed, rollback to previous release"
  if [[ -L "${PREVIOUS_LINK}" ]]; then
    PREV_TARGET="$(readlink "${PREVIOUS_LINK}")"
    rm -f "${CURRENT_LINK}"
    ln -s "${PREV_TARGET}" "${CURRENT_LINK}"
  fi
  exit 1
fi

echo "Deploy success: ${RELEASE_NAME}"
