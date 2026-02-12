#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { runAgent } from "./agent/loop.js";
(async () => {
    try {
        const argv = yargs(hideBin(process.argv))
            .option("model", {
            alias: "m",
            type: "string",
            description: "Which model to use: 'mock' or 'anthropic'",
            default: "mock"
        })
            .parseSync();
        await runAgent(argv.model);
    }
    catch (err) {
        console.error("Unhandled error in CLI:");
        if (err instanceof Error)
            console.error(err.stack);
        else
            console.error(JSON.stringify(err, null, 2));
        process.exit(1);
    }
})();
