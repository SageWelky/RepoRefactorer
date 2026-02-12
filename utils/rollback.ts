import fs from "fs";

type FileBackup = Record<string, string | null>;
export class RollbackManager {
  private backups: FileBackup = {};

  backup(filePath: string) {
    if (!(filePath in this.backups)) {
      try {
        this.backups[filePath] = fs.readFileSync(filePath, "utf-8");
      } catch (err) {
        this.backups[filePath] = null; // file didn’t exist
      }
    }
  }

  restoreAll() {
    for (const path in this.backups) {
      const original = this.backups[path];
      if (original === null) {
        // file didn’t exist before, delete it
        try { fs.unlinkSync(path); } catch {}
      } else {
        fs.writeFileSync(path, original, "utf-8");
      }
    }
  }
}