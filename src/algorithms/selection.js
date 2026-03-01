import { defineAlgorithm } from "../core/registry.js";

defineAlgorithm("selection", "Selection sort", function* (arr) {
  const n = arr.length;

  for (let i = 0; i < n; i++) {
    let min = i;
    yield { type: "select", i };

    for (let j = i + 1; j < n; j++) {
      yield { type: "compare", i: min, j };
      if (arr[j] < arr[min]) {
        min = j;
        yield { type: "select", i: min };
      }
    }

    if (min !== i) {
      yield { type: "swap", i, j: min };
      [arr[i], arr[min]] = [arr[min], arr[i]];
    }

    yield { type: "markSorted", from: i, to: i };
  }
});