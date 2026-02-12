import { tools } from "../mcp/tools.js";
import { executeTool } from "../mcp/server.js";

export interface AgentOptions {
  preview?: boolean;
  maxIterations?: number;
}

export class Agent {
  model: any;
  iteration: number;

  constructor(model: any) {
    this.model = model;
    this.iteration = 0;
  }

  /**
   * Run the agent loop until stopping condition is met
   * Stops if tests pass or max iterations are reached
   */
  async run(options: AgentOptions = {}): Promise<boolean> {
    const { preview = false, maxIterations = 1 } = options;
    const messages: any[] = [];
    let stop = false;

    while (!stop && this.iteration < maxIterations) {
      this.iteration++;
      console.log(`=== Iteration ${this.iteration} ===`);

      // Call model with messages
      const response = await this.model.call(messages);

      let toolUsed = false;

      if (response.tool_use) {
        const { name, args, content } = response.tool_use;
        const tool = tools.find(t => t.function.name === name);
        if (!tool) {
          console.log(`⚠️ Tool not found: ${name}`);
        } else {
          toolUsed = true;

          // In preview mode, show the content the model would write
          if (preview && name === "write_file") {
            console.log(`📝 Preview - content to be written to ${args.path}:\n`);
            console.log(content);
            console.log("\n---\n");
          }

          const result = await executeTool(name, args, preview);
          console.log(`🔧 Tool Call: ${name}\n📄 Tool Result:\n${result}\n`);

          messages.push({ role: "assistant", content: result });
        }
      }

      // Push raw response for conversation memory
      messages.push({ role: "assistant", content: response });

      // Stop conditions
      if (response.stop_reason === "tests_passed") stop = true;

      // If nothing was done, stop early
      if (!toolUsed) stop = true;
    }

    return stop;
  }
}
