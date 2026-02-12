import { tools, rollback } from "../mcp/tools.js";

export class Agent {
  model: any;
  iteration: number;

  constructor(model: any) {
    this.model = model;
    this.iteration = 0;
  }

  /**
   * Run the agent loop until stopping condition is met
   */
  async run(): Promise<boolean> {
    let stop = false;
    const messages: any[] = [];

    while (!stop && this.iteration < 10) {
      this.iteration++;
      console.log(`=== Iteration ${this.iteration} ===`);

      // Call model with messages + tools
      const response = await this.model.call(messages);

      // Check if model wants to use a tool
      if (response.tool_use) {
        const { name, args } = response.tool_use;
        const tool = tools.find(t => t.function.name === name);
        if (!tool) {
          console.log(`⚠️ Tool not found: ${name}`);
          continue;
        }
        const result = await tool.function.call(args);
        console.log(`🔧 Tool Call: ${name}\n\n📄 Tool Result:\n${result}\n`);
        messages.push({ role: "assistant", content: result });
      }

      // Check stopping condition
      if (response.stop_reason === "tests_passed") {
        stop = true;
      }
    }

    return stop;
  }
}
