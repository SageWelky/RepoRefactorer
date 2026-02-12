import { test } from "node:test";
import assert from "node:assert";
import { divide } from "../src/math.js";

test("divide by zero throws error", () => {
  assert.throws(() => divide(10, 0));
});
