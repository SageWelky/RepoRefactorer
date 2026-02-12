import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { tools } from "../../mcp/tools.js";
dotenv.config();
export class AnthropicModel {
    client;
    constructor() {
        this.client = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });
    }
    async call(messages) {
        const response = await this.client.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 2000,
            messages,
            tools
        });
        return { content: response.content };
    }
}
