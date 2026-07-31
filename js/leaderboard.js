import { cleanUsername, escapeHtml, formatTime } from "./utils.js";
import { getLocalRuns } from "./storage.js";

export class Leaderboard {
  constructor({ profile, elements, onRunSelect }) {
    this.profile = profile;
    this.elements = elements;
    this.onRunSelect = onRunSelect;
    this.type = "failed";
    this.rows = [];
  }

  setProfile(profile) {
    this.profile = profile;
  }

  async load() {
    this.renderTabs();
    this.rows = this.getLocalRows();
    this.render();
  }

  renderTabs() {
    document.querySelectorAll(".boardTab").forEach((button) => {
      button.classList.toggle("active", button.dataset.board === this.type);
    });
  }

  getLocalRows() {
    const search = cleanUsername(this.elements.search.value).toLowerCase();
    let runs = getLocalRuns().filter((run) =>
      !search || run.name.toLowerCase().includes(search)
    );

    if (this.type === "overall") {
      const grouped = new Map();

      for (const run of runs) {
        const item = grouped.get(run.name) || {
          username: run.name,
          completedModes: new Set(),
          totalRuns: 0,
          completedRuns: 0,
          bestScore: 0,
          totalCorrect: 0
        };

        item.totalRuns += 1;
        item.totalCorrect += run.score;
        item.bestScore = Math.max(item.bestScore, run.score);

        if (run.completed) {
          item.completedRuns += 1;
          item.completedModes.add(run.total);
        }

        grouped.set(run.name, item);
      }

      return [...grouped.values()]
        .map((item) => ({
          username: item.username,
          completed_modes: item.completedModes.size,
          total_runs: item.totalRuns,
          completed_runs: item.completedRuns,
          best_score: item.bestScore,
          total_correct: item.totalCorrect
        }))
        .sort((a, b) =>
          b.completed_modes - a.completed_modes ||
          b.best_score - a.best_score ||
          b.total_correct - a.total_correct ||
          a.username.localeCompare(b.username)
        );
    }

    return runs
      .filter((run) =>
        run.total === Number(this.elements.mode.value) &&
        (run.gameType || "competition") === this.elements.gameType.value &&
        run.completed === (this.type === "completed")
      )
      .sort((a, b) =>
        this.type === "completed"
          ? a.time - b.time
          : b.score - a.score || a.time - b.time
      )
      .slice(0, 100);
  }

  render() {
    if (!this.rows.length) {
      this.elements.leaderboard.innerHTML =
        '<p class="empty">Ingen resultater ennå.</p>';
      return;
    }

    if (this.type === "overall") {
      this.elements.leaderboard.innerHTML = `
        <table class="boardTable">
          <thead>
            <tr>
              <th>#</th>
              <th>Spiller</th>
              <th>Forsøk</th>
              <th>Fullførte</th>
              <th>Beste</th>
            </tr>
          </thead>
          <tbody>
            ${this.rows.map((row, index) => `
              <tr>
                <td>${index + 1}</td>
                <td class="${row.username === this.profile?.username ? "you" : ""}">
                  ${escapeHtml(row.username)}
                </td>
                <td>${row.total_runs}</td>
                <td>${row.completed_runs}</td>
                <td>${row.best_score}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>`;
      return;
    }

    const mode = Number(this.elements.mode.value);

    this.elements.leaderboard.innerHTML = `
      <table class="boardTable">
        <thead>
          <tr>
            <th>#</th>
            <th>Spiller</th>
            <th>${this.type === "completed" ? "Tid" : "Poeng"}</th>
            <th>${this.type === "completed" ? "Medalje" : "Tid"}</th>
          </tr>
        </thead>
        <tbody>
          ${this.rows.map((run, index) => `
            <tr class="runRow" data-run-id="${escapeHtml(run.id)}" tabindex="0" role="button">
              <td>${index + 1}</td>
              <td class="${run.name === this.profile?.username ? "you" : ""}">
                ${escapeHtml(run.name)}
              </td>
              <td>${this.type === "completed"
                ? formatTime(run.time, true)
                : `${run.score}/${mode}`}</td>
              <td>${this.type === "completed"
                ? this.medalLabel(run)
                : formatTime(run.time, true)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>`;

    this.elements.leaderboard.querySelectorAll(".runRow").forEach((row) => {
      const openRun = () => {
        const run = this.rows.find((item) => item.id === row.dataset.runId);
        if (run) this.onRunSelect?.(run);
      };

      row.addEventListener("click", openRun);
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openRun();
        }
      });
    });
  }

  medalLabel(run) {
    const pace = run.time / 1000 / run.total;
    if (pace <= 0.9) return "🥇 Gull";
    if (pace <= 1.5) return "🥈 Sølv";
    if (pace <= 2.3) return "🥉 Bronse";
    return "Ingen";
  }
}
