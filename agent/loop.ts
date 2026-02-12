import { AnthropicModel } from "./models/anthropic.js";
import { MockModel } from "./models/mock.js";
import { OllamaModel } from "./models/ollama.js";
import { executeTool } from "../mcp/server.js";
import { Logger } from "../utils/logger.js";
import { detectTestSuccess } from "../utils/testParser.js";

interface AgentOptions {
  preview?: boolean;
}

function parseResponse(response: { content?: string | any[] | undefined }) {
  const content = response.content;

  if (Array.isArray(content)) return content;

  // Try to parse JSON tool calls if the model returned them
  try {
    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  // fallback: treat raw string as a single text block
  return [{ type: "text", content: content ?? "" }];
}

export async function runAgent(modelChoice: string, options: AgentOptions = {}) {
  const logger = new Logger();

  let model;
  switch (modelChoice) {
    case "mock":
      model = new MockModel();
      break;
    case "anthropic":
      model = new AnthropicModel();
      break;
    case "ollama":
      model = new OllamaModel();
      break;
    default:
      throw new Error(`Unknown model: ${modelChoice}`);
  }

  // Initial user prompt
  const messages: any[] = [
    {
      role: "user",
      content: "Fix the divide function in src/math.js so tests pass."
    }
  ];

  for (let i = 0; i < 1; i++) {
    logger.iteration(i + 1);

    const response = await model.call(messages);
    const blocks = parseResponse(response);

    let toolUsed = false;

    for (const block of blocks) {
      if (block.type === "tool_use" && block.name) {
        toolUsed = true;
        logger.toolCall(block.name);

        const toolArgs = block.args || {};
        let result;

        if (options.preview && block.name === "write_file") {
          result = "[Preview] File would be written here";
        } else {
          result = await executeTool(block.name, toolArgs);
        }

        logger.toolResult(result);

        // Push only the tool result back to the conversation
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

        // Stop immediately if tests pass
        if (block.name === "run_tests" && detectTestSuccess(result)) {
          logger.success();
          return;
        }
      }
    }

    // If the model didn't use any tools, stop the loop
    if (!toolUsed) {
      logger.complete();
      break;
    }
  }
}
