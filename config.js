/**
 * ============================================================
 *  CONFIG.JS — edit everything here. The whole site reads
 *  from this file. You should not need to touch index.html,
 *  style.css or script.js to personalize the invitation.
 * ============================================================
 */

const CONFIG = {

  // ---- Who's asking, who's being asked -------------------
  person: {
    inviterName: "Nanda",     // your name
    guestName: "Tya"          // her/his name (used in personal touches)
  },

  // ---- Opening / intro / question copy --------------------
  invitation: {
    openingEyebrow: "A little something for you.",
    openingHint: "Open when you're curious.",
    openingButton: "Open it \u2192",

    introTitle: "Hello, Tya.",
    introBody: "I\u2019ve been meaning to ask you something.",
    introButton: "What is it?",

    questionTitle: "I think we should go on a date.",
    questionSubtitle: "So\u2026 what do you think?",
    questionButton: "Okay, tell me more \u2192"
  },

  // ---- Date availability ------------------------------------
  dates: {
    startDate: "2026-08-25",
    endDate: "2026-09-30",
    onlyWeekends: true,

    availableTimes: [
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00"
    ]
  },

  // ---- Per-date overrides. Overrides win over onlyWeekends. --
  // Example:
  // "2026-08-29": { status: "unavailable", times: ["18:00","19:00","20:00"] },
  // "2026-09-05": { status: "unavailable", times: [] }
  dateOverrides: {},

  // ---- Date plan options ------------------------------------
  activities: [
    { id: "coffee",  title: "Coffee",  icon: "\u2615", description: "Talk about random things." },
    { id: "dinner",  title: "Dinner",  icon: "\ud83c\udf5d", description: "Let's find something actually good." },
    { id: "walk",    title: "Walk",    icon: "\ud83c\udf06", description: "No destination. Just vibes." },
    { id: "movie",   title: "Movie",   icon: "\ud83c\udfac", description: "Snacks are mandatory." },
    { id: "surprise",title: "Surprise",icon: "\u2728", description: "You'll find out later." }
  ],

  activitySettings: {
    multipleSelection: false
  },

  // ---- Photobooth-style photo strip on the "Here's the plan" screen --
  // Provide up to 4 photos (2x2 grid, photobooth style). Leave the
  // array empty [] to hide the strip entirely.
  summary: {
    photos: [
      "assets/images/strip-1.jpg",
      "assets/images/strip-2.jpg",
      "assets/images/strip-3.jpg",
      "assets/images/strip-4.jpg"
    ]
  },

  // ---- Venue -------------------------------------------------
  venue: {
    name: "TBD \u2014 pick a spot",
    address: "Somewhere good, we'll figure it out",
    mapsUrl: "https://maps.google.com"
  },

  // ---- Google Calendar -----------------------------------------
  calendar: {
    title: "A Date With Nanda",
    durationMinutes: 120,
    description: "Looking forward to seeing you."
  },

  // ---- Google Apps Script endpoint (see README) -----------------
  googleAppsScriptUrl: "YOUR_GOOGLE_APPS_SCRIPT_URL",

  // ---- Background music ----------------------------------------
  music: {
    enabled: true,
    file: "assets/music/background.mp3"
  },

  // ---- The "song" screen (vinyl + polaroid card) ----------------
  song: {
    label: "Old Fashioned",
    caption: "Tap play to hear.",
    quote: "",              // optional short line shown under the card
    photo: "assets/images/song 3.jpg"
  },

  // ---- Media used throughout the experience ----------------------
  media: {
    openingBackground: "assets/images/opening.jpg",
    photoReveal: "assets/images/hey.jpg",             // small editorial photo shown mid-flow
    finalBackground: ""          // final reveal background
  },

  // ---- Final reveal copy, per response ----------------------------
  finalMessages: {
    yes: {
      title: "Okay, it's a date. \u2728",
      body: "See you soon. I'm looking forward to it."
    },
    maybe: {
      title: "I'll take that as a \u201clet me think about it.\u201d \ud83d\udc40",
      body: "No pressure. Whenever you're ready."
    },
    no: {
      title: "Fair enough.",
      body: "Maybe another time."
    }
  }
};

// script.js reads this off window — `const` at top level does not
// automatically become a window property, so expose it explicitly.
window.CONFIG = CONFIG;