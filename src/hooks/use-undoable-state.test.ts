import { describe, expect, it } from "vitest";
import { undoableReducer, type UndoableAction, type UndoableState } from "./use-undoable-state";

const init = (n: number): UndoableState<number> => ({ past: [], present: n, future: [] });
const set = (
  s: UndoableState<number>,
  next: number | ((p: number) => number),
  record = true,
  limit = 50,
) => undoableReducer(s, { type: "set", next, record, limit } as UndoableAction<number>);
const undo = (s: UndoableState<number>) => undoableReducer(s, { type: "undo" });
const redo = (s: UndoableState<number>) => undoableReducer(s, { type: "redo" });

describe("undoableReducer", () => {
  it("records previous state on set", () => {
    const s = set(init(1), 2);
    expect(s).toEqual({ past: [1], present: 2, future: [] });
  });

  it("undoes and redoes", () => {
    const s = set(set(init(1), 2), 3);
    const u = undo(s);
    expect(u).toEqual({ past: [1], present: 2, future: [3] });
    expect(redo(u)).toEqual(s);
  });

  it("undo/redo with empty stacks is a no-op", () => {
    const s = init(1);
    expect(undo(s)).toBe(s);
    expect(redo(s)).toBe(s);
  });

  it("clears redo on a new set", () => {
    const s = set(undo(set(init(1), 2)), 5);
    expect(s).toEqual({ past: [1], present: 5, future: [] });
  });

  it("caps history at limit, dropping oldest", () => {
    let s = init(0);
    for (let i = 1; i <= 5; i++) s = set(s, i, true, 3);
    expect(s.past).toEqual([2, 3, 4]);
    expect(s.present).toBe(5);
  });

  it("record:false replaces present without touching history", () => {
    const s = set(set(init(1), 2), 9, false);
    expect(s).toEqual({ past: [1], present: 9, future: [] });
    const u = undo(s);
    expect(set(u, 7, false)).toEqual({ past: [], present: 7, future: [9] });
  });

  it("same-reference set is a no-op", () => {
    const s = set(init(1), 2);
    expect(set(s, 2)).toBe(s);
    expect(set(s, (p) => p)).toBe(s);
  });

  it("functional updates compose", () => {
    const s = set(set(init(1), (p) => p + 1), (p) => p * 10);
    expect(s).toEqual({ past: [1, 2], present: 20, future: [] });
  });
});
