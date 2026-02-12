import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { ModelResponse } from "./base.js";
import { tools } from "../../mcp/tools.js";

dotenv.config();

export class AnthropicModel {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });
  }

  async call(messages: any[]): Promise<ModelResponse> {
    const response = await this.client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages,
      tools: tools
    });

    // always return a ModelResponse
    return { content: response.content ? [response.content] : [] };
  }
}
