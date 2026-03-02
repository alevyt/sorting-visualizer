# Sorting Visualizer

Interactive web-based sorting algorithm visualizer.

------------------------------------------------------------------------

## How to Use

1.  Select algorithm from dropdown
2.  Adjust element count
3.  Adjust speed
4.  Generate array
5.  Click Start

Controls: - Pause = pause animation - Step = one operation - Reset =
restore original

------------------------------------------------------------------------

## App is available here:

[![Open Demo](link.svg)](https://alevyt.github.io/sorting-visualizer/)


<p align="center">
  <a href="https://alevyt.github.io/sorting-visualizer/">
    <img src="link.svg" width="220" alt="Scan to open live demo">
  </a>
</p>

<p align="center">
  Scan to open live demo
</p>

------------------------------------------------------------------------


## Adding New Algorithms

### Step 1 --- Create file

src/algorithms/heap.js

### Step 2 --- Register algorithm

import { defineAlgorithm } from "../core/registry.js";

defineAlgorithm("heap", "Heap sort", function\* (arr) { // logic });

### Step 3 --- Yield operations

Compare yield { type: "compare", i: 0, j: 1 };

Swap yield { type: "swap", i: 0, j: 1 };

Write yield { type: "write", i: 0, value: 5 };

Sorted yield { type: "markSorted", from: 0, to: 3 };

### Step 4 --- Import file

import "./algorithms/heap.js";

------------------------------------------------------------------------

## Architecture

registry.js --- algorithm registry\
ops.js --- visualization engine\
rng.js --- array generators\
main.js --- UI + runner

------------------------------------------------------------------------

## Algorithms Included

Bubble\
Insertion\
Selection\
Quick\
Merge

------------------------------------------------------------------------

## License

MIT
