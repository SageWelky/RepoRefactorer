import { AnthropicModel } from "./models/anthropic.js";
import { MockModel } from "./models/mock.js";
import { executeTool } from "../mcp/server.js";
import { Logger } from "../utils/logger.js";
import { detectTestSuccess } from "../utils/testParser.js";
export async function runAgent(modelChoice) {
    const logger = new Logger();
    let model;
    switch (modelChoice) {
        case "mock":
            model = new MockModel();
            break;
        case "anthropic":
            model = new AnthropicModel();
            break;
        default:
            throw new Error(`Unknown model: ${modelChoice}`);
    }
    let messages = [
        {
            role: "user",
            content: "Fix the divide function in src/math.js so tests pass."
        }
    ];
    for (let i = 0; i < 8; i++) {
        logger.iteration(i);
        const response = await model.call(messages);
        const blocks = response.content;
        let toolUsed = false;
        for (const block of blocks) {
            if (block.type === "tool_use") {
                toolUsed = true;
                logger.toolCall(block.name);
                const result = await executeTool(block.name, block.input);
                logger.toolResult(result);
                messages.push({
                    role: "assistant",
                    content: blocks
                });
                messages.push({
                    role: "user",
                    content: [
                        {
                            type: "tool_result",
                            tool_use_id: block.id,
                            content: result
                        }
                    ]
                });
                if (block.name === "run_tests" && detectTestSuccess(result)) {
                    logger.success();
                    return;
                }
            }
        }
        if (!toolUsed) {
            logger.complete();
            break;
        }
    }
}
