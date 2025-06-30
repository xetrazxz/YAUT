for cpu in /sys/devices/system/cpu/cpu[0-9]*; do
    policy="$cpu/cpufreq"
    if [ -d "$policy" ]; then
        echo walt > "$policy/scaling_governor"
    fi
done

sleep 4
for cpu in /sys/devices/system/cpu/cpu[0-9]*; do
    policy="$cpu/cpufreq"
    if [ -d "$policy" ]; then
        chmod 644 "$policy/walt/"*
    fi
done

for cpu in /sys/devices/system/cpu/cpu[0-9]*; do
    policy="$cpu/cpufreq"
    if [ -d "$policy" ]; then
        echo 0 > "$policy/walt/hispeed_freq"
        echo 95 > "$policy/walt/hispeed_load"
        echo 0 > "$policy/walt/rtg_boost_freq"
        echo 3600 > "$policy/walt/up_rate_limit_us"
    fi
done