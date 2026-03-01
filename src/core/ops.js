function sleep(ms) {
  if (ms <= 0) return Promise.resolve();
  return new Promise((r) => setTimeout(r, ms));
}

export function setBoard(boardEl, values, sortedSet) {
  boardEl.innerHTML = "";
  sortedSet.clear();

  for (let i = 0; i < values.length; i++) {
    const b = document.createElement("div");
    b.className = "bar";
    b.dataset.idx = String(i);
    b.dataset.v = String(values[i]);
    boardEl.appendChild(b);
  }

  renderBars(boardEl, values, sortedSet);
}

export function renderBars(boardEl, values, sortedSet) {
  const bars = boardEl.querySelectorAll(".bar");
  const max = Math.max(...values);
  const h = boardEl.clientHeight || 400;

  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    const pct = max === 0 ? 0 : v / max;
    const px = Math.max(4, Math.floor(pct * (h - 10)));
    const bar = bars[i];
    if (!bar) continue;
    bar.style.height = px + "px";
    bar.dataset.v = String(v);
    bar.classList.toggle("sorted", sortedSet.has(i));
    bar.classList.remove("compare", "swap");
  }
}

export function clearHighlights(boardEl) {
  boardEl.querySelectorAll(".bar.compare").forEach((b) => b.classList.remove("compare"));
  boardEl.querySelectorAll(".bar.swap").forEach((b) => b.classList.remove("swap"));
}

function highlight(boardEl, cls, indices) {
  clearHighlights(boardEl);
  const bars = boardEl.querySelectorAll(".bar");
  for (const idx of indices) bars[idx]?.classList.add(cls);
}

function markSorted(sortedSet, from, to) {
  for (let i = from; i <= to; i++) sortedSet.add(i);
}

export async function applyOp(op) {
  const { type, speedMs, stateValues, stateSorted, render } = op;
  const boardEl = document.getElementById("board");

  if (type === "compare") {
    highlight(boardEl, "compare", [op.i, op.j]);
    await sleep(speedMs);
    return;
  }

  if (type === "swap") {
    highlight(boardEl, "swap", [op.i, op.j]);
    await sleep(Math.max(8, speedMs));
    [stateValues[op.i], stateValues[op.j]] = [stateValues[op.j], stateValues[op.i]];
    render();
    await sleep(speedMs);
    return;
  }

  if (type === "write") {
    highlight(boardEl, "swap", [op.i]);
    await sleep(Math.max(8, speedMs));
    stateValues[op.i] = op.value;
    render();
    await sleep(speedMs);
    return;
  }

  if (type === "markSorted") {
    markSorted(stateSorted, op.from, op.to);
    render();
    await sleep(Math.min(40, speedMs));
    return;
  }

  if (type === "select") {
    highlight(boardEl, "swap", [op.i]);
    await sleep(Math.min(35, speedMs));
  }
}