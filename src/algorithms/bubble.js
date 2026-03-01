import { defineAlgorithm } from "../core/registry.js";

defineAlgorithm("bubble", "Bubble sort", function* (arr) {
  const n = arr.length;

  for (let end = n - 1; end > 0; end--) {
    let swapped = false;

    for (let i = 0; i < end; i++) {
      yield { type: "compare", i, j: i + 1 };
      if (arr[i] > arr[i + 1]) {
        yield { type: "swap", i, j: i + 1 };
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }

    yield { type: "markSorted", from: end, to: end };
    if (!swapped) break;
  }

  yield { type: "markSorted", from: 0, to: n - 1 };
});