import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

for (const envPath of [
  path.join(backendRoot, ".env.local"),
  path.join(backendRoot, ".env"),
]) {
  if (existsSync(envPath)) {
    loadEnvFile(envPath);
  }
}

const [, , command, ...args] = process.argv;

if (!command) {
  throw new Error("Missing command. Usage: node scripts/run-with-env.mjs <command> [...args]");
}

const child = spawn(command, args, {
  cwd: backendRoot,
  env: process.env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

function loadEnvFile(envPath) {
  const contents = readFileSync(envPath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
