import { defineAlgorithm, listAlgorithms, getAlgorithm } from "./core/registry.js";
import { makeRandomArray, makeNearlySorted, reverseArray } from "./core/rng.js";
import { applyOp, clearHighlights, renderBars, setBoard } from "./core/ops.js";

import "./algorithms/bubble.js";
import "./algorithms/insertion.js";
import "./algorithms/selection.js";
import "./algorithms/quick.js";
import "./algorithms/merge.js";

const $ = (s) => document.querySelector(s);

const els = {
    algo: $("#algo"),
    n: $("#n"),
    nVal: $("#nVal"),
    speed: $("#speed"),
    speedVal: $("#speedVal"),
    board: $("#board"),
    status: $("#status"),
    randomize: $("#randomize"),
    nearlySorted: $("#nearlySorted"),
    reverse: $("#reverse"),
    toggleValues: $("#toggleValues"),
    start: $("#start"),
    reset: $("#reset"),
    pause: $("#pause"),
    step: $("#step"),
    cmp: $("#cmp"),
    swp: $("#swp"),
    elapsed: $("#elapsed"),
    runInfo: $("#runInfo"),
    rangeInfo: $("#rangeInfo"),
    toast: $("#toast"),
    themeToggle: $("#themeToggle"),
};

const State = {
    original: [],
    values: [],
    sorted: new Set(),
    running: false,
    paused: false,
    stepOnce: false,
    speedMs: 20,
    cmp: 0,
    swp: 0,
    startTs: 0,
    rafId: 0,
    stopRequested: false,
    showValues: false,
};

function setStatus(text) {
    els.status.textContent = text;
}

function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => els.toast.classList.remove("show"), 1000);
}

function updateStats() {
    els.cmp.textContent = String(State.cmp);
    els.swp.textContent = String(State.swp);
    const t = State.running ? (performance.now() - State.startTs) / 1000 : 0;
    els.elapsed.textContent = `${t.toFixed(1)}s`;
}

function tickElapsed() {
    if (!State.running) return;
    updateStats();
    State.rafId = requestAnimationFrame(tickElapsed);
}

function setControlsEnabled() {
    const idle = !State.running;

    els.algo.disabled = !idle;
    els.n.disabled = !idle;
    els.randomize.disabled = !idle;
    els.nearlySorted.disabled = !idle;
    els.reverse.disabled = !idle;

    els.start.disabled = !idle;
    els.reset.disabled = false;

    els.pause.disabled = idle;
    els.step.disabled = idle ? true : !State.paused;
}

function populateAlgorithms() {
    els.algo.innerHTML = "";
    for (const a of listAlgorithms()) {
        const opt = document.createElement("option");
        opt.value = a.id;
        opt.textContent = a.name;
        els.algo.appendChild(opt);
    }
}

function setSpeedFromUI() {
    const v = Number(els.speed.value);
    State.speedMs = v;
    els.speedVal.textContent = String(v);
}

function setNFromUI() {
    const v = Number(els.n.value);
    els.nVal.textContent = String(v);
}

function updateRangeInfo() {
    const max = Math.max(...State.values);
    const min = Math.min(...State.values);
    els.rangeInfo.textContent = `${min}..${max}`;
}

function sleep(ms) {
    if (ms <= 0) return Promise.resolve();
    return new Promise((r) => setTimeout(r, ms));
}

async function waitIfPaused() {
    while (State.paused && !State.stopRequested) {
        if (State.stepOnce) {
            State.stepOnce = false;
            return;
        }
        await sleep(16);
    }
}

async function runAlgorithm() {
    const algo = getAlgorithm(els.algo.value);
    if (!algo) return;

    State.running = true;
    State.paused = false;
    State.stopRequested = false;
    State.cmp = 0;
    State.swp = 0;
    State.sorted.clear();
    State.startTs = performance.now();

    setStatus(`Running: ${algo.name}`);
    els.runInfo.textContent = "Running";
    setControlsEnabled();
    updateStats();
    cancelAnimationFrame(State.rafId);
    State.rafId = requestAnimationFrame(tickElapsed);

    const working = State.values.slice();
    const gen = algo.generatorFactory(working);

    try {
        for (const op of gen) {
            await waitIfPaused();
            if (State.stopRequested) break;

            if (op.type === "compare") State.cmp++;
            if (op.type === "swap" || op.type === "write") State.swp++;

            await applyOp({
                ...op,
                speedMs: State.speedMs,
                stateValues: State.values,
                stateSorted: State.sorted,
                render: () => {
                    renderBars(els.board, State.values, State.sorted);
                    updateRangeInfo();
                },
            });
        }
    } finally {
        State.running = false;
        State.paused = false;
        State.stepOnce = false;

        clearHighlights(els.board);
        renderBars(els.board, State.values, State.sorted);
        cancelAnimationFrame(State.rafId);
        updateStats();

        els.runInfo.textContent = State.stopRequested ? "Stopped" : "Done";
        setStatus(State.stopRequested ? "Stopped" : "Done");
        setControlsEnabled();
        toast(State.stopRequested ? "Stopped" : "Done");
    }
}

function resetToOriginal() {
    State.stopRequested = true;
    State.running = false;
    State.paused = false;
    State.stepOnce = false;
    State.cmp = 0;
    State.swp = 0;
    State.sorted.clear();
    cancelAnimationFrame(State.rafId);

    State.values = State.original.slice();
    setBoard(els.board, State.values, State.sorted);
    updateRangeInfo();

    setStatus("Idle");
    els.runInfo.textContent = "Idle";
    updateStats();
    setControlsEnabled();
}

function randomize() {
    const n = Number(els.n.value);
    State.original = makeRandomArray(n);
    State.values = State.original.slice();
    setBoard(els.board, State.values, State.sorted);
    updateRangeInfo();
    toast("Randomized");
}

function applyNearlySortedClick() {
    const n = Number(els.n.value);
    const base = makeRandomArray(n);
    State.original = makeNearlySorted(base, Math.max(2, Math.floor(n * 0.06)));
    State.values = State.original.slice();
    setBoard(els.board, State.values, State.sorted);
    updateRangeInfo();
    toast("Nearly sorted");
}

function applyReverseClick() {
    State.original = reverseArray(State.values);
    State.values = State.original.slice();
    setBoard(els.board, State.values, State.sorted);
    updateRangeInfo();
    toast("Reversed");
}

function init() {
    populateAlgorithms();

    applyTheme(getInitialTheme());
    els.themeToggle?.addEventListener("click", toggleTheme);

    els.n.value = "60";
    els.speed.value = "20";
    setNFromUI();
    setSpeedFromUI();

    randomize();
    setControlsEnabled();

    els.n.addEventListener("input", () => {
        setNFromUI();
        randomize();
    });

    els.speed.addEventListener("input", () => setSpeedFromUI());

    els.randomize.addEventListener("click", () => randomize());
    els.nearlySorted.addEventListener("click", () => applyNearlySortedClick());
    els.reverse.addEventListener("click", () => applyReverseClick());

    els.toggleValues.addEventListener("click", () => {
        State.showValues = !State.showValues;
        els.board.classList.toggle("show-values", State.showValues);
        els.toggleValues.textContent = State.showValues ? "Hide values" : "Show values";
    });

    els.start.addEventListener("click", () => {
        if (State.running) return;
        State.values = State.original.slice();
        State.sorted.clear();
        setBoard(els.board, State.values, State.sorted);
        updateRangeInfo();
        runAlgorithm();
    });

    els.reset.addEventListener("click", () => resetToOriginal());

    els.pause.addEventListener("click", () => {
        if (!State.running) return;
        State.paused = !State.paused;
        els.pause.textContent = State.paused ? "Resume" : "Pause";
        els.step.disabled = !State.paused;
        setStatus(State.paused ? "Paused" : "Running");
        toast(State.paused ? "Paused" : "Resumed");
    });

    els.step.addEventListener("click", () => {
        if (!State.running || !State.paused) return;
        State.stepOnce = true;
    });

    window.addEventListener("keydown", (e) => {
        if (e.code === "Space" && State.running) {
            e.preventDefault();
            els.pause.click();
        }
        if (e.code === "ArrowRight" && State.running && State.paused) {
            e.preventDefault();
            els.step.click();
        }
        if (e.code === "KeyR" && !State.running) {
            e.preventDefault();
            randomize();
        }
    });

    els.board.classList.toggle("show-values", State.showValues);
    els.toggleValues.textContent = State.showValues ? "Hide values" : "Show values";
    updateRangeInfo();
}

const THEME_KEY = "sv.theme";

function applyTheme(theme) {
    const t = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = t;
    if (els.themeToggle) els.themeToggle.textContent = t === "dark" ? "Light" : "Dark";
}

function getInitialTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function toggleTheme() {
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
}

init();

window.SortingVisualizer = {
    defineAlgorithm,
    get currentArray() {
        return State.values.slice();
    },
};