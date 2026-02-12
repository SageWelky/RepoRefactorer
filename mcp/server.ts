import fs from "fs";
import { execSync } from "child_process";
import path from "path";

const SANDBOX_ROOT = path.resolve("./sandbox");

export let ROOT_DIR = process.cwd(); // default to sandbox

export function setRootDir(path: string) {
  ROOT_DIR = path;
}

export function resolvePath(relativePath: string) {
  return require("path").join(ROOT_DIR, relativePath);
}

export async function executeTool(name: string, args: any) {
  switch (name) {
    case "read_file":
      return fs.readFileSync(
        path.join(SANDBOX_ROOT, args.path),
        "utf-8"
      );

    case "write_file":
      const filePath = path.join(SANDBOX_ROOT, args.path);

      const original = fs.readFileSync(filePath, "utf-8");

      try {
        fs.writeFileSync(filePath, args.content);
        return "File written successfully.";
      } catch (err) {
        fs.writeFileSync(filePath, original);
        return "Write failed. Rolled back.";
      }


    case "run_tests":
      try {
        const output = execSync("npm test", {
          cwd: SANDBOX_ROOT
        }).toString();
        return output;
      } catch (err: any) {
        return err.stdout?.toString() || err.message;
      }

    case "git_diff":
      try {
        return execSync("git diff", {
          cwd: SANDBOX_ROOT
        }).toString();
      } catch {
        return "No diff available.";
      }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
