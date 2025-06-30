#!/bin/sh
# service.sh - YAUT module service
# runs any .sh script from /data/local/YAUT

YAUT_DIR="/data/local/YAUT"

# optional: create directory if missing
[ -d "$YAUT_DIR" ] || mkdir -p "$YAUT_DIR"

# execute all .sh scripts in that folder
for script in "$YAUT_DIR"/*.sh; do
    [ -f "$script" ] || continue
    chmod +x "$script"
    sh "$script"
done
