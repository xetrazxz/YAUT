#!/system/bin/sh
MODDIR=${0%/*}
MODPATH=$MODDIR
sleep 20
YAUT_DIR="/data/local/YAUT/scripts/boot"
for script in "$YAUT_DIR"/*.sh; do
    [ -f "$script" ] || continue
    chmod +x "$script"
    sh "$script"
done

