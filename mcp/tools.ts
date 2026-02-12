import fs from "fs";
import path from "path";
import { diffLines } from "diff";
import { RollbackManager } from "../utils/rollback.js";
import { ROOT_DIR, resolvePath } from "./server.js";

export const rollback = new RollbackManager();

/**
 * Diff preview helper
 */
export function showDiff(filePath: string, newContent: string): string {
  let oldContent = "";
  try {
    oldContent = fs.readFileSync(filePath, "utf-8");
  } catch {
    // file may not exist yet
  }

  const diff = diffLines(oldContent, newContent);
  let output = "";
  diff.forEach((part) => {
    const prefix = part.added ? "+" : part.removed ? "-" : " ";
    part.value.split("\n").forEach((line) => {
      if (line.trim() !== "") output += `${prefix}${line}\n`;
    });
  });
  return output;
}

/**
 * Tools
 */
export const tools: any[] = [
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read a file from the project",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"]
      },
      async call({ path: filePath }: { path: string }) {
        const fullPath = resolvePath(filePath);
        return fs.readFileSync(fullPath, "utf-8");
      }
    }
  },
  {
    type: "function",
    function: {
      name: "write_file",
      description: "Overwrite a file with new content (with diff preview + rollback)",
      parameters: {
        type: "object",
        properties: { path: { type: "string" }, content: { type: "string" } },
        required: ["path", "content"]
      },
      async call({ path: filePath, content }: { path: string; content: string }) {
        const fullPath = resolvePath(filePath);
        rollback.backup(fullPath); // backup for rollback
        const diff = showDiff(fullPath, content);
        console.log("📄 Diff Preview:\n", diff);
        fs.writeFileSync(fullPath, content, "utf-8");
        return "File written successfully.";
      }
    }
  },
  {
    type: "function",
    function: {
      name: "run_tests",
      description: "Run project tests and return output",
      parameters: { type: "object", properties: {} },
      async call() {
        // simple Node test runner (assumes .test.ts or .test.js files)
        const { execSync } = await import("child_process");
        try {
          const output = execSync("node --test", { encoding: "utf-8" });
          return output;
        } catch (err: any) {
          return err.stdout || err.message;
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "git_diff",
      description: "Show git diff of current changes",
      parameters: { type: "object", properties: {} },
      async call() {
        const { execSync } = await import("child_process");
        try {
          const output = execSync("git diff", { encoding: "utf-8" });
          return output || "No changes.";
        } catch {
          return "Git not available.";
        }
      }
    }
  }
];
