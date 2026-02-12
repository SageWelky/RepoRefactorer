export const tools = [
    {
        type: "function",
        function: {
            name: "read_file",
            description: "Read a file from the sandbox project",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string" }
                },
                required: ["path"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "write_file",
            description: "Overwrite a file with new content",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string" },
                    content: { type: "string" }
                },
                required: ["path", "content"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "run_tests",
            description: "Run sandbox tests and return output",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "git_diff",
            description: "Show git diff of sandbox changes",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    }
];
