#!/system/bin/sh
MODDIR=${0%/*}
MODPATH=$MODDIR
#
sleep 10
sh /data/local/YAUT/scripts/permision.sh
#
sleep 10
YAUT_DIR="/data/local/YAUT/scripts/boot"
for script in "$YAUT_DIR"/*.sh; do
    chmod +x "$script"
    sh "$script"
done