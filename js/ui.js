export function $(sel) {
  return document.querySelector(sel);
}

export function setText(el, text) {
  if (!el) return;
  el.textContent = (text === null || text === undefined) ? "–" : String(text);
}

export function showMessage(el, text, isError = false) {
  if (!el) return;
  el.textContent = text ?? "";
  el.style.color = isError ? "#ffb4ae" : "";
}

export function renderHistory(listEl, spins) {
  if (!listEl) return;
  listEl.innerHTML = "";
  const last12 = spins.slice(Math.max(0, spins.length - 12)).reverse();

  for (const s of last12) {
    const li = document.createElement("li");
    li.textContent = `${s.number} (${s.dir === "CW" ? "orario" : "antiorario"})`;
    listEl.appendChild(li);
  }
}
