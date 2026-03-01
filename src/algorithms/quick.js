import { defineAlgorithm } from "../core/registry.js";

defineAlgorithm("quick", "Quick sort", function* (arr) {
  const n = arr.length;
  const sorted = new Set();

  function* partition(lo, hi) {
    const pivot = arr[hi];
    let i = lo;

    for (let j = lo; j < hi; j++) {
      yield { type: "compare", i: j, j: hi };
      if (arr[j] <= pivot) {
        if (i !== j) {
          yield { type: "swap", i, j };
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        i++;
      }
    }

    if (i !== hi) {
      yield { type: "swap", i, j: hi };
      [arr[i], arr[hi]] = [arr[hi], arr[i]];
    }

    sorted.add(i);
    yield { type: "markSorted", from: i, to: i };
    return i;
  }

  function* quick(lo, hi) {
    if (lo > hi) return;

    if (lo === hi) {
      if (!sorted.has(lo)) {
        sorted.add(lo);
        yield { type: "markSorted", from: lo, to: lo };
      }
      return;
    }

    const p = yield* partition(lo, hi);
    yield* quick(lo, p - 1);
    yield* quick(p + 1, hi);
  }

  yield* quick(0, n - 1);
  yield { type: "markSorted", from: 0, to: n - 1 };
});