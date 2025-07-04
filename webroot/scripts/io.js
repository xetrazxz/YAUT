document.addEventListener("DOMContentLoaded", async () => {
  const output = document.getElementById("output");
  const schedulerControls = document.getElementById("io-scheduler-controls");
  const readAheadControls = document.getElementById("read-ahead-controls");
  const swappinessSlider = document.getElementById("swappiness-slider");
  const swappinessValue = document.getElementById("swappiness-value");
  const iostatsBtn = document.getElementById("iostats-btn");
  const iostatsStatus = document.getElementById("iostats-status");
  const optimizeBtn = document.getElementById("io-optimize-btn");
  const bootsetBtn = document.getElementById("boot-apply-btn");
  const bootRMBtn = document.getElementById("boot-disable-btn");
  
  try {
    // swappiness
    const swappiness = await runShell(`cat /proc/sys/vm/swappiness`);
    swappinessSlider.value = swappiness.trim();
    swappinessValue.textContent = swappiness.trim();

    // block devices
    const blockDevsRaw = await runShell(`ls /sys/block | grep -E 'mmcblk[0-9]+|sd[a-z]'`);
    const blockDevs = blockDevsRaw.trim().split("\n");

    for (let dev of blockDevs) {
      const schedPath = `/sys/block/${dev}/queue/scheduler`;
      const readAheadPath = `/sys/block/${dev}/queue/read_ahead_kb`;
      const iostatsPath = `/sys/block/${dev}/queue/iostats`;

      // scheduler
      const schedRaw = await runShell(`cat ${schedPath}`);
      const scheds = schedRaw.replace(/\[|\]/g, "").split(" ");
      const activeSched = scheds.find(s => schedRaw.includes(`[${s}]`)) || "unknown";

      const schedDiv = document.createElement("div");
      schedDiv.className = "io-block";
      schedDiv.innerHTML = `
        <label for="sched-${dev}"><i class="fa fa-list-tree"></i> ${dev} Scheduler:</label>
        <select id="sched-${dev}">
          ${scheds.map(s => `<option value="${s}" ${s===activeSched ? "selected":""}>${s}</option>`).join("")}
        </select>
      `;
      schedulerControls.appendChild(schedDiv);

      document.getElementById(`sched-${dev}`).addEventListener("change", async (e) => {
        try {
          await runShell(`echo ${e.target.value} > ${schedPath}`);
          output.textContent = `Scheduler for ${dev} set to ${e.target.value}`;
        } catch (err) {
          output.textContent = `Scheduler change failed: ${err}`;
        }
      });

      // read ahead
      const curReadAhead = await runShell(`cat ${readAheadPath}`);
      const readDiv = document.createElement("div");
      readDiv.className = "io-block";
      readDiv.innerHTML = `
        <label for="read-${dev}"><i class="fa fa-stream"></i> ${dev} Read Ahead:</label>
        <input type="range" id="read-${dev}" min="64" max="4096" step="64" value="${curReadAhead.trim()}"/>
        <p>Current: <span id="read-val-${dev}">${curReadAhead.trim()}</span> KB</p>
      `;
      readAheadControls.appendChild(readDiv);

      document.getElementById(`read-${dev}`).addEventListener("input", async (e) => {
        const val = e.target.value;
        document.getElementById(`read-val-${dev}`).textContent = val;
        try {
          await runShell(`echo ${val} > ${readAheadPath}`);
          output.textContent = `Read ahead for ${dev} set to ${val} KB`;
        } catch (err) {
          output.textContent = `Read ahead change failed: ${err}`;
        }
      });

      // iostats
      const iostatsValue = await runShell(`cat ${iostatsPath}`);
      iostatsStatus.textContent = iostatsValue.trim() === "1" ? "Enabled" : "Disabled";
    }

    // toggle iostats
    iostatsBtn.addEventListener("click", async () => {
      try {
        const newVal = iostatsStatus.textContent === "Enabled" ? 0 : 1;
        for (let dev of blockDevs) {
          await runShell(`echo ${newVal} > /sys/block/${dev}/queue/iostats`);
        }
        iostatsStatus.textContent = newVal === 1 ? "Enabled" : "Disabled";
        output.textContent = `I/O stats ${newVal === 1 ? "enabled" : "disabled"} on all devices`;
      } catch (err) {
        output.textContent = `I/O stats toggle failed: ${err}`;
      }
    });

    // swappiness change
    swappinessSlider.addEventListener("input", async () => {
      const val = swappinessSlider.value;
      swappinessValue.textContent = val;
      try {
        await runShell(`echo ${val} >/proc/sys/vm/swappiness`);
        output.textContent = `Swappiness set to ${val}.`;
      } catch (e) {
        output.textContent = `Failed to set swappiness: ${e}`;
      }
    });

    // best settings
    optimizeBtn.addEventListener("click", async () => {
      try {
        await runShell(`
          sh /data/local/YAUT/scripts/io.sh
        `);

        const newSwappiness = await runShell(`sysctl -n vm.swappiness`);
        swappinessSlider.value = newSwappiness.trim();
        swappinessValue.textContent = newSwappiness.trim();

        // refresh schedulers
        for (let dev of blockDevs) {
          const schedPath = `/sys/block/${dev}/queue/scheduler`;
          const schedRaw = await runShell(`cat ${schedPath}`);
          const activeSched = schedRaw.match(/\[(.*?)\]/)?.[1] || "none";
          document.getElementById(`sched-${dev}`).value = activeSched;
        }

        output.textContent = "Best settings applied.";
      } catch (err) {
        output.textContent = `Failed to apply best settings: ${err}`;
      }
    });

    // boot apply button
    bootsetBtn.addEventListener("click", async () => {
      try {
    await runShell(`
    cp /data/local/YAUT/scripts/io.sh /data/local/YAUT/scripts/boot/boot_io.sh`);
    output.textContent = "Boot tweak script created ";
  } catch (err) {
    output.textContent = `Failed to write boot tweak script: ${err}`;
  }
});
    
    bootRMBtn.addEventListener("click", async () => {
      try {
        await runShell(`rm /data/local/YAUT/scripts/boot/boot_io.sh`);
        output.textContent = "Tweaks wont be applied at boot.";
      } catch (err) {
        output.textContent = `Failed to Remove: ${err}`;
      }
    });

  } catch (e) {
    output.textContent = `Error loading I/O controls: ${e}`;
  }
});