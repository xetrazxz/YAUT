document.addEventListener("DOMContentLoaded", () => {
  const chargeSlider = document.getElementById("charge-slider");
  const chargeLimitValue = document.getElementById("charge-limit-value");
  const chargeToggle = document.getElementById("charge-toggle");
  const chargeStatus = document.getElementById("charge-status");
  const batteryTemp = document.getElementById("battery-temp");
  const batteryHealth = document.getElementById("battery-health");
  const outputPanel = document.getElementById("output");

  let chargingEnabled = true;

  function scrollLog() {
    outputPanel.scrollTop = outputPanel.scrollHeight;
  }

  // read initial current_now
  async function initializeSlider() {
    try {
      const result = await runShell(`cat /sys/class/qcom-battery/restrict_cur`);
      const current_uA = Math.abs(parseInt(result.trim()));
      const current_A = (current_uA / 1000000).toFixed(2);
      chargeSlider.value = current_A;
      chargeLimitValue.textContent = `${current_A} A`;
      outputPanel.textContent = `Detected current draw: ${current_A} A (${current_uA} uA)`;
      scrollLog();
    } catch (e) {
      outputPanel.textContent = `Failed to read current_now: ${e}`;
      scrollLog();
    }
  }

  // check initial charging suspend status
  async function initializeChargingState() {
    try {
      const result = await runShell(`cat /sys/class/qcom-battery/input_suspend`);
      const val = parseInt(result.trim());
      if (val === 1) {
        chargingEnabled = false;
        chargeStatus.textContent = "Charging Suspended";
        outputPanel.textContent += `\nCharging was initially suspended.`;
      } else {
        chargingEnabled = true;
        chargeStatus.textContent = "Charging Active";
        outputPanel.textContent += `\nCharging was initially active.`;
      }
      scrollLog();
    } catch (e) {
      outputPanel.textContent += `\nFailed to read input_suspend: ${e}`;
      scrollLog();
    }
  }

  // slider change event
  chargeSlider.addEventListener("input", async () => {
    const val_A = parseFloat(chargeSlider.value);
    const val_uA = Math.round(val_A * 1000000);
    chargeLimitValue.textContent = `${val_A} A`;
    try {
      await runShell(`echo ${val_uA} > /sys/class/qcom-battery/restrict_cur && echo 1 > /sys/class/qcom-battery/restrict_chg `);
      outputPanel.textContent = `Charge current limited to ${val_A} A (${val_uA} uA)`;
      scrollLog();
    } catch (e) {
      outputPanel.textContent = `Failed to set charge current: ${e}`;
      scrollLog();
    }
  });

  // charge toggle with input_suspend
  chargeToggle.addEventListener("click", async () => {
    try {
      if (chargingEnabled) {
        await runShell(`echo 1 > /sys/class/qcom-battery/input_suspend`);
        chargeStatus.textContent = "Charging Suspended";
        chargingEnabled = false;
        outputPanel.textContent = "Charging disabled (input_suspend 1)";
      } else {
        await runShell(`echo 0 > /sys/class/qcom-battery/input_suspend`);
        chargeStatus.textContent = "Charging Active";
        chargingEnabled = true;
        outputPanel.textContent = "Charging enabled (input_suspend 0)";
      }
      scrollLog();
    } catch (e) {
      outputPanel.textContent = `Failed to toggle charging: ${e}`;
      scrollLog();
    }
  });

  // battery stats
  async function updateBatteryInfo() {
    try {
      const out = await runShell("dumpsys battery");
      const tempMatch = out.match(/temperature:\s*(\d+)/);
      const healthMatch = out.match(/health:\s*(\\w+)/);
      if (tempMatch) {
        batteryTemp.textContent = (parseInt(tempMatch[1]) / 10).toFixed(1);
      }
      if (healthMatch) {
        batteryHealth.textContent = healthMatch[1];
      }
    } catch (e) {
      batteryTemp.textContent = "--";
      batteryHealth.textContent = "--";
    }
  }

  initializeSlider();
  initializeChargingState();
  updateBatteryInfo();
  setInterval(updateBatteryInfo, 15000);
});