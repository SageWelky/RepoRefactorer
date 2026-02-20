import { ModelResponse } from "./base.js";

export class MockModel {
  iteration = 0;

  async call(messages: any[]): Promise<ModelResponse> {
    const iter = this.iteration;

    if (iter === 0) {
      this.iteration++;
      return {
        tool_use: { name: "read_file", args: { path: "math.ts" } }
      };
    }

    if (iter === 1) {
      this.iteration++;
      return {
        tool_use: {
          name: "write_file",
          args: { path: "math.ts", content: "export function divide(a,b){return a/b}" }
        }
      };
    }

    if (iter === 2) {
      this.iteration++;
      return {
        tool_use: { name: "run_tests", args: {} },
        stop_reason: "tests_passed"
      };
    }

    return { content: [] }; // fallback
  }
}
