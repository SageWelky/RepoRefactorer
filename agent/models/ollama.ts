import { spawn } from "child_process";

export class OllamaModel {
  async call(messages: any[]): Promise<{ content: string }> {
    const prompt = messages.map(m => m.content).join("\n").trim();
    console.log("\n📝 Sending prompt to Ollama:\n---\n", prompt, "\n---\n");

    return new Promise((resolve, reject) => {
      let output = "";
      let error = "";

      const child = spawn("ollama", ["run", "llama3"], {
        shell: true,
        stdio: ["pipe", "pipe", "pipe"]
      });

      // Send the prompt via stdin
      child.stdin.write(prompt + "\n");
      child.stdin.end();

      child.stdout.on("data", (chunk) => {
        const text = chunk.toString();
        process.stdout.write(text); // live output
        output += text;
      });

      child.stderr.on("data", (chunk) => {
        const text = chunk.toString();
        process.stderr.write(text);
        error += text;
      });

      child.on("error", (err) => reject(err));

      child.on("close", (code) => {
        if (code === 0 && output.trim()) {
          resolve({ content: output.trim() });
        } else if (code !== 0) {
          reject(new Error(`Ollama exited with code ${code}: ${error}`));
        } else {
          reject(new Error("Ollama returned empty output"));
        }
      });

      // Timeout after 60s (LLama3 can be slow locally)
      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error("Ollama call timed out after 60s"));
      }, 60000);

      child.on("exit", () => clearTimeout(timeout));
    });
  }
}
