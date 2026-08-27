/**
 * ============================================================
 *  SCRIPT.JS — drives the whole click-based experience.
 *  Reads everything from window.CONFIG (config.js).
 * ============================================================
 */
(function () {
  "use strict";

  const cfg = window.CONFIG || {};

  /* ---------------------------------------------------------
     STATE
     --------------------------------------------------------- */
  const state = {
    screen: "opening",
    history: [],
    selectedDate: null,      // "2026-08-29"
    selectedTime: null,      // "19:00"
    selectedActivity: null,  // activity id
    rsvp: null,               // "yes" | "maybe" | "no"
    calendarViewYear: 2026,
    calendarViewMonth: 7     // 0-indexed (7 = August)
  };

  const STEP_SCREENS = ["pick-day", "pick-time", "plan", "summary", "rsvp", "details"];

  /* ---------------------------------------------------------
     COPY — apply config text into the DOM once
     --------------------------------------------------------- */
  function applyCopy() {
    document.querySelectorAll("[data-copy]").forEach((el) => {
      const key = el.getAttribute("data-copy");
      const value = cfg.invitation && cfg.invitation[key];
      if (value) el.textContent = value;
    });
    document.title = (cfg.invitation && cfg.invitation.openingEyebrow) || document.title;
  }

  /* ---------------------------------------------------------
     MEDIA — opening/intro/song/final photos from config
     --------------------------------------------------------- */
  function applyMedia() {
    const media = cfg.media || {};

    const openingScreen = document.querySelector('.screen[data-screen="opening"]');
    if (openingScreen && media.openingBackground) {
      openingScreen.style.backgroundImage = 'url("' + media.openingBackground + '")';
      openingScreen.classList.add("screen--has-bg");
    }

    const finalScreen = document.querySelector('.screen[data-screen="final"]');
    if (finalScreen && media.finalBackground) {
      finalScreen.style.backgroundImage = 'url("' + media.finalBackground + '")';
      finalScreen.classList.add("screen--has-bg");
    }

    const photoReveal = document.getElementById("photoReveal");
    if (photoReveal && media.photoReveal) {
      photoReveal.src = media.photoReveal;
      photoReveal.hidden = false;
    }

    const song = cfg.song || {};
    const songLabel = document.getElementById("songLabel");
    if (songLabel && song.label) songLabel.textContent = song.label;

    const songCaption = document.getElementById("songCaption");
    if (songCaption && song.caption) songCaption.textContent = song.caption;

    const songQuote = document.getElementById("songQuote");
    if (songQuote) {
      if (song.quote) {
        songQuote.textContent = song.quote;
        songQuote.hidden = false;
      } else {
        songQuote.hidden = true;
      }
    }

    const songPhoto = document.getElementById("songPhoto");
    if (songPhoto && song.photo) {
      songPhoto.src = song.photo;
      songPhoto.hidden = false;
    }
  }

  /* ---------------------------------------------------------
     NAVIGATION
     --------------------------------------------------------- */
  function goTo(name, isBack) {
    const current = document.querySelector('.screen[data-screen="' + state.screen + '"]');
    const next = document.querySelector('.screen[data-screen="' + name + '"]');
    if (!next) return;

    if (!isBack) state.history.push(state.screen);
    if (current) current.classList.remove("is-active");
    next.classList.add("is-active");
    state.screen = name;

    updateProgress();
    // move focus to the new screen's heading for accessibility
    const heading = next.querySelector("h1, h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
    next.scrollTop = 0;
  }

  function goBack(target) {
    const dest = target || state.history.pop() || "opening";
    goTo(dest, true);
  }

  function updateProgress() {
    const bar = document.getElementById("progress");
    const idx = STEP_SCREENS.indexOf(state.screen);
    if (idx === -1) {
      bar.classList.remove("is-visible");
      return;
    }
    bar.classList.add("is-visible");
    bar.querySelectorAll(".progress__dot").forEach((dot, i) => {
      dot.classList.toggle("is-current", i === idx);
      dot.classList.toggle("is-done", i < idx);
    });
  }

  document.addEventListener("click", (e) => {
    const nextBtn = e.target.closest("[data-next]");
    if (nextBtn && !nextBtn.disabled) {
      goTo(nextBtn.getAttribute("data-next"));
      return;
    }
    const backBtn = e.target.closest("[data-back]");
    if (backBtn) {
      goBack(backBtn.getAttribute("data-back"));
    }
  });

  /* ---------------------------------------------------------
     DATE HELPERS
     --------------------------------------------------------- */
  function toISO(y, m, d) {
    const mm = String(m + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return y + "-" + mm + "-" + dd;
  }
  function parseISO(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  function getDateStatus(iso) {
    const overrides = cfg.dateOverrides || {};
    if (overrides[iso]) {
      return overrides[iso];
    }
    const date = parseISO(iso);
    const start = parseISO(cfg.dates.startDate);
    const end = parseISO(cfg.dates.endDate);
    if (date < start || date > end) return { status: "unavailable", times: [] };
    if (cfg.dates.onlyWeekends && !isWeekend(date)) return { status: "unavailable", times: [] };
    return { status: "available", times: cfg.dates.availableTimes };
  }

  /* ---------------------------------------------------------
     CALENDAR RENDER
     --------------------------------------------------------- */
  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  function renderCalendar() {
    const grid = document.getElementById("calGrid");
    const label = document.getElementById("calLabel");
    const y = state.calendarViewYear;
    const m = state.calendarViewMonth;
    label.textContent = MONTH_NAMES[m] + " " + y;

    const first = new Date(y, m, 1);
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const startOffset = first.getDay();

    grid.innerHTML = "";

    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement("span");
      empty.className = "cal-cell is-empty";
      grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const iso = toISO(y, m, d);
      const info = getDateStatus(iso);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal-cell";
      btn.textContent = d;

      if (info.status === "available") {
        btn.classList.add("is-available");
        btn.setAttribute("aria-label", MONTH_NAMES[m] + " " + d + ", available");
        if (state.selectedDate === iso) btn.classList.add("is-selected");
        btn.addEventListener("click", () => selectDate(iso));
      } else {
        btn.classList.add("is-disabled");
        btn.disabled = true;
        btn.setAttribute("aria-label", MONTH_NAMES[m] + " " + d + ", unavailable");
      }
      grid.appendChild(btn);
    }

    // month nav bounds
    const start = parseISO(cfg.dates.startDate);
    const end = parseISO(cfg.dates.endDate);
    const prevBtn = document.getElementById("calPrev");
    const nextBtn = document.getElementById("calNext");
    prevBtn.disabled = (y === start.getFullYear() && m <= start.getMonth());
    nextBtn.disabled = (y === end.getFullYear() && m >= end.getMonth());
  }

  function selectDate(iso) {
    state.selectedDate = iso;
    state.selectedTime = null; // reset time when date changes
    renderCalendar();

    const note = document.getElementById("daySelectedNote");
    const dateEl = note.querySelector(".selected-note__date");
    dateEl.textContent = formatDateLong(iso);
    note.hidden = false;

    document.getElementById("pickDayBtn").disabled = false;
  }

  function formatDateLong(iso) {
    const d = parseISO(iso);
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    const month = d.toLocaleDateString("en-US", { month: "long" });
    return weekday + ", " + month + " " + d.getDate();
  }

  document.getElementById("calPrev").addEventListener("click", () => {
    state.calendarViewMonth--;
    if (state.calendarViewMonth < 0) { state.calendarViewMonth = 11; state.calendarViewYear--; }
    renderCalendar();
  });
  document.getElementById("calNext").addEventListener("click", () => {
    state.calendarViewMonth++;
    if (state.calendarViewMonth > 11) { state.calendarViewMonth = 0; state.calendarViewYear++; }
    renderCalendar();
  });

  /* ---------------------------------------------------------
     TIME SCREEN
     --------------------------------------------------------- */
  function renderTimeScreen() {
    const subtitle = document.getElementById("pickTimeSubtitle");
    subtitle.textContent = state.selectedDate ? formatDateLong(state.selectedDate) : "";

    const info = state.selectedDate ? getDateStatus(state.selectedDate) : { times: [] };
    const grid = document.getElementById("timeGrid");
    grid.innerHTML = "";
    state.selectedTime = state.selectedTime && info.times.includes(state.selectedTime) ? state.selectedTime : null;
    document.getElementById("pickTimeBtn").disabled = !state.selectedTime;
    document.getElementById("timeSelectedNote").hidden = true;

    (info.times || []).forEach((t) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "time-card";
      btn.textContent = t;
      btn.setAttribute("role", "option");
      if (t === state.selectedTime) btn.classList.add("is-selected");
      btn.addEventListener("click", () => selectTime(t));
      grid.appendChild(btn);
    });
  }

  function selectTime(t) {
    state.selectedTime = t;
    renderTimeScreen();
    const note = document.getElementById("timeSelectedNote");
    note.querySelector(".selected-note__date").textContent = t + " it is.";
    note.hidden = false;
    document.getElementById("pickTimeBtn").disabled = false;
  }

  /* ---------------------------------------------------------
     ACTIVITY / PLAN SCREEN
     --------------------------------------------------------- */
  function renderActivities() {
    const grid = document.getElementById("activityGrid");
    grid.innerHTML = "";
    (cfg.activities || []).forEach((a) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "activity-card";
      card.setAttribute("role", "listitem");
      card.innerHTML =
        '<span class="activity-card__icon" aria-hidden="true">' + a.icon + '</span>' +
        '<span class="activity-card__title">' + a.title + '</span>' +
        '<span class="activity-card__desc">' + a.description + '</span>';
      if (state.selectedActivity === a.id) card.classList.add("is-selected");
      card.addEventListener("click", () => selectActivity(a.id));
      grid.appendChild(card);
    });
  }

  function selectActivity(id) {
    state.selectedActivity = id;
    renderActivities();
    document.getElementById("pickPlanBtn").disabled = false;
  }

  /* ---------------------------------------------------------
     SUMMARY SCREEN
     --------------------------------------------------------- */
  function renderSummary() {
    document.getElementById("summaryDate").textContent = state.selectedDate ? formatDateLong(state.selectedDate) : "\u2014";
    document.getElementById("summaryTime").textContent = state.selectedTime || "\u2014";
    const activity = (cfg.activities || []).find((a) => a.id === state.selectedActivity);
    document.getElementById("summaryActivity").textContent = activity ? (activity.icon + " " + activity.title) : "\u2014";

    const venue = cfg.venue || {};
    document.getElementById("summaryVenueName").textContent = venue.name || "\u2014";
    document.getElementById("summaryVenueAddress").textContent = venue.address || "";
    const link = document.getElementById("viewLocationBtn");
    link.href = venue.mapsUrl || "#";

    const summaryCfg = cfg.summary || {};
    const photos = summaryCfg.photos || [];
    const strip = document.getElementById("summaryPhotostrip");
    if (photos.length) {
      [1, 2, 3, 4].forEach((n, i) => {
        const img = document.getElementById("stripImg" + n);
        const src = photos[i] || photos[photos.length - 1];
        img.src = src || "";
        img.alt = "us";
      });
      strip.hidden = false;
    } else {
      strip.hidden = true;
    }
  }

  /* ---------------------------------------------------------
     GOOGLE CALENDAR LINK
     --------------------------------------------------------- */
  function buildGoogleCalendarUrl() {
    if (!state.selectedDate || !state.selectedTime) return "#";
    const [h, m] = state.selectedTime.split(":").map(Number);
    const start = parseISO(state.selectedDate);
    start.setHours(h, m, 0, 0);
    const durationMin = (cfg.calendar && cfg.calendar.durationMinutes) || 120;
    const end = new Date(start.getTime() + durationMin * 60000);

    const fmt = (d) =>
      d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0") + "T" +
      String(d.getHours()).padStart(2, "0") +
      String(d.getMinutes()).padStart(2, "0") + "00";

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: (cfg.calendar && cfg.calendar.title) || "A Date",
      dates: fmt(start) + "/" + fmt(end),
      details: (cfg.calendar && cfg.calendar.description) || "",
      location: (cfg.venue && cfg.venue.address) || ""
    });
    return "https://calendar.google.com/calendar/render?" + params.toString();
  }

  /* ---------------------------------------------------------
     RSVP SCREEN
     --------------------------------------------------------- */
  document.querySelectorAll(".rsvp-card").forEach((card) => {
    card.addEventListener("click", () => {
      const choice = card.getAttribute("data-rsvp");
      state.rsvp = choice;
      document.querySelectorAll(".rsvp-card").forEach((c) => c.classList.remove("is-chosen"));
      card.classList.add("is-chosen");
      playRsvpAnimation(choice);
      setTimeout(() => goTo("details"), 650);
    });
  });

  function playRsvpAnimation(choice) {
    const layer = document.getElementById("rsvpParticles");
    layer.innerHTML = "";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const symbols = choice === "yes" ? ["\u2728","\ud83e\udd42","\ud83d\udc9b"]
      : choice === "maybe" ? ["\ud83d\udc40","\u2753"]
      : ["\ud83e\udd72"];
    const count = choice === "yes" ? 18 : choice === "maybe" ? 8 : 4;

    for (let i = 0; i < count; i++) {
      const span = document.createElement("span");
      span.className = "particle";
      span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      span.style.left = Math.random() * 100 + "vw";
      span.style.animationDelay = (Math.random() * 0.4) + "s";
      span.style.fontSize = (0.9 + Math.random() * 0.8) + "rem";
      layer.appendChild(span);
    }
    setTimeout(() => { layer.innerHTML = ""; }, 2200);
  }

  /* ---------------------------------------------------------
     FORM SUBMISSION
     --------------------------------------------------------- */
  const SUBMISSION_KEY = "dateInvite.submission";

  document.getElementById("detailsForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("guestName");
    const messageInput = document.getElementById("guestMessage");
    const errorEl = document.getElementById("formError");

    if (!nameInput.value.trim()) {
      errorEl.hidden = false;
      nameInput.focus();
      return;
    }
    errorEl.hidden = true;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = "Sending\u2026";

    const payload = {
      timestamp: new Date().toISOString(),
      name: nameInput.value.trim(),
      response: state.rsvp,
      date: state.selectedDate,
      time: state.selectedTime,
      activity: state.selectedActivity,
      venue: (cfg.venue && cfg.venue.name) || "",
      message: messageInput.value.trim()
    };

    try {
      await submitToSheet(payload);
    } catch (err) {
      // Fail quietly — the experience continues even if the sheet is unreachable.
      console.warn("Could not reach Google Sheets:", err);
    }

    try {
      localStorage.setItem(SUBMISSION_KEY, JSON.stringify(payload));
    } catch (err) { /* localStorage unavailable — non-fatal */ }

    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;

    renderFinal(payload);
    goTo("final");
  });

  function submitToSheet(payload) {
    const url = cfg.googleAppsScriptUrl;
    if (!url || url === "YOUR_GOOGLE_APPS_SCRIPT_URL") {
      return Promise.resolve(); // not configured yet — skip network call
    }
    return fetch(url, {
      method: "POST",
      mode: "no-cors", // Apps Script web apps typically require this from static hosting
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
  }

  /* ---------------------------------------------------------
     FINAL REVEAL
     --------------------------------------------------------- */
  function renderFinal(payload) {
    const messages = (cfg.finalMessages && cfg.finalMessages[payload.response]) || {
      title: "Thank you.",
      body: "I'll be in touch."
    };
    document.getElementById("finalTitle").textContent = messages.title;
    document.getElementById("finalBody").textContent = messages.body;
  }

  document.getElementById("editResponseBtn").addEventListener("click", () => {
    goTo("rsvp");
  });

  /* ---------------------------------------------------------
     DUPLICATE SUBMISSION CHECK
     --------------------------------------------------------- */
  function checkPriorSubmission() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(SUBMISSION_KEY) || "null");
    } catch (err) { saved = null; }
    if (!saved) return;

    // Pre-fill state so "edit" picks up where they left off.
    state.selectedDate = saved.date || null;
    state.selectedTime = saved.time || null;
    state.selectedActivity = saved.activity || null;
    state.rsvp = saved.response || null;
    if (state.selectedDate) {
      const d = parseISO(state.selectedDate);
      state.calendarViewYear = d.getFullYear();
      state.calendarViewMonth = d.getMonth();
    }
    document.getElementById("guestName").value = saved.name || "";
    document.getElementById("guestMessage").value = saved.message || "";
  }

  /* ---------------------------------------------------------
     MUSIC TOGGLE
     --------------------------------------------------------- */
  const MUSIC_KEY = "dateInvite.musicOn";
  function initMusic() {
    const toggle = document.getElementById("musicToggle");
    const audio = document.getElementById("bgMusic");
    const musicCfg = cfg.music || {};

    if (!musicCfg.enabled || !musicCfg.file) {
      toggle.style.display = "none";
      return;
    }
    audio.src = musicCfg.file;

    let on = false;
    try { on = localStorage.getItem(MUSIC_KEY) === "true"; } catch (err) { /* ignore */ }

    function setState(playing) {
      on = playing;
      toggle.classList.toggle("is-playing", on);
      toggle.setAttribute("aria-pressed", String(on));
      try { localStorage.setItem(MUSIC_KEY, String(on)); } catch (err) { /* ignore */ }
      if (on) {
        audio.play().catch(() => { /* browser blocked autoplay — user can retry */ });
      } else {
        audio.pause();
      }
    }

    toggle.addEventListener("click", () => setState(!on));

    // Never autoplay with sound — only resume if the user previously opted in
    // AND this click is the result of direct interaction (the Open button).
    document.querySelector('[data-screen="opening"] [data-next]').addEventListener("click", () => {
      if (on) setState(true);
    }, { once: true });
  }

  /* ---------------------------------------------------------
     INIT
     --------------------------------------------------------- */
  function init() {
    applyCopy();
    applyMedia();
    checkPriorSubmission();
    renderCalendar();
    renderTimeScreen();
    renderActivities();
    initMusic();

    // recompute dynamic screens right before they're shown
    document.querySelectorAll("[data-next]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-next");
        if (target === "pick-time") renderTimeScreen();
        if (target === "plan") renderActivities();
        if (target === "summary") renderSummary();
        if (target === "calendar") {
          document.getElementById("gcalBtn").href = buildGoogleCalendarUrl();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
