document.addEventListener("DOMContentLoaded", async () => {
    const output = document.getElementById("output");
    const governorControls = document.getElementById("governor-controls");
    const frequencyControls = document.getElementById("frequency-controls");

    try {
        const policyList = await runShell("ls /sys/devices/system/cpu/cpufreq | grep policy");
        const policies = policyList.trim().split("\n");

        for (let policy of policies) {
            const policyNum = policy.replace("policy", "");
            const policyPath = `/sys/devices/system/cpu/cpufreq/${policy}`;

            // get available governors
            const rawGovs = await runShell(`cat ${policyPath}/scaling_available_governors`);
            const govs = rawGovs.trim().split(" ");
            const currentGov = await runShell(`cat ${policyPath}/scaling_governor`);

            const govDiv = document.createElement("div");
            govDiv.className = "governor-block";
            govDiv.innerHTML = `
                <label for="gov-${policyNum}">Policy ${policyNum} Governor:</label>
                <select id="gov-${policyNum}">
                    ${govs.map(g => `<option value="${g}" ${g===currentGov.trim() ? "selected" : ""}>${g}</option>`).join("")}
                </select>
            `;
            governorControls.appendChild(govDiv);

            document.getElementById(`gov-${policyNum}`).addEventListener("change", async (e) => {
                try {
                    await runShell(`echo ${e.target.value} > ${policyPath}/scaling_governor`);
                    output.textContent = `Governor for policy ${policyNum} set to ${e.target.value}`;
                } catch (err) {
                    output.textContent = `Governor change failed: ${err}`;
                }
            });

            // get available frequencies
            const rawFreqs = await runShell(`cat ${policyPath}/scaling_available_frequencies`);
            const freqs = rawFreqs.trim().split(" ").map(f => parseInt(f,10));
            const curFreq = parseInt(await runShell(`cat ${policyPath}/scaling_cur_freq`),10);
            const curMinFreq = parseInt(await runShell(`cat ${policyPath}/scaling_min_freq`),10);
            const curMaxFreq = parseInt(await runShell(`cat ${policyPath}/scaling_max_freq`),10);

            const freqDiv = document.createElement("div");
            freqDiv.className = "freq-block";
            freqDiv.innerHTML = `
                <label for="min-freq-${policyNum}">Policy ${policyNum} Min Frequency:</label>
                <select id="min-freq-${policyNum}">
                    ${freqs.map(f => {
                        const mhz = Math.round(f/1000);
                        return `<option value="${f}" ${f===curMinFreq ? "selected" : ""}>${mhz} MHz</option>`;
                    }).join("")}
                </select>
                <br/>
                <label for="max-freq-${policyNum}">Policy ${policyNum} Max Frequency:</label>
                <select id="max-freq-${policyNum}">
                    ${freqs.map(f => {
                        const mhz = Math.round(f/1000);
                        return `<option value="${f}" ${f===curMaxFreq ? "selected" : ""}>${mhz} MHz</option>`;
                    }).join("")}
                </select>
                <p>Current Frequency: ${Math.round(curFreq/1000)} MHz</p>
            `;
            frequencyControls.appendChild(freqDiv);

            // add change handlers
            document.getElementById(`min-freq-${policyNum}`).addEventListener("change", async (e) => {
                try {
                    await runShell(`echo ${e.target.value} > ${policyPath}/scaling_min_freq`);
                    output.textContent = `Min freq for policy ${policyNum} set to ${Math.round(e.target.value/1000)} MHz`;
                } catch (err) {
                    output.textContent = `Min freq change failed: ${err}`;
                }
            });
            document.getElementById(`max-freq-${policyNum}`).addEventListener("change", async (e) => {
                try {
                    await runShell(`echo ${e.target.value} > ${policyPath}/scaling_max_freq`);
                    output.textContent = `Max freq for policy ${policyNum} set to ${Math.round(e.target.value/1000)} MHz`;
                } catch (err) {
                    output.textContent = `Max freq change failed: ${err}`;
                }
            });
        }
    } catch (e) {
        output.textContent = `Error loading CPU data: ${e}`;
    }
});

document.getElementById("walt-custom-btn").addEventListener("click", async () => {
  try {
    await runShell(`
      for cpu in /sys/devices/system/cpu/cpu[0-9]*; do
        policy="$cpu/cpufreq"
        if [ -d "$policy" ]; then
          echo walt > "$policy/scaling_governor"
        fi
      done
      sleep 2
      for cpu in /sys/devices/system/cpu/cpu[0-9]*; do
        policy="$cpu/cpufreq"
        if [ -d "$policy" ]; then
          echo 0 > "$policy/walt/hispeed_freq"
          echo 95 > "$policy/walt/hispeed_load"
          echo 0 > "$policy/walt/rtg_boost_freq"
          echo 3600 > "$policy/walt/up_rate_limit_us"
        fi
      done
    `);
    document.getElementById("output").textContent = "Governor set to walt and custom WALT parameters applied.";
  } catch (e) {
    document.getElementById("output").textContent = `WALT apply failed: ${e}`;
  }
});