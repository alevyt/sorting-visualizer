const Algorithms = new Map();

export function defineAlgorithm(id, name, generatorFactory) {
  Algorithms.set(id, { id, name, generatorFactory });
  console.log('adding ', name);
}

export function getAlgorithm(id) {
  return Algorithms.get(id) || null;
}

export function listAlgorithms() {
  return Array.from(Algorithms.values());
}