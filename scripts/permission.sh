for policy in /sys/devices/system/cpu/cpufreq/policy*; do
    chmod 644 "$policy/"* 2>/dev/null
done