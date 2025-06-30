#!/system/bin/sh
sleep 10
MODDIR=${0%/*}
INFO=/data/adb/modules/.YAUT-files
MODID=YAUT
LIBDIR=/system
MODPATH=$MODDIR
YAUT_DIR="/data/local/YAUT"
for script in "$YAUT_DIR"/*.sh; do
    [ -f "$script" ] || continue
    chmod +x "$script"
    sh "$script"
done

