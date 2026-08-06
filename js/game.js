import { PI_DIGITS, getMedalForPerformance, MAX_DIGITS } from "./config.js";
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
    const gameType = this.elements.gameType.value;
    const rawMode = this.elements.mode.value;
    const custom = gameType === "training" && rawMode === "custom";
    const max = MAX_DIGITS || PI_DIGITS.length;
    let startDigit = 1;
    let endDigit = Number(rawMode) || 100;

    if (custom) {
      const from = Number(this.elements.customStart?.value) || 1;
      const to = Number(this.elements.customEnd?.value) || from;
      startDigit = Math.max(1, Math.min(max, Math.floor(Math.min(from, to))));
      endDigit = Math.max(startDigit, Math.min(max, Math.floor(Math.max(from, to))));
    } else {
      endDigit = Math.min(max, Math.max(1, endDigit));
    }

    return {
      total: endDigit - startDigit + 1,
      displayMode: custom ? `${startDigit}–${endDigit}` : String(endDigit),
      startDigit,
      endDigit,
      startIndex: startDigit - 1,
      custom,
      gameType,
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
    this.setCustomInputsDisabled(false);
    this.elements.start.disabled = false;
    this.elements.trainingReveal.classList.remove("show");
    document.body.classList.toggle("trainingMode", this.state.gameType === "training");
    this.elements.hint.textContent = this.state.gameType === "training"
      ? "Training mode has no lives or medals."
      : "The timer begins with your first digit.";
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
    this.elements.input.disabled = false;
    this.elements.mode.disabled = true;
    this.elements.gameType.disabled = true;
    this.setCustomInputsDisabled(true);
    this.elements.start.disabled = true;
    this.elements.hint.textContent = this.state.gameType === "training"
      ? "Practice freely. After a mistake, the current 10-digit block appears briefly."
      : "Enter the next digit. Each mistake costs one life.";
    this.update();
    this.elements.input.focus();
  }

  setCustomInputsDisabled(disabled) {
    if (!this.elements.customStart || !this.elements.customEnd) return;
    this.elements.customStart.disabled = disabled;
    this.elements.customEnd.disabled = disabled;
  }

  currentDigit() {
    return PI_DIGITS[this.state.startIndex + this.state.index];
  }

  digitAt(localIndex) {
    return PI_DIGITS[this.state.startIndex + localIndex];
  }

  submit(value) {
    if (!this.state.running || !/^[0-9]$/.test(value) || this.elements.input.disabled) return;

    // Start timing only when the player enters the first valid digit.
    if (!this.state.timer) {
      this.state.runStartedAt = new Date().toISOString();
      this.startTimer();
    }

    if (value === this.currentDigit()) {
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
      this.elements.hint.textContent = "Correct!";
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
      this.elements.hint.textContent = `Incorrect digit. ${this.state.lives} ${this.state.lives === 1 ? "life" : "lives"} remaining.`;
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

    // Pause timing while the training overlay blocks all player input.
    // Only resume afterward if the timer had already started.
    const resumeTimerAfterReveal = Boolean(this.state.timer);
    if (resumeTimerAfterReveal) this.stopTimer(true);

    const globalIndex = this.state.startIndex + this.state.index;
    const blockStart = Math.floor(globalIndex / 10) * 10;
    this.state.trainingBlocks.add(blockStart);
    if (manual) this.state.manualHelpCount += 1;

    const digits = PI_DIGITS.slice(blockStart, Math.min(blockStart + 10, PI_DIGITS.length));
    this.elements.trainingRevealDigits.innerHTML = [...digits].map((digit, offset) =>
      `<span class="${blockStart + offset === globalIndex ? "target" : ""}">${digit}</span>`
    ).join("");

    this.elements.trainingReveal.classList.add("show");
    this.elements.input.disabled = true;
    this.elements.hint.textContent = manual
      ? "The current 10-digit block is shown for three seconds."
      : "Review the block, then continue from the same digit.";

    clearTimeout(this.revealTimer);
    this.revealTimer = setTimeout(() => {
      this.elements.trainingReveal.classList.remove("show");
      this.elements.input.disabled = false;
      this.elements.input.value = "";
      this.elements.hint.textContent = "Continue from the same digit.";

      if (this.state.running && resumeTimerAfterReveal) this.startTimer();

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
    this.setCustomInputsDisabled(false);
    this.elements.start.disabled = false;

    const digitsPerMinute = this.state.elapsed > 0
      ? this.state.index / (this.state.elapsed / 60000)
      : 0;
    const elapsedSeconds = this.state.elapsed / 1000;
    const digitsPerSecond = elapsedSeconds > 0
      ? this.state.total / elapsedSeconds
      : 0;
    const medal = this.state.gameType === "competition" && completed
      ? getMedalForPerformance(this.state.total, this.state.elapsed)
      : null;

    const run = {
      id: crypto.randomUUID(),
      name: this.callbacks.getPlayerName(),
      total: this.state.total,
      displayMode: this.state.displayMode,
      startDigit: this.state.startDigit,
      endDigit: this.state.endDigit,
      custom: this.state.custom,
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
      digitsPerSecond,
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
      cell.textContent = correct || revealed ? this.digitAt(index) : "";
    });
  }

  updateRecent() {
    const start = Math.max(0, this.state.index - 12);
    this.elements.ellipsis.textContent = start > 0 ? "…" : "";
    this.elements.recent.textContent = this.state.index ? PI_DIGITS.slice(this.state.startIndex + start, this.state.startIndex + this.state.index) : "—";
    this.elements.marker.style.display = this.state.running ? "inline-grid" : "none";
  }

  update() {
    const attempts = this.state.index + this.state.wrong;
    const training = this.state.gameType === "training";
    this.elements.modeLine.textContent = `${training ? "Training" : "Competition"} · ${this.state.custom ? `digits ${this.state.displayMode}` : `${this.state.total.toLocaleString("en-US")} digits`}`;
    this.elements.position.textContent = this.state.running
      ? `Digit ${this.state.index + 1} of ${this.state.total}`
      : this.state.finished ? `${this.state.index} of ${this.state.total} correct` : "Press Start when you are ready";
    this.elements.lives.innerHTML = training ? '<span class="infiniteLives">∞</span>' : Array.from({length:this.state.lives},()=>"<span>♥</span>").join("");
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
