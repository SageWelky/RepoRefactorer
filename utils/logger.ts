export class Logger {
  iteration(n: number) {
    console.log(`\n=== Iteration ${n} ===`);
  }

  toolCall(name: string) {
    console.log(`\n🔧 Tool Call: ${name}`);
  }

  toolResult(result: string) {
    console.log(`\n📄 Tool Result:\n${result}`);
  }

  success() {
    console.log("\n✅ Tests passed. Agent complete.");
  }

  complete() {
    console.log("\n🏁 Agent finished.");
  }
}
