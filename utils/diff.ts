import fs from "fs";
import { diffLines } from "diff";

export function showDiff(filePath: string, newContent: string) {
  let oldContent = "";
  try {
    oldContent = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    // file may not exist yet
  }

  const diff = diffLines(oldContent, newContent);
  let output = "";

  diff.forEach(part => {
    const prefix = part.added ? "+" : part.removed ? "-" : " ";
    const lines = part.value.split("\n");
    lines.forEach(line => {
      if (line.trim() !== "") output += `${prefix}${line}\n`;
    });
  });

  return output;
}
