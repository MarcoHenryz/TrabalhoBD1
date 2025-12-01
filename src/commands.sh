#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONT_DIR="${ROOT_DIR}/front"
PID_FILE="${ROOT_DIR}/.bun_dev.pid"
LOG_FILE="${ROOT_DIR}/bun-dev.log"

if command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  COMPOSE_CMD=(docker compose)
fi

start_backend() {
  echo "Starting backend containers..."
  "${COMPOSE_CMD[@]}" -f "${ROOT_DIR}/docker-compose.yml" up -d
}

start_frontend() {
  if ! command -v bun >/dev/null 2>&1; then
    echo "bun is not installed or not on PATH."
    exit 1
  fi

  if [ -f "${PID_FILE}" ]; then
    existing_pid="$(cat "${PID_FILE}")"
    if kill -0 "${existing_pid}" >/dev/null 2>&1; then
      echo "Frontend already running (PID ${existing_pid})."
      return
    else
      rm -f "${PID_FILE}"
    fi
  fi

  echo "Starting frontend (bun run dev)..."
  (
    cd "${FRONT_DIR}"
    nohup bun run dev >> "${LOG_FILE}" 2>&1 &
    echo $! > "${PID_FILE}"
  )
}

stop_backend() {
  echo "Stopping backend containers..."
  "${COMPOSE_CMD[@]}" -f "${ROOT_DIR}/docker-compose.yml" down
}

stop_frontend() {
  if [ ! -f "${PID_FILE}" ]; then
    echo "Frontend is not running (no PID file)."
    return
  fi

  pid_to_kill="$(cat "${PID_FILE}")"
  if kill -0 "${pid_to_kill}" >/dev/null 2>&1; then
    echo "Stopping frontend (PID ${pid_to_kill})..."
    kill "${pid_to_kill}" >/dev/null 2>&1 || true
    wait "${pid_to_kill}" 2>/dev/null || true
  else
    echo "Frontend PID ${pid_to_kill} is not active."
  fi

  rm -f "${PID_FILE}"
}

run_all() {
  start_backend
  start_frontend
}

stop_all() {
  stop_frontend
  stop_backend
}

populate_data() {
  echo "Building backend image to ensure latest seed code..."
  "${COMPOSE_CMD[@]}" -f "${ROOT_DIR}/docker-compose.yml" build api

  echo "Starting database (db service)..."
  "${COMPOSE_CMD[@]}" -f "${ROOT_DIR}/docker-compose.yml" up -d db

  echo "Running seed script (com.uel.script.PopularBanco)..."
  "${COMPOSE_CMD[@]}" -f "${ROOT_DIR}/docker-compose.yml" run --rm --entrypoint java api -cp /app/app.jar com.uel.script.PopularBanco
}

reset_all() {
  echo "Resetting everything (stopping front, removing containers/volumes, rebuilding)..."
  stop_frontend
  echo "Stopping backend containers and removing volumes..."
  "${COMPOSE_CMD[@]}" -f "${ROOT_DIR}/docker-compose.yml" down -v || true
  echo "Rebuilding and starting backend..."
  "${COMPOSE_CMD[@]}" -f "${ROOT_DIR}/docker-compose.yml" up --build -d
  echo "Restarting frontend..."
  start_frontend
}

usage() {
  cat <<EOF
Usage: $(basename "$0") [run|stop|reset|populate]
  run   - start backend containers and frontend dev server
  stop  - stop backend containers and frontend dev server
  reset - stop everything and start again
  populate - rebuilds the api image and runs the seed script to populate the database
EOF
}

case "${1-}" in
  run) run_all ;;
  stop) stop_all ;;
  reset) reset_all ;;
  populate) populate_data ;;
  *) usage; exit 1 ;;
esac
