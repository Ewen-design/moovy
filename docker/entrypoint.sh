#!/bin/sh
# Supervises nginx (front) + SvelteKit Node server (back) in a single container.
# tini -g (group mode, set in ENTRYPOINT) forwards signals to the process group;
# this script exits as soon as either child dies so the orchestrator can restart.

set -eu
umask 027

: "${HOST:=127.0.0.1}"
: "${PORT:=3000}"
: "${ORIGIN:?ORIGIN is required (public URL the browser uses)}"

# Docker-secrets convention: *_FILE takes precedence over the plain env var,
# so the key never has to transit through `docker inspect`-visible config.
if [ -n "${TVDB_API_KEY_FILE:-}" ]; then
    if [ ! -r "$TVDB_API_KEY_FILE" ]; then
        echo "fatal: TVDB_API_KEY_FILE=$TVDB_API_KEY_FILE is not readable" >&2
        exit 1
    fi
    TVDB_API_KEY=$(cat "$TVDB_API_KEY_FILE")
fi
if [ -z "${TVDB_API_KEY:-}" ]; then
    echo "fatal: TVDB_API_KEY (or TVDB_API_KEY_FILE) is required" >&2
    exit 1
fi

export HOST PORT ORIGIN TVDB_API_KEY

node /app/build/index.js &
NODE_PID=$!

nginx -g 'daemon off;' &
NGINX_PID=$!

term() {
    kill -TERM "$NODE_PID"  2>/dev/null || true
    kill -TERM "$NGINX_PID" 2>/dev/null || true
}
trap term INT TERM

# Bare `wait -n` (busybox ash rejects the bash-only PID-list form): returns as
# soon as ANY child exits — Docker then restarts the whole container.
wait -n
EXIT=$?
term
wait || true
exit "$EXIT"
