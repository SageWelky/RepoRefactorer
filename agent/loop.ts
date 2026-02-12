import { AnthropicModel } from "./models/anthropic.js";
import { MockModel } from "./models/mock.js";
import { executeTool } from "../mcp/server.js";
import { Logger } from "../utils/logger.js";
import { detectTestSuccess } from "../utils/testParser.js";

export async function runAgent(modelChoice: string) {
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

  let messages: any[] = [
    {
      role: "user",
      content: "Fix the divide function in src/math.js so tests pass."
    }
  ];

  for (let i = 0; i < 8; i++) {
    logger.iteration(i);

    const response = await model.call(messages);

    // Determine blocks: either content array or single tool_use
    const blocks: any[] = response.content
      ? response.content
      : response.tool_use
      ? [response.tool_use]
      : [];

    let toolUsed = false;

    for (const block of blocks) {
      if (block.name) {
        // tool_use detected
        toolUsed = true;
        logger.toolCall(block.name);
        const result = await executeTool(block.name, block.args);
        logger.toolResult(result);

        // push back to messages
        messages.push({ role: "assistant", content: blocks });
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
