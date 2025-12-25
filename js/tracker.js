import { indexOfNumber } from "./wheel.js";

const STORAGE_KEY = "rz_tracker_v1";

export class Tracker {
  constructor(maxLen = 300) {
    this.maxLen = maxLen;
    this.spins = [];
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) this.spins = parsed.slice(-this.maxLen);
    } catch {
      this.spins = [];
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.spins.slice(-this.maxLen)));
    } catch {
      // ignore storage errors
    }
  }

  reset() {
    this.spins = [];
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  addSpin(number, dir) {
    const idx = indexOfNumber(number);
    if (idx === -1) throw new Error("Numero non valido per ruota europea.");
    const spin = {
      number,
      dir,            // "CW" or "CCW" del colpo inserito
      idx,
      t: Date.now()
    };
    this.spins.push(spin);
    if (this.spins.length > this.maxLen) this.spins.shift();
    this.save();
    return spin;
  }

  undo() {
    const x = this.spins.pop();
    this.save();
    return x;
  }

  count() { return this.spins.length; }
  last() { return this.spins[this.spins.length - 1] ?? null; }

  lastN(n) {
    return this.spins.slice(Math.max(0, this.spins.length - n));
  }
}
