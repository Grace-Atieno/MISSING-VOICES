import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  COUNTIES,
  DEMO_RECORDS,
  STORAGE_KEY,
  createCaseId,
  loadRecords,
  saveRecords,
} from "./records.js";

function createStorage(initialValue = null) {
  let value = initialValue;
  return {
    getItem(key) {
      assert.equal(key, STORAGE_KEY);
      return value;
    },
    setItem(key, nextValue) {
      assert.equal(key, STORAGE_KEY);
      value = nextValue;
    },
    read() {
      return value;
    },
  };
}

test("the county list contains 47 unique counties", () => {
  assert.equal(COUNTIES.length, 47);
  assert.equal(new Set(COUNTIES).size, 47);
});

test("first run returns fictional demo records and saved records round-trip", () => {
  const storage = createStorage();
  assert.deepEqual(loadRecords(storage), { records: DEMO_RECORDS, error: "" });

  saveRecords(DEMO_RECORDS, storage);
  assert.deepEqual(loadRecords(storage), { records: DEMO_RECORDS, error: "" });
});

test("invalid saved data is reported instead of being silently replaced", () => {
  const storage = createStorage("{not valid json");
  const result = loadRecords(storage);
  assert.deepEqual(result.records, []);
  assert.match(result.error, /could not be loaded/i);
});

test("storage read failures are reported", () => {
  const storage = {
    getItem() {
      throw new Error("storage denied");
    },
  };
  assert.match(loadRecords(storage).error, /storage denied/);
});

test("saving rejects malformed records", () => {
  const storage = createStorage();
  assert.throws(() => saveRecords([{ id: "incomplete" }], storage), /invalid case records/i);
  assert.equal(storage.read(), null);
});

test("saved records require unique IDs and valid dates", () => {
  const duplicateRecords = [DEMO_RECORDS[0], DEMO_RECORDS[0]];
  assert.match(loadRecords(createStorage(JSON.stringify(duplicateRecords))).error, /invalid format/i);

  const invalidDateRecords = [{ ...DEMO_RECORDS[0], reportDate: "2025-02-30" }];
  assert.match(loadRecords(createStorage(JSON.stringify(invalidDateRecords))).error, /invalid format/i);
});

test("case IDs are unique against existing records", () => {
  const date = new Date("2026-10-29T12:00:00");
  const first = createCaseId([], date);
  const next = createCaseId([{ id: first }], date);
  assert.match(first, /^MP-2026-\d{8}$/);
  assert.notEqual(next, first);
});
