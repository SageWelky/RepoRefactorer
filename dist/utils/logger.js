export class Logger {
    iteration(n) {
        console.log(`\n=== Iteration ${n + 1} ===`);
    }
    toolCall(name) {
        console.log(`\n🔧 Tool Call: ${name}`);
    }
    toolResult(result) {
        console.log(`\n📄 Tool Result:\n${result}`);
    }
    success() {
        console.log("\n✅ Tests passed. Agent complete.");
    }
    complete() {
        console.log("\n🏁 Agent finished.");
    }
}
