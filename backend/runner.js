const { spawn } = require("child_process");

const IMAGES = {
  python: "docks-python",
  cpp: "docks-cpp",
};

const TIMEOUT_MS = 10000; // 10 seconds max per execution

/**
 * Runs code in the appropriate Docker container.
 * @param {string} language - "python" or "cpp"
 * @param {string} code - source code to execute
 * @returns {Promise<{ stdout: string, stderr: string, exitCode: number }>}
 */
function runCode(language, code) {
  return new Promise((resolve, reject) => {
    const image = IMAGES[language];

    if (!image) {
      return reject(new Error(`Unsupported language: ${language}`));
    }

    const args = [
      "run",
      "--rm",           // auto-remove container after exit
      "-i",             // interactive (so we can pipe stdin)
      "--network=none", // no internet access inside container
      "--memory=128m",  // max 128MB RAM
      "--cpus=0.5",     // max half a CPU core
      image,
    ];

    const container = spawn("docker", args);

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    // Kill container if it runs too long
    const timer = setTimeout(() => {
      timedOut = true;
      container.kill();
    }, TIMEOUT_MS);

    // Send the code into the container's stdin
    container.stdin.write(code);
    container.stdin.end();

    container.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    container.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    container.on("close", (exitCode) => {
      clearTimeout(timer);
      if (timedOut) {
        return resolve({
          stdout: "",
          stderr: "Execution timed out (10s limit).",
          exitCode: 1,
        });
      }
      resolve({ stdout, stderr, exitCode });
    });

    container.on("error", (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to start Docker: ${err.message}`));
    });
  });
}

module.exports = { runCode };
