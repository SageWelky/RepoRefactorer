export interface ToolUse {
  name: string;
  args: Record<string, any>;
  id?: string; // optional for tracking
}

export interface ModelResponse {
  content?: any[];          // for text content blocks
  tool_use?: ToolUse;       // for single tool call
  stop_reason?: string;     // e.g., "tests_passed"
}
