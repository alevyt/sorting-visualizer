import { defineAlgorithm } from "../core/registry.js";

defineAlgorithm("merge", "Merge sort", function* (arr) {
  const n = arr.length;

  function* merge(lo, mid, hi) {
    const aux = arr.slice(lo, hi);
    const leftLen = mid - lo;

    let i = 0;
    let j = leftLen;
    let k = lo;

    while (i < leftLen && j < aux.length) {
      yield { type: "compare", i: lo + i, j: lo + j };

      if (aux[i] <= aux[j]) {
        yield { type: "write", i: k, value: aux[i] };
        arr[k] = aux[i];
        i++;
      } else {
        yield { type: "write", i: k, value: aux[j] };
        arr[k] = aux[j];
        j++;
      }
      k++;
    }

    while (i < leftLen) {
      yield { type: "write", i: k, value: aux[i] };
      arr[k] = aux[i];
      i++;
      k++;
    }

    while (j < aux.length) {
      yield { type: "write", i: k, value: aux[j] };
      arr[k] = aux[j];
      j++;
      k++;
    }
  }

  function* sort(lo, hi) {
    if (hi - lo <= 1) return;
    const mid = lo + Math.floor((hi - lo) / 2);
    yield* sort(lo, mid);
    yield* sort(mid, hi);
    yield* merge(lo, mid, hi);
  }

  yield* sort(0, n);
  yield { type: "markSorted", from: 0, to: n - 1 };
});