function runShell(command) {
    return new Promise((resolve, reject) => {
        if (typeof ksu !== "object" || typeof ksu.exec !== "function") {
            return reject("KernelSU JavaScript API not available");
        }
        const cb = "cb_" + Date.now();
        window[cb] = (code, stdout, stderr) => {
            delete window[cb];
            const output = (stdout || stderr || "").trim();
            code === 0 ? resolve(stdout) : reject(stderr || "Shell error");
        };
        ksu.exec(command, "{}", cb);
    });
}
