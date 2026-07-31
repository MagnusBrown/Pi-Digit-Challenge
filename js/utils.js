export const $ = (id) => document.getElementById(id);

export function cleanUsername(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

export function formatTime(ms, precise = false) {
  if (!Number.isFinite(ms)) return "—";
  const value = Math.max(0, Math.round(ms));
  const minutes = Math.floor(value / 60000);
  const seconds = Math.floor((value % 60000) / 1000);
  if (!precise) {
    const tenths = Math.floor((value % 1000) / 100);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
  }
  const millis = value % 1000;
  return `${minutes}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

export function showToast(element, message, error = false) {
  element.textContent = message;
  element.className = `toast show${error ? " error" : ""}`;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    element.className = "toast";
  }, 3600);
}
