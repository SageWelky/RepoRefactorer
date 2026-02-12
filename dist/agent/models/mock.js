export class MockModel {
    step = 0;
    async call(messages) {
        this.step++;
        // First iteration: read file
        if (this.step === 1) {
            return {
                content: [
                    {
                        type: "tool_use",
                        id: "1",
                        name: "read_file",
                        input: { path: "src/math.js" }
                    }
                ]
            };
        }
        // Second iteration: write fix
        if (this.step === 2) {
            return {
                content: [
                    {
                        type: "tool_use",
                        id: "2",
                        name: "write_file",
                        input: {
                            path: "src/math.js",
                            content: `
                export function divide(a, b) {
                  if (b === 0) throw new Error("Cannot divide by zero");
                  return a / b;
                }
                `
                        }
                    }
                ]
            };
        }
        // Third iteration: run tests
        if (this.step === 3) {
            return {
                content: [
                    {
                        type: "tool_use",
                        id: "3",
                        name: "run_tests",
                        input: {}
                    }
                ]
            };
        }
        return { content: [] };
    }
}
