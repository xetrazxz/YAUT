document.addEventListener("DOMContentLoaded", async () => {
  const output = document.getElementById("output");
  const governorControls = document.getElementById("governor-controls");
  const frequencyControls = document.getElementById("frequency-controls");
  const scriptdir = "/data/local/YAUT/scripts";

  try {
    // find CPU policies
    const policyList = await runShell("ls /sys/devices/system/cpu/cpufreq | grep policy");
    const policies = policyList.trim().split("\n");

    for (const policy of policies) {
      const policyNum = policy.replace("policy", "");
      const policyPath = `/sys/devices/system/cpu/cpufreq/${policy}`;

      // governors
      const rawGovs = await runShell(`cat ${policyPath}/scaling_available_governors`);
      const govs = rawGovs.trim().split(" ");
      const currentGov = (await runShell(`cat ${policyPath}/scaling_governor`)).trim();

      const govDiv = document.createElement("div");
      govDiv.className = "governor-block";
      govDiv.innerHTML = `
        <label for="gov-${policyNum}">Policy ${policyNum} Governor:</label>
        <select id="gov-${policyNum}">
          ${govs.map(g => `<option value="${g}" ${g === currentGov ? "selected" : ""}>${g}</option>`).join("")}
        </select>
      `;
      governorControls.appendChild(govDiv);

      document.getElementById(`gov-${policyNum}`).addEventListener("change", async (e) => {
        try {
          await runShell(`echo ${e.target.value} > "${policyPath}/scaling_governor"`);
          output.textContent = `Governor for policy ${policyNum} set to ${e.target.value}`;
        } catch (err) {
          output.textContent = `Governor change failed: ${err}`;
        }
      });

      // frequencies
      const rawFreqs = await runShell(`cat ${policyPath}/scaling_available_frequencies`);
      const freqs = rawFreqs.trim().split(" ").map(f => parseInt(f, 10));
      const curFreq = parseInt(await runShell(`cat ${policyPath}/scaling_cur_freq`), 10);
      const curMinFreq = parseInt(await runShell(`cat ${policyPath}/scaling_min_freq`), 10);
      const curMaxFreq = parseInt(await runShell(`cat ${policyPath}/scaling_max_freq`), 10);

      const freqDiv = document.createElement("div");
      freqDiv.className = "freq-block";
      freqDiv.innerHTML = `
        <label for="min-freq-${policyNum}">Policy ${policyNum} Min Frequency:</label>
        <select id="min-freq-${policyNum}">
          ${freqs.map(f => {
            const mhz = Math.round(f / 1000);
            return `<option value="${f}" ${f === curMinFreq ? "selected" : ""}>${mhz} MHz</option>`;
          }).join("")}
        </select>
        <br/>
        <label for="max-freq-${policyNum}">Policy ${policyNum} Max Frequency:</label>
        <select id="max-freq-${policyNum}">
          ${freqs.map(f => {
            const mhz = Math.round(f / 1000);
            return `<option value="${f}" ${f === curMaxFreq ? "selected" : ""}>${mhz} MHz</option>`;
          }).join("")}
        </select>
        <p>Current Frequency: ${Math.round(curFreq / 1000)} MHz</p>
      `;
      frequencyControls.appendChild(freqDiv);

      document.getElementById(`min-freq-${policyNum}`).addEventListener("change", async (e) => {
        try {
          await runShell(`echo ${e.target.value} > "${policyPath}/scaling_min_freq"`);
          output.textContent = `Min freq for policy ${policyNum} set to ${Math.round(e.target.value / 1000)} MHz`;
        } catch (err) {
          output.textContent = `Min freq change failed: ${err}`;
        }
      });

      document.getElementById(`max-freq-${policyNum}`).addEventListener("change", async (e) => {
        try {
          await runShell(`echo ${e.target.value} > "${policyPath}/scaling_max_freq"`);
          output.textContent = `Max freq for policy ${policyNum} set to ${Math.round(e.target.value / 1000)} MHz`;
        } catch (err) {
          output.textContent = `Max freq change failed: ${err}`;
        }
      });
    }

    // walt-custom button
    const waltBtn = document.getElementById("walt-custom-btn");
    waltBtn.addEventListener("click", async () => {
      try {
        await runShell(`sh "${scriptdir}/waltp.sh"`);
        output.textContent = "Custom WALT parameters applied.";
      } catch (err) {
        output.textContent = `WALT apply failed: ${err}`;
      }
    });

    // boot apply button
    const bootsetBtn = document.getElementById("boot-apply-btn");
    bootsetBtn.addEventListener("click", async () => {
      try {
        await runShell(`cp ${scriptdir}/waltp.sh ${scriptdir}/boot/`);
        output.textContent = "Boot apply configured.";
      } catch (err) {
        output.textContent = `Boot apply failed: ${err}`;
      }
    });

    // boot remove button
    const bootRMBtn = document.getElementById("boot-disable-btn");
    bootRMBtn.addEventListener("click", async () => {
      try {
        await runShell(`rm ${scriptdir}/boot/waltp.sh`);
        output.textContent = "Boot apply disabled.";
      } catch (err) {
        output.textContent = `Boot disable failed: ${err}`;
      }
    });

  } catch (err) {
    output.textContent = `Error loading CPU data: ${err}`;
  }
});