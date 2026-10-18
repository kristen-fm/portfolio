#!/bin/sh
# Start the local dev environment: the static file server and the src/ watcher
# together, in one terminal. Ctrl+C stops both.
#
#   ./dev.sh          # serve on port 8000
#   ./dev.sh 8080     # serve on a different port
#
# The watcher rebuilds generated HTML on every save under src/; the server
# serves those generated files. Open the URL printed below and refresh after a
# save to see changes.
set -e
cd "$(dirname "$0")"

PORT="${1:-8000}"

# Kill both child processes when this script exits for any reason (Ctrl+C,
# error, terminal close), so no orphaned server keeps holding the port.
cleanup() {
  trap - INT TERM EXIT
  [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true
  [ -n "$WATCH_PID" ] && kill "$WATCH_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

python3 -m http.server "$PORT" >/dev/null 2>&1 &
SERVER_PID=$!

node watch.js &
WATCH_PID=$!

echo "Serving at http://localhost:$PORT/  (Ctrl+C to stop)"

# Wait for either child to exit; cleanup() then stops the other.
wait
