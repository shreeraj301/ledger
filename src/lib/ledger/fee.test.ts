import assert from "node:assert/strict";
import test from "node:test";
import { parseFee, revisionNote } from "./format.ts";

test("parseFee accepts whole rupees and Indian grouping", () => {
  assert.equal(parseFee("85000"), 85000);
  assert.equal(parseFee("85,000"), 85000);
  assert.equal(parseFee("1,85,000"), 185000);
  assert.equal(parseFee("85000.50"), 85000.5);
});

test("parseFee rejects text, negatives, and empty", () => {
  assert.equal(parseFee("abc"), null);
  assert.equal(parseFee("-10"), null);
  assert.equal(parseFee(""), null);
  assert.equal(parseFee("0"), null);
  assert.equal(parseFee("12.345"), null);
});

test("revisionNote explains lettered revisions", () => {
  assert.match(revisionNote("Rev A"), /first/);
  assert.match(revisionNote("Rev B"), /second/);
});
