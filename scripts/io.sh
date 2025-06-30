echo 0 > /sys/block/mmcblk1/queue/iostats 2>/dev/null;
for dev in /sys/block/sd[a-f]; do
    if [ -e "$dev/queue/scheduler" ]; then
        echo none > "$dev/queue/scheduler"
    fi
    if [ -e "$dev/queue/iostats" ]; then
        echo 0 > "$dev/queue/iostats"
    fi
done;
sysctl -w vm.swappiness=35
