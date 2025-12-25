import { wrapIndex } from "./wheel.js";

/**
 * Calcola step (0..36) tra due indici sulla ruota seguendo la direzione indicata
 * per il colpo "corrente" (dir del secondo elemento).
 */
function directionalSteps(prevIdx, currIdx, dir) {
  // Convenzione: CW = aumenti indice, CCW = diminuisci indice
  const size = 37;
  const p = wrapIndex(prevIdx);
  const c = wrapIndex(currIdx);

  if (dir === "CW") {
    // muovo in avanti fino a raggiungere c
    return (c - p + size) % size;
  }
  // CCW: muovo indietro fino a raggiungere c
  return (p - c + size) % size;
}

/**
 * Analyzer con EWMA (media mobile esponenziale) per offset e varianza.
 * Non "prevede" la roulette: stima un offset medio in posizioni-ruota quando
 * una sequenza mostra coerenza meccanica.
 */
export class Analyzer {
  constructor({ alpha = 0.18, beta = 0.18 } = {}) {
    this.alpha = alpha; // per la media
    this.beta = beta;   // per la varianza
    this.reset();
  }

  reset() {
    this.mean = null;      // offset medio stimato (in posizioni ruota)
    this.var = 0;          // varianza EWMA
    this.lastStep = null;
    this.sampleCount = 0;
  }

  /**
   * Aggiorna lo stato usando l'array spins del tracker.
   */
  update(spins) {
    this.reset();
    if (!Array.isArray(spins) || spins.length < 2) return;

    for (let i = 1; i < spins.length; i++) {
      const prev = spins[i - 1];
      const curr = spins[i];
      const step = directionalSteps(prev.idx, curr.idx, curr.dir);

      // ignora step = 0 (ripetizioni immediate) perché spesso rumorose
      // ma le contiamo comunque come campioni deboli
      const x = step;

      if (this.mean === null) {
        this.mean = x;
        this.var = 0;
        this.sampleCount = 1;
      } else {
        // EWMA mean
        const prevMean = this.mean;
        this.mean = prevMean + this.alpha * (x - prevMean);

        // EWMA variance (su residui)
        const resid = x - this.mean;
        this.var = (1 - this.beta) * this.var + this.beta * (resid * resid);

        this.sampleCount++;
      }

      this.lastStep = x;
    }
  }

  get std() {
    return Math.sqrt(Math.max(0, this.var));
  }

  /**
   * Stabilità 0..1 (euristica): più bassa la std, più alta la stabilità.
   */
  stabilityScore() {
    if (this.mean === null) return 0;
    const s = this.std;
    // std 0..12 circa -> mappa a 1..0
    const score = 1 - Math.min(1, s / 12);
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Numero di "vicini" suggeriti (spread) basato su std.
   */
  suggestedNeighbors() {
    if (this.mean === null) return 2;
    const s = this.std;
    if (s < 1.5) return 1;
    if (s < 3.0) return 2;
    if (s < 4.5) return 3;
    if (s < 6.5) return 4;
    return 5;
  }
}
