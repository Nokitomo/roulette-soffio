import { numberAtIndex, wrapIndex } from "./wheel.js";

/**
 * Predice due centri-zona:
 * - Zona A: ultimo indice +/- offset medio nella direzione del prossimo colpo
 * - Zona B: opposto (18 posizioni) per coprire simmetria/seconda area
 */
export function predictZones({ lastSpin, analyzer, nextDir }) {
  if (!lastSpin || analyzer.mean === null) {
    return {
      zoneA: null,
      zoneB: null,
      nextDir
    };
  }

  // Offset stimato (posizioni ruota)
  // arrotondo al più vicino intero
  const offset = Math.round(analyzer.mean);

  // Convenzione: CW = +offset, CCW = -offset
  const delta = (nextDir === "CW") ? offset : -offset;

  const idxA = wrapIndex(lastSpin.idx + delta);
  const idxB = wrapIndex(idxA + 18); // opposto su 37 ~ 18 posizioni

  return {
    zoneA: numberAtIndex(idxA),
    zoneB: numberAtIndex(idxB),
    nextDir
  };
}

/**
 * Alternanza semplice del verso (come hai descritto).
 * Se non c'è storico, default CW.
 */
export function inferNextDirection(spins) {
  const last = spins?.[spins.length - 1];
  if (!last) return "CW";
  return last.dir === "CW" ? "CCW" : "CW";
}
