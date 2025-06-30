#!/system/bin/sh
# get device codename
codename=$(getprop ro.product.device)
output_file="/sdcard/YAUT_REQ_${codename}.prop"

echo "Getting Device Data"
echo "Wait Atleast a Min"
echo "Output Will Be Saved at $output_file"


# redirect all output to that file
exec >"$output_file" 2>&1 

separator="============================================================"

echo "$separator"
echo "                      DEVICE INFO"
echo "$separator"

model=$(getprop ro.product.model)
manufacturer=$(getprop ro.product.manufacturer)
brand=$(getprop ro.product.brand)
android_version=$(getprop ro.build.version.release)
build_id=$(getprop ro.build.id)

printf "Brand        : %s\n" "$brand"
printf "Manufacturer : %s\n" "$manufacturer"
printf "Model        : %s\n" "$model"
printf "Codename     : %s\n" "$codename"
printf "Android      : %s\n" "$android_version"
printf "Build ID     : %s\n" "$build_id"

echo
echo "$separator"
echo "                 CPU GOVERNORS & FREQUENCIES"
echo "$separator"

for cpu in /sys/devices/system/cpu/cpu[0-9]*; do
    n=$(basename $cpu)
    gov_path="$cpu/cpufreq/scaling_available_governors"
    freq_path="$cpu/cpufreq/scaling_available_frequencies"

    if [ -f "$gov_path" ]; then
        printf "%s-governors       : %s\n" "$n" "$(cat $gov_path)"
    fi
    if [ -f "$freq_path" ]; then
        printf "%s-available-freqs : %s kHz\n" "$n" "$(cat $freq_path)"
    fi
done

echo
echo "$separator"
echo "               CPU FREQUENCY POLICIES (CLUSTERS)"
echo "$separator"

for policy in /sys/devices/system/cpu/cpufreq/policy*; do
    polname=$(basename $policy)
    related=$(cat "$policy/related_cpus" 2>/dev/null)
    freqs=$(cat "$policy/scaling_available_frequencies" 2>/dev/null)
    cur_freq=$(cat "$policy/scaling_cur_freq" 2>/dev/null)

    printf "%s\n" "$polname"
    printf "  RelatedCPUs       : %s\n" "$related"
    printf "  Availablefreqs    : %s kHz\n" "$freqs"
    printf "  Currentfrequency  : %s kHz\n" "$cur_freq"
done

echo
echo "$separator"
echo "              BATTERY CURRENT AND VOLTAGE LIMITS"
echo "$separator"

charge_path="/sys/class/qcom-battery"
if [ -d "$charge_path" ]; then
    max_current=$(cat "$charge_path/constant_charge_current_max" 2>/dev/null)
    min_current=$(cat "$charge_path/constant_charge_current_min" 2>/dev/null)
    printf "MaxChargeCurrent : %s uA\n" "$max_current"
    printf "MinChargeCurrent : %s uA\n" "$min_current"
else
    echo "qcom-battery data not found at $charge_path"
fi

voltage_max_path="/sys/class/power_supply/battery/voltage_max"
if [ -f "$voltage_max_path" ]; then
    voltage_max=$(cat "$voltage_max_path")
    printf "MaxBatteryVoltage: %s uV\n" "$voltage_max"
else
    echo "voltage_max not found at $voltage_max_path"
fi

echo
echo "$separator"
echo "                     I/O SCHEDULERS"
echo "$separator"

for blk in /sys/block/*/queue/scheduler; do
    dev=$(echo $blk | cut -d/ -f4)
    sched=$(cat $blk)
    printf "%s : %s\n" "$dev" "$sched"
done

echo
echo "$separator"
echo "                       VM TUNABLES"
echo "$separator"

printf "swappiness         : %s\n" "$(cat /proc/sys/vm/swappiness)"
printf "vfs_cache_pressure : %s\n" "$(cat /proc/sys/vm/vfs_cache_pressure)"

echo
echo "$separator"
echo "                   BLOCK DEVICE INFO"
echo "$separator"

for blk in /sys/block/*; do
    dev=$(basename $blk)
    ra=$(cat $blk/queue/read_ahead_kb 2>/dev/null)
    rot=$(cat $blk/queue/rotational 2>/dev/null)
    printf "%s\n" "$dev"
    printf "  read_ahead_kb : %s\n" "$ra"
    printf "  rotational    : %s\n" "$rot"
done

echo
echo "$separator"
echo "                  DATA COLLECTION COMPLETE"
echo "$separator"