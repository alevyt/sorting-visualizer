import { defineAlgorithm } from "../core/registry.js";

defineAlgorithm("insertion", "Insertion sort", function* (arr) {
  const n = arr.length;

  for (let i = 1; i < n; i++) {
    let j = i;

    while (j > 0) {
      yield { type: "compare", i: j - 1, j };

      if (arr[j - 1] <= arr[j]) break;

      yield { type: "swap", i: j - 1, j };
      [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
      j--;
    }

    yield { type: "markSorted", from: 0, to: i };
  }

  yield { type: "markSorted", from: 0, to: n - 1 };
});