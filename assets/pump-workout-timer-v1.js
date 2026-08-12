(() => {
  const TIMER_ID = "pump-rest-timer";
  const PRESETS = [30, 45, 60, 90, 120];

  let selectedSeconds = 60;
  let remainingSeconds = selectedSeconds;
  let endTime = 0;
  let intervalId = null;

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(0, seconds);
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = safeSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  };

  const timerElement = () => document.getElementById(TIMER_ID);

  const playFinishedAlert = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const context = new AudioContext();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = 880;
        gain.gain.setValueAtTime(0.18, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.55);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.55);
      }
    } catch (_) {
      // Some browsers block audio; the visual alert still works.
    }
    navigator.vibrate?.([180, 90, 180]);
  };

  const updateTimer = () => {
    const timer = timerElement();
    if (!timer) return;

    const display = timer.querySelector("[data-timer-display]");
    const toggle = timer.querySelector("[data-timer-toggle]");
    if (display) display.textContent = formatTime(remainingSeconds);
    if (toggle) {
      toggle.textContent = intervalId
        ? "עצירה"
        : remainingSeconds === 0
          ? "התחל מחדש"
          : remainingSeconds < selectedSeconds
            ? "המשך"
            : "התחלה";
    }

    timer.classList.toggle("is-running", Boolean(intervalId));
    timer.classList.toggle("is-finished", remainingSeconds === 0);
    timer.querySelectorAll("[data-timer-preset]").forEach((button) => {
      button.classList.toggle("active", Number(button.dataset.timerPreset) === selectedSeconds);
    });
  };

  const stopTimer = () => {
    if (intervalId) window.clearInterval(intervalId);
    intervalId = null;
  };

  const tick = () => {
    remainingSeconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    if (remainingSeconds === 0) {
      stopTimer();
      playFinishedAlert();
    }
    updateTimer();
  };

  const startTimer = () => {
    if (remainingSeconds === 0) remainingSeconds = selectedSeconds;
    endTime = Date.now() + remainingSeconds * 1000;
    stopTimer();
    intervalId = window.setInterval(tick, 250);
    updateTimer();
  };

  const toggleTimer = () => {
    if (intervalId) {
      remainingSeconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      stopTimer();
      updateTimer();
      return;
    }
    startTimer();
  };

  const resetTimer = () => {
    stopTimer();
    remainingSeconds = selectedSeconds;
    updateTimer();
  };

  const choosePreset = (seconds) => {
    selectedSeconds = seconds;
    remainingSeconds = seconds;
    stopTimer();
    updateTimer();
  };

  const buildTimer = () => {
    const section = document.createElement("section");
    section.id = TIMER_ID;
    section.className = "rest-timer";
    section.setAttribute("aria-label", "טיימר מנוחה בין תרגילים");
    section.innerHTML = `
      <header class="rest-timer-head">
        <div>
          <small>מנוחה בין סטים</small>
          <h2>טיימר אימון</h2>
        </div>
        <span class="rest-timer-status">●</span>
      </header>
      <div class="rest-timer-display" data-timer-display aria-live="polite">01:00</div>
      <div class="rest-timer-presets" aria-label="בחירת זמן מנוחה">
        ${PRESETS.map((seconds) => `<button type="button" data-timer-preset="${seconds}">${seconds < 60 ? `${seconds} שנ׳` : `${seconds / 60} דק׳`}</button>`).join("")}
      </div>
      <div class="rest-timer-actions">
        <button type="button" class="rest-timer-reset" data-timer-reset>איפוס</button>
        <button type="button" class="rest-timer-toggle" data-timer-toggle>התחלה</button>
      </div>
      <p>בסיום הזמן תופיע התראה ורטט, אם המכשיר תומך בכך.</p>
    `;

    section.querySelectorAll("[data-timer-preset]").forEach((button) => {
      button.addEventListener("click", () => choosePreset(Number(button.dataset.timerPreset)));
    });
    section.querySelector("[data-timer-toggle]").addEventListener("click", toggleTimer);
    section.querySelector("[data-timer-reset]").addEventListener("click", resetTimer);
    return section;
  };

  const removeWaterTracking = () => {
    document.querySelectorAll(".water").forEach((element) => element.remove());
    document.querySelectorAll(".metrics > span").forEach((metric) => {
      if (metric.querySelector("small")?.textContent.trim() === "כוסות מים") metric.remove();
    });
  };

  const mountTimer = () => {
    const trainingScreen = [...document.querySelectorAll(".screen")].find(
      (screen) => screen.querySelector(".kicker")?.textContent.trim() === "כושר מותאם",
    );
    if (!trainingScreen || timerElement()) return;

    const timer = buildTimer();
    const weeklyPlan = trainingScreen.querySelector(".weekly-plan, .restarter-card");
    if (weeklyPlan) weeklyPlan.before(timer);
    else trainingScreen.querySelector(".training-tip")?.before(timer);
    updateTimer();
  };

  let scheduled = false;
  const applyEnhancements = () => {
    scheduled = false;
    removeWaterTracking();
    mountTimer();
  };

  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(applyEnhancements);
  }).observe(document.documentElement, { childList: true, subtree: true });

  applyEnhancements();
})();
