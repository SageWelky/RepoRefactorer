#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { setRootDir, ROOT_DIR, resolvePath } from "./mcp/server.js";
import { rollback } from "./mcp/tools.js";
import { runAgent } from "./agent/loop.js";
import { MockModel } from "./agent/models/mock.js";
import { AnthropicModel } from "./agent/models/anthropic.js";
import { OllamaModel } from "./agent/models/ollama.js";

interface CLIArgs {
  model: "mock" | "anthropic" | "ollama";
  preview?: boolean;
  root?: string;
  rollback?: boolean;
}

const argv = yargs(hideBin(process.argv))
  .option("model", { choices: ["mock", "anthropic", "ollama"], default: "mock" })
  .option("preview", { type: "boolean", default: false })
  .option("root", { type: "string", default: "." })
  .option("rollback", { type: "boolean", default: false })
  .parseSync() as CLIArgs;

// Run the higher-level `runAgent` which seeds the initial prompt/messages.
await runAgent(argv.model, { preview: argv.preview });

const modelChoice = argv.model;

// Set root folder
if (argv.root) {
  setRootDir(argv.root ?? ".");
  console.log(`📂 Root directory set to: ${ROOT_DIR}`);
}

// Choose model
let model;
switch (modelChoice) {
  case "mock":
    model = new MockModel();
    break;
  case "anthropic":
    model = new AnthropicModel(); // <-- only here if modelChoice === 'anthropic'
    break;
  case "ollama":
    model = new OllamaModel();
    break;
  default:
    throw new Error(`Unknown model: ${modelChoice}`);
}

// Override write_file tool in preview mode
if (argv.preview) {
  console.log("🔍 Preview mode enabled: files will not be modified.");
  const { tools } = await import("./mcp/tools.js");
  tools.forEach((tool) => {
    if (tool.function.name === "write_file") {
      const originalCall = tool.function.call;
      tool.function.call = async (args: any) => {
        const { path, content } = args;
        const { showDiff } = await import("./mcp/tools.js");
        const fullPath = resolvePath(path);
        const diff = showDiff(fullPath, content);
        console.log("📄 Diff Preview (preview mode):\n", diff);
        return "Preview mode: file not written.";
      };
    }
  });
}

// Agent loop handled by `runAgent` above.
