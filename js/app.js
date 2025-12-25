import { Tracker } from "./tracker.js";
import { Analyzer } from "./analyzer.js";
import { predictZones, inferNextDirection } from "./predictor.js";
import { $, setText, showMessage, renderHistory } from "./ui.js";

const tracker = new Tracker(400);
tracker.load();

const analyzer = new Analyzer({ alpha: 0.18, beta: 0.18 });

const numInput = $("#numInput");
const dirInput = $("#dirInput");
const addBtn = $("#addBtn");
const undoBtn = $("#undoBtn");
const resetBtn = $("#resetBtn");

const msg = $("#msg");
const zoneAEl = $("#zoneA");
const zoneBEl = $("#zoneB");
const countEl = $("#count");
const nextDirEl = $("#nextDir");
const stabilityEl = $("#stability");
const neighborsEl = $("#neighbors");
const historyEl = $("#history");

function refresh() {
  const spins = tracker.spins;

  analyzer.update(spins);

  const nextDir = inferNextDirection(spins);
  const pred = predictZones({
    lastSpin: tracker.last(),
    analyzer,
    nextDir
  });

  setText(zoneAEl, pred.zoneA);
  setText(zoneBEl, pred.zoneB);

  setText(countEl, tracker.count());
  setText(nextDirEl, nextDir === "CW" ? "Orario" : "Antiorario");

  const stab = analyzer.stabilityScore();
  const stabLabel =
    analyzer.mean === null ? "–" :
    stab > 0.75 ? "Alta" :
    stab > 0.55 ? "Media" : "Bassa";

  setText(stabilityEl, stabLabel);
  setText(neighborsEl, analyzer.mean === null ? "–" : `± ${analyzer.suggestedNeighbors()}`);

  renderHistory(historyEl, spins);
}

function parseNumber(v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 36) return null;
  return n;
}

addBtn.addEventListener("click", () => {
  const n = parseNumber(numInput.value);
  const dir = dirInput.value;

  if (n === null) {
    showMessage(msg, "Inserisci un numero valido 0–36.", true);
    return;
  }

  try {
    tracker.addSpin(n, dir);
    showMessage(msg, "Colpo aggiunto.");
    numInput.value = "";
    numInput.focus();
    refresh();
  } catch (e) {
    showMessage(msg, e?.message ?? "Errore.", true);
  }
});

undoBtn.addEventListener("click", () => {
  const x = tracker.undo();
  showMessage(msg, x ? "Ultimo colpo annullato." : "Niente da annullare.");
  refresh();
});

resetBtn.addEventListener("click", () => {
  tracker.reset();
  analyzer.reset();
  showMessage(msg, "Reset completato.");
  refresh();
});

// Enter per aggiungere rapidamente
numInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addBtn.click();
});

refresh();
