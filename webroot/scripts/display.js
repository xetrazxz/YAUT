
// mapping refresh slider positions
const refreshMap = { 1: 30, 2: 48, 3: 60, 4: 90 };

document.addEventListener("DOMContentLoaded", () => {
  // elements
  const profileSlider = document.getElementById("profile-slider");
  const profileName = document.getElementById("profile-name");
  const satSlider = document.getElementById("saturation-slider");
  const satValue = document.getElementById("saturation-value");
  const minRefreshSlider = document.getElementById("min-refresh-slider");
  const maxRefreshSlider = document.getElementById("max-refresh-slider");
  const minRefreshValue = document.getElementById("min-refresh-value");
  const maxRefreshValue = document.getElementById("max-refresh-value");
  const vsyncBtn = document.getElementById("vsync-btn");
  const vsyncStatus = document.getElementById("vsync-status");

  // init refresh
  minRefreshValue.textContent = refreshMap[minRefreshSlider.value];
  maxRefreshValue.textContent = refreshMap[maxRefreshSlider.value];

  // profile change
  profileSlider.addEventListener("input", async () => {
    const val = parseInt(profileSlider.value);
    let cmd1 = "", cmd2 = "", name = "", satVal = 1.0;

    if (val === 1) {
      name = "Default";
      cmd1 = `service call SurfaceFlinger 1022 f 1.0`;
      cmd2 = `service call SurfaceFlinger 1015 i32 0`;
      satVal = 1.0;
    } else if (val === 2) {
      name = "X-Reality";
      cmd1 = `service call SurfaceFlinger 1022 f 1.3`;
      cmd2 = `service call SurfaceFlinger 1015 i32 1 f 1.2 f 0 f 0.0 f 0.0 f 0 f 1.0 f 0.33 f 0.0 f 0.0 f 0.0 f 1 f 0.0 f 0.0 f 0.0 f 0.0 f 0.76`;
      satVal = 1.3;
    } else if (val === 3) {
      name = "Bright";
      cmd1 = `service call SurfaceFlinger 1022 f 1.4`;
      cmd2 = `service call SurfaceFlinger 1015 i32 1 f 1.4 f 0.2 f 0.2 f 0.0 f 0.2 f 1.4 f 0.2 f 0.0 f 0.2 f 0.2 f 1.4 f 0.0 f 0.0 f 0.0 f 0.0 f 1.0`;
      satVal = 1.4;
    }

    profileName.textContent = name;

    try {
      await runShell(cmd1);
      await runShell(cmd2);
      document.getElementById("output").textContent = `Profile "${name}" applied.`;
      // sync saturation slider
      satSlider.value = satVal;
      satValue.textContent = satVal.toFixed(2);
    } catch (e) {
      document.getElementById("output").textContent = `Profile failed: ${e}`;
    }
  });

  // independent saturation slider
  satSlider.addEventListener("input", async () => {
    const val = parseFloat(satSlider.value).toFixed(2);
    satValue.textContent = val;
    try {
      await runShell(`service call SurfaceFlinger 1022 f ${val}`);
    } catch (e) {
      document.getElementById("output").textContent = `Saturation failed: ${e}`;
    }
  });

  // vsync
  vsyncBtn.addEventListener("click", async () => {
    try {
      await runShell(`service call SurfaceFlinger 1006 i32 1`);
      vsyncStatus.textContent = "Enabled";
    } catch (e) {
      vsyncStatus.textContent = "VSYNC toggle failed";
    }
  });

  // refresh sliders
  minRefreshSlider.addEventListener("input", async () => {
    const val = refreshMap[minRefreshSlider.value];
    minRefreshValue.textContent = val;
    try {
      await runShell(`settings put system min_refresh_rate ${val}`);
      document.getElementById("output").textContent = `Min refresh set to ${val}Hz`;
    } catch (e) {
      document.getElementById("output").textContent = `Min refresh failed: ${e}`;
    }
  });

  maxRefreshSlider.addEventListener("input", async () => {
    const val = refreshMap[maxRefreshSlider.value];
    maxRefreshValue.textContent = val;
    try {
      await runShell(`settings put system peak_refresh_rate ${val}`);
      document.getElementById("output").textContent = `Max refresh set to ${val}Hz`;
    } catch (e) {
      document.getElementById("output").textContent = `Max refresh failed: ${e}`;
    }
  });
});