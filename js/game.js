import { PI_DIGITS } from "./config.js";
import { formatTime } from "./utils.js";
import { getBestTime, saveBestTime } from "./storage.js";

export class PiGame {
  constructor(elements, callbacks) {
    this.elements = elements;
    this.callbacks = callbacks;
    this.audioContext = null;
    this.revealTimer = null;
    this.state = this.initialState();
    this.reset();
  }

  initialState() {
    return {
      total: Number(this.elements.mode.value),
      gameType: this.elements.gameType.value,
      index: 0,
      lives: 5,
      wrong: 0,
      running: false,
      finished: false,
      startAt: 0,
      elapsed: 0,
      timer: null,
      streak: 0,
      longest: 0,
      reveal: false,
      runStartedAt: null,
      correctTimes: [],
      fastestTenMs: 0,
      trainingBlocks: new Set(),
      manualHelpCount: 0
    };
  }

  reset() {
    this.stopTimer(false);
    clearTimeout(this.revealTimer);
    this.state = this.initialState();
    this.elements.input.value = "";
    this.elements.input.disabled = true;
    this.elements.mode.disabled = false;
    this.elements.gameType.disabled = false;
    this.elements.start.disabled = false;
    this.elements.trainingReveal.classList.remove("show");
    document.body.classList.toggle("trainingMode", this.state.gameType === "training");
    this.elements.hint.textContent = this.state.gameType === "training"
      ? "Treningsmodus: ingen liv eller medaljer."
      : "Tidtakeren starter når du trykker Start.";
    this.buildGrid();
    this.update();
  }

  start() {
    if (!this.callbacks.canStart()) {
      this.callbacks.requireProfile();
      return;
    }
    this.reset();
    this.state.running = true;
    this.state.runStartedAt = new Date().toISOString();
    this.elements.input.disabled = false;
    this.elements.mode.disabled = true;
    this.elements.gameType.disabled = true;
    this.elements.start.disabled = true;
    this.elements.hint.textContent = this.state.gameType === "training"
      ? "Øv fritt. Ved feil vises tiergruppen i tre sekunder."
      : "Skriv neste siffer. Et feil svar koster ett liv.";
    this.startTimer();
    this.update();
    this.elements.input.focus();
  }

  submit(value) {
    if (!this.state.running || !/^[0-9]$/.test(value) || this.elements.input.disabled) return;

    if (value === PI_DIGITS[this.state.index]) {
      const now = performance.now();
      this.state.correctTimes.push(now);
      if (this.state.correctTimes.length >= 10) {
        const n = this.state.correctTimes.length;
        const windowMs = this.state.correctTimes[n - 1] - this.state.correctTimes[n - 10];
        if (!this.state.fastestTenMs || windowMs < this.state.fastestTenMs) this.state.fastestTenMs = windowMs;
      }

      this.state.index += 1;
      this.state.streak += 1;
      this.state.longest = Math.max(this.state.longest, this.state.streak);
      this.flash("correctFlash");
      this.elements.hint.textContent = "Riktig!";
      this.beep(520, 0.06);

      if (this.state.index >= this.state.total) {
        this.finish(true);
        return;
      }
    } else {
      this.state.wrong += 1;
      this.state.streak = 0;
      this.flash("wrong");
      this.beep(170, 0.1, "sawtooth");

      if (this.state.gameType === "training") {
        this.showTrainingBlock(false);
        return;
      }

      this.state.lives -= 1;
      this.elements.hint.textContent = `Feil siffer. ${this.state.lives} liv igjen.`;
      if (this.state.lives <= 0) {
        this.finish(false);
        return;
      }
    }

    this.elements.input.value = "";
    this.update();
  }

  showTrainingBlock(manual = true) {
    if (!this.state.running || this.state.gameType !== "training") return;
    const blockStart = Math.floor(this.state.index / 10) * 10;
    this.state.trainingBlocks.add(blockStart);
    if (manual) this.state.manualHelpCount += 1;

    const digits = PI_DIGITS.slice(blockStart, Math.min(blockStart + 10, this.state.total));
    this.elements.trainingRevealDigits.innerHTML = [...digits].map((digit, offset) =>
      `<span class="${blockStart + offset === this.state.index ? "target" : ""}">${digit}</span>`
    ).join("");

    this.elements.trainingReveal.classList.add("show");
    this.elements.input.disabled = true;
    this.elements.hint.textContent = manual
      ? "Tiergruppen vises i tre sekunder."
      : "Se tiergruppen. Du fortsetter på samme siffer.";

    clearTimeout(this.revealTimer);
    this.revealTimer = setTimeout(() => {
      this.elements.trainingReveal.classList.remove("show");
      this.elements.input.disabled = false;
      this.elements.input.value = "";
      this.elements.hint.textContent = "Fortsett på samme siffer.";
      this.elements.input.focus();
    }, 3000);
    this.update();
  }

  async finish(completed) {
    this.state.running = false;
    this.state.finished = true;
    this.state.reveal = !completed;
    this.stopTimer(true);
    this.elements.input.disabled = true;
    this.elements.mode.disabled = false;
    this.elements.gameType.disabled = false;
    this.elements.start.disabled = false;

    const digitsPerMinute = this.state.elapsed > 0
      ? this.state.index / (this.state.elapsed / 60000)
      : 0;
    const pace = this.state.elapsed / 1000 / Math.max(1, this.state.total);
    const medal = this.state.gameType === "competition" && completed
      ? pace <= 0.9 ? "Gull" : pace <= 1.5 ? "Sølv" : pace <= 2.3 ? "Bronse" : "Ingen"
      : null;

    const run = {
      id: crypto.randomUUID(),
      name: this.callbacks.getPlayerName(),
      total: this.state.total,
      gameType: this.state.gameType,
      score: this.state.index,
      time: this.state.elapsed,
      completed,
      wrong: this.state.wrong,
      longestStreak: this.state.longest,
      livesRemaining: this.state.gameType === "training" ? null : this.state.lives,
      startedAt: this.state.runStartedAt,
      finishedAt: new Date().toISOString(),
      fastestTenMs: this.state.fastestTenMs,
      digitsPerMinute,
      medal,
      trainingBlocks: [...this.state.trainingBlocks],
      manualHelpCount: this.state.manualHelpCount
    };

    if (completed && this.state.gameType === "competition") {
      saveBestTime(run.total, run.time);
      this.beep(740, 0.16);
      setTimeout(() => this.beep(980, 0.22), 130);
    } else if (!completed && this.state.gameType === "competition") {
      this.beep(150, 0.25, "sawtooth");
    }

    this.update();
    await this.callbacks.onFinish(run);
  }

  startTimer() {
    clearInterval(this.state.timer);
    this.state.startAt = performance.now() - this.state.elapsed;
    this.state.timer = setInterval(() => {
      this.state.elapsed = performance.now() - this.state.startAt;
      this.elements.timer.textContent = formatTime(this.state.elapsed);
    }, 50);
  }

  stopTimer(updateElapsed = true) {
    clearInterval(this.state.timer);
    this.state.timer = null;
    if (updateElapsed && this.state.startAt) this.state.elapsed = performance.now() - this.state.startAt;
  }

  buildGrid() {
    this.elements.grid.innerHTML = "";
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < this.state.total; index += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      fragment.appendChild(cell);
    }
    this.elements.grid.appendChild(fragment);
  }

  updateGrid() {
    [...this.elements.grid.children].forEach((cell, index) => {
      const correct = index < this.state.index;
      const revealed = this.state.reveal && !correct;
      cell.className = `cell${correct ? " correct" : ""}${this.state.running && index === this.state.index ? " current" : ""}${revealed ? " revealed" : ""}`;
      cell.textContent = correct || revealed ? PI_DIGITS[index] : "";
    });
  }

  updateRecent() {
    const start = Math.max(0, this.state.index - 12);
    this.elements.ellipsis.textContent = start > 0 ? "…" : "";
    this.elements.recent.textContent = this.state.index ? PI_DIGITS.slice(start, this.state.index) : "—";
    this.elements.marker.style.display = this.state.running ? "inline-grid" : "none";
  }

  update() {
    const attempts = this.state.index + this.state.wrong;
    const training = this.state.gameType === "training";
    this.elements.modeLine.textContent = `${training ? "Trening" : "Konkurranse"} · ${this.state.total.toLocaleString("no-NO")} desimaler`;
    this.elements.position.textContent = this.state.running
      ? `Posisjon ${this.state.index + 1} av ${this.state.total}`
      : this.state.finished ? `${this.state.index} av ${this.state.total} riktige` : "Trykk Start for å begynne";
    this.elements.lives.textContent = training ? "Ingen liv" : ("♥ ".repeat(this.state.lives).trim() || "0");
    this.elements.timer.textContent = formatTime(this.state.elapsed);
    this.elements.progressText.textContent = `${this.state.index} / ${this.state.total}`;
    this.elements.accuracy.textContent = `${(attempts ? this.state.index / attempts * 100 : 100).toFixed(1)}%`;
    this.elements.progressBar.style.width = `${this.state.index / this.state.total * 100}%`;
    this.elements.record.textContent = training ? "—" :
      getBestTime(this.state.total) ? formatTime(getBestTime(this.state.total), true) : "—";
    document.body.classList.toggle("trainingMode", training);
    this.updateRecent();
    this.updateGrid();
  }

  flash(className) {
    this.elements.input.value = "";
    this.elements.input.classList.remove(className);
    void this.elements.input.offsetWidth;
    this.elements.input.classList.add(className);
  }

  beep(frequency, duration = 0.08, type = "sine") {
    if (!this.elements.sound.checked) return;
    try {
      this.audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      oscillator.connect(gain).connect(this.audioContext.destination);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch {}
  }
}
