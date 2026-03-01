function int(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function makeRandomArray(n) {
  const arr = [];
  for (let i = 0; i < n; i++) arr.push(int(5, 100));
  return arr;
}

export function makeNearlySorted(arr, swaps = 6) {
  const a = arr.slice().sort((x, y) => x - y);
  for (let k = 0; k < swaps; k++) {
    const i = int(0, a.length - 1);
    const j = int(0, a.length - 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function reverseArray(arr) {
  return arr.slice().reverse();
}