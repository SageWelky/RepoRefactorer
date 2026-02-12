import fs from "fs";
import { execSync } from "child_process";
import path from "path";

const SANDBOX_ROOT = path.resolve("./sandbox");

// allow agent to change root dir
export let ROOT_DIR = process.cwd();
export function setRootDir(newPath: string) {
  ROOT_DIR = newPath;
}

// resolve paths relative to current root
export function resolvePath(relativePath: string) {
  return path.join(ROOT_DIR, relativePath);
}

export async function executeTool(name: string, args: any, preview = false) {
  switch (name) {
    case "read_file": {
      const filePath = path.join(SANDBOX_ROOT, args.path);
      if (!fs.existsSync(filePath)) return "[Error] File not found.";
      return fs.readFileSync(filePath, "utf-8");
    }

    case "write_file": {
      const filePath = path.join(SANDBOX_ROOT, args.path);
      if (preview) {
        return `[Preview] File ${args.path} would be written.`;
      }

      let original = "";
      if (fs.existsSync(filePath)) {
        original = fs.readFileSync(filePath, "utf-8");
      }

      try {
        fs.writeFileSync(filePath, args.content);
        return "File written successfully.";
      } catch (err) {
        if (original) fs.writeFileSync(filePath, original);
        return "Write failed. Rolled back.";
      }
    }

    case "run_tests": {
      if (preview) return "[Preview] Tests assumed to pass.";

      try {
        const output = execSync("npm test", {
          cwd: SANDBOX_ROOT,
          stdio: ["pipe", "pipe", "pipe"],
        }).toString();
        return output;
      } catch (err: any) {
        return err.stdout?.toString() || err.message;
      }
    }

    case "git_diff": {
      try {
        return execSync("git diff", { cwd: SANDBOX_ROOT }).toString();
      } catch {
        return "No diff available.";
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
