document.addEventListener("DOMContentLoaded", () => {
    const profileSlider = document.getElementById("profile-slider");
    const profileName = document.getElementById("profile-name");
    const satSlider = document.getElementById("saturation-slider");
    const satValue = document.getElementById("saturation-value");
    const vsyncBtn = document.getElementById("vsync-btn");
    const vsyncStatus = document.getElementById("vsync-status");
    const minRefreshSlider = document.getElementById("min-refresh-slider");
    const maxRefreshSlider = document.getElementById("max-refresh-slider");
    const refreshApply = document.getElementById("refresh-apply");

    const refreshMap = {
        1: 30,
        2: 48,
        3: 60,
        4: 90,
        5: 120,
        6: 144
    };

    profileSlider.addEventListener("input", async () => {
        let val = parseInt(profileSlider.value);
        let name = "Default";
        let cmd1 = "";
        let cmd2 = "";
        let saturationVal = 1.0;

        if (val === 1) {
            name = "Default";
            cmd1 = `service call SurfaceFlinger 1022 f 1.0`;
            cmd2 = `service call SurfaceFlinger 1015 i32 0`;
            saturationVal = 1.0;
        } else if (val === 2) {
            name = "X-Reality";
            cmd1 = `service call SurfaceFlinger 1022 f 1.3`;
            cmd2 = `service call SurfaceFlinger 1015 i32 1 f 1.2 f 0 f 0.0 f 0.0 f 0 f 1.0 f 0.33 f 0.0 f 0.0 f 0.0 f 1 f 0.0 f 0.0 f 0.0 f 0.0 f 0.76`;
            saturationVal = 1.3;
        } else if (val === 3) {
            name = "Bright";
            cmd1 = `service call SurfaceFlinger 1022 f 1.4`;
            cmd2 = `service call SurfaceFlinger 1015 i32 1 f 1.4 f 0.2 f 0.2 f 0.0 f 0.2 f 1.4 f 0.2 f 0.0 f 0.2 f 0.2 f 1.4 f 0.0 f 0.0 f 0.0 f 0.0 f 1.0`;
            saturationVal = 1.4;
        }

        profileName.textContent = name;

        try {
            await runShell(cmd1);
            await runShell(cmd2);
            satSlider.value = saturationVal;
            satValue.textContent = saturationVal.toFixed(2);
            document.getElementById("output").textContent = `Profile "${name}" applied.`;
        } catch (e) {
            document.getElementById("output").textContent = `Failed: ${e}`;
        }
    });

    satSlider.addEventListener("input", async () => {
        let val = parseFloat(satSlider.value).toFixed(2);
        satValue.textContent = val;
        try {
            await runShell(`service call SurfaceFlinger 1022 f ${val}`);
        } catch (e) {
            document.getElementById("output").textContent = `Saturation failed: ${e}`;
        }
    });

    vsyncBtn.addEventListener("click", async () => {
        try {
            await runShell(`service call SurfaceFlinger 1006 i32 1`);
            vsyncStatus.textContent = "Enabled";
        } catch (e) {
            document.getElementById("output").textContent = `VSYNC toggle failed: ${e}`;
        }
    });

    minRefreshSlider.addEventListener("input", () => {
        document.getElementById("min-refresh-value").textContent = refreshMap[minRefreshSlider.value];
    });

    maxRefreshSlider.addEventListener("input", () => {
        document.getElementById("max-refresh-value").textContent = refreshMap[maxRefreshSlider.value];
    });

    refreshApply.addEventListener("click", async () => {
        const minHz = refreshMap[minRefreshSlider.value];
        const maxHz = refreshMap[maxRefreshSlider.value];
        try {
            await runShell(`settings put system peak_refresh_rate ${maxHz} && settings put system min_refresh_rate ${minHz} `);
            document.getElementById("output").textContent = `Refresh rate applied: ${minHz}-${maxHz}Hz`;
        } catch (e) {
            document.getElementById("output").textContent = `Refresh rate failed: ${e}`;
        }
    });
});