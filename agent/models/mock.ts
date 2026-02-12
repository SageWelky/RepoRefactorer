import { ModelResponse } from "./base.js";

export class MockModel {
  iteration = 0;

  async call(messages: any[]): Promise<ModelResponse> {
    this.iteration++;

    if (this.iteration === 1) {
      return {
        tool_use: { name: "read_file", args: { path: "math.ts" } }
      };
    }

    if (this.iteration === 2) {
      return {
        tool_use: {
          name: "write_file",
          args: { path: "math.ts", content: "export function divide(a,b){return a/b}" }
        }
      };
    }

    if (this.iteration === 3) {
      return {
        tool_use: { name: "run_tests", args: {} },
        stop_reason: "tests_passed"
      };
    }

    return { content: [] }; // fallback
  }
}
