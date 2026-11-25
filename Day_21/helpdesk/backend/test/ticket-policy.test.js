import test from "node:test";
import assert from "node:assert/strict";
import { canTransition, chatIsWritable } from "../src/ticket-policy.js";
test("agent requests hold; manager approves it", () => {
  assert.equal(canTransition("AGENT", "IN_PROGRESS", "HOLD_REQUESTED"), true);
  assert.equal(canTransition("MANAGER", "HOLD_REQUESTED", "ON_HOLD"), true);
  assert.equal(canTransition("AGENT", "IN_PROGRESS", "ON_HOLD"), false);
});
test("only customer can reopen resolved tickets", () => {
  assert.equal(canTransition("CUSTOMER", "RESOLVED", "REOPENED"), true);
  assert.equal(canTransition("AGENT", "RESOLVED", "REOPENED"), false);
});
test("ticket chat is locked after completion or resolution", () => {
  assert.equal(chatIsWritable("IN_PROGRESS"), true);
  assert.equal(chatIsWritable("COMPLETED"), false);
  assert.equal(chatIsWritable("RESOLVED"), false);
});
