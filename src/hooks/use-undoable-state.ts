import * as React from "react";

// ponytail: snapshot history (whole state per entry); switch to patches if the state gets large.
export interface UndoableState<T> {
  past: T[];
  present: T;
  future: T[];
}

export type UndoableAction<T> =
  | { type: "set"; next: T | ((prev: T) => T); record: boolean; limit: number }
  | { type: "undo" }
  | { type: "redo" };

export function undoableReducer<T>(state: UndoableState<T>, action: UndoableAction<T>): UndoableState<T> {
  const { past, present, future } = state;
  switch (action.type) {
    case "set": {
      const next = typeof action.next === "function" ? (action.next as (prev: T) => T)(present) : action.next;
      if (Object.is(next, present)) return state;
      if (!action.record) return { past, present: next, future };
      return { past: [...past, present].slice(-action.limit), present: next, future: [] };
    }
    case "undo":
      if (!past.length) return state;
      return { past: past.slice(0, -1), present: past[past.length - 1], future: [present, ...future] };
    case "redo":
      if (!future.length) return state;
      return { past: [...past, present], present: future[0], future: future.slice(1) };
  }
}

export function useUndoableState<T>(initial: T | (() => T), limit = 50) {
  const [state, dispatch] = React.useReducer(
    undoableReducer<T>,
    initial,
    (init): UndoableState<T> => ({
      past: [],
      present: typeof init === "function" ? (init as () => T)() : init,
      future: [],
    }),
  );

  const set = React.useCallback(
    (next: T | ((prev: T) => T), opts?: { record?: boolean }) =>
      dispatch({ type: "set", next, record: opts?.record ?? true, limit }),
    [limit],
  );
  const undo = React.useCallback(() => dispatch({ type: "undo" }), []);
  const redo = React.useCallback(() => dispatch({ type: "redo" }), []);

  return [
    state.present,
    set,
    { undo, redo, canUndo: state.past.length > 0, canRedo: state.future.length > 0 },
  ] as const;
}
