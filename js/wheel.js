// Disposizione roulette europea (sequenza fisica sulla ruota)
export const WHEEL = [
  0, 32, 15, 19, 4, 21, 2, 25, 17,
  34, 6, 27, 13, 36, 11, 30, 8,
  23, 10, 5, 24, 16, 33, 1,
  20, 14, 31, 9, 22, 18, 29,
  7, 28, 12, 35, 3, 26
];

export const WHEEL_SIZE = WHEEL.length;

export function indexOfNumber(n) {
  return WHEEL.indexOf(n);
}

export function numberAtIndex(i) {
  const idx = ((i % WHEEL_SIZE) + WHEEL_SIZE) % WHEEL_SIZE;
  return WHEEL[idx];
}

export function wrapIndex(i) {
  return ((i % WHEEL_SIZE) + WHEEL_SIZE) % WHEEL_SIZE;
}
