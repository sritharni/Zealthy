import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chokidar from "chokidar";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const entry = path.join(backendRoot, "src/main.ts");

let child = null;
let restarting = false;

function start() {
  child = spawn(
    process.execPath,
    ["--import", "tsx", entry],
    {
      cwd: backendRoot,
      env: process.env,
      stdio: "inherit",
    },
  );

  child.on("exit", (code, signal) => {
    child = null;
    if (restarting) return;
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

function restart() {
  if (!child) {
    start();
    return;
  }
  restarting = true;
  child.once("exit", () => {
    restarting = false;
    start();
  });
  child.kill("SIGTERM");
}

start();

const watcher = chokidar.watch(path.join(backendRoot, "src"), {
  ignoreInitial: true,
  ignored: /(^|[\\/])\..|node_modules|dist/,
});

let pending = null;
function schedule() {
  if (pending) clearTimeout(pending);
  pending = setTimeout(() => {
    pending = null;
    restart();
  }, 150);
}

watcher.on("add", schedule);
watcher.on("change", schedule);
watcher.on("unlink", schedule);
watcher.on("error", (error) => {
  if (error && typeof error === "object" && "code" in error && error.code === "EMFILE") {
    console.warn("File watching disabled: too many open files. Backend will keep running without auto-reload.");
    void watcher.close();
    return;
  }

  console.error("File watcher error:", error);
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    if (child) child.kill(sig);
    process.exit(0);
  });
}
