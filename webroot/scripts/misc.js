document.addEventListener("DOMContentLoaded", () => {
  const output = document.getElementById("output");

  document.getElementById("clear-ram-btn").addEventListener("click", async () => {
    try {
      await runShell("echo 3 > /proc/sys/vm/drop_caches");
      output.textContent = "RAM cleared successfully.";
    } catch (err) {
      output.textContent = `Failed to clear RAM: ${err}`;
    }
  });

  document.getElementById("clear-cache-btn").addEventListener("click", async () => {
    try {
      await runShell("sync; echo 3 > /proc/sys/vm/drop_caches && rm -rf /data/system/package_cache && sync");
      output.textContent = "Cache cleared successfully.";
    } catch (err) {
      output.textContent = `Failed to clear cache: ${err}`;
    }
  });

  document.getElementById("bg-dexopt-btn").addEventListener("click", async () => {
    try {
      output.textContent = "Dont Close Will take a Long time.";
      await runShell("cmd package bg-dexopt-job");
      
    } catch (err) {
      output.textContent = `Failed to run dexopt: ${err}`;
    }
  });

  document.getElementById("dev-option-btn").addEventListener("click", async () => {
    try {
      await runShell("settings put global development_settings_enabled 1");
      output.textContent = "Developer options enabled.";
    } catch (err) {
      output.textContent = `Failed to toggle developer options: ${err}`;
    }
  });
});