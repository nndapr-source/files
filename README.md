# A Little Invitation

A click-based, one-screen-at-a-time date invitation. No scrolling wall of
text — the guest taps through a short conversation, picks a day and time,
picks a plan, sees a summary, can save it to Google Calendar, RSVPs, and
leaves a name + message that gets saved to a Google Sheet.

Everything personal lives in **`config.js`**. You should not need to touch
`index.html`, `style.css`, or `script.js` to personalize this for someone.

---

## 1. Edit the invitation

Open `config.js` and fill in:

| What | Where in `config.js` |
|---|---|
| Your name / their name | `person.inviterName`, `person.guestName` |
| Opening / intro / question copy | `invitation.*` |
| Which days are pickable | `dates.startDate`, `dates.endDate`, `dates.onlyWeekends` |
| Available time slots | `dates.availableTimes` |
| Block or open a specific date | `dateOverrides` (see example in the file — overrides always win over the weekend rule) |
| Date plan options (Coffee, Dinner, etc.) | `activities` array — add, remove, or edit any entry |
| Whether guests can pick more than one plan | `activitySettings.multipleSelection` |
| Venue name / address / Google Maps link | `venue.*` |
| Google Calendar event title, length, description | `calendar.*` |
| Background music | `music.enabled`, `music.file` |
| Photos used in the flow | `media.*` |
| Final-screen message per RSVP answer | `finalMessages.yes` / `.maybe` / `.no` |

Dates before today, weekdays (Mon–Fri), and anything outside
`startDate`–`endDate` are automatically disabled — you don't need to list
every weekend by hand.

### Photos, video, music

Drop files into:

```
assets/images/
assets/videos/
assets/music/
```

then reference them from `config.js` (`media.*`, `music.file`). Use
compressed, web-sized files (WebP/AVIF for images, a compressed MP4 for
video, a reasonably small MP3 for music) so the first screen stays fast on
mobile data.

---

## 2. Set up the Google Sheet (response database)

1. Create a new Google Sheet.
2. In the sheet, go to **Extensions → Apps Script**.
3. Delete the placeholder code and paste in the contents of
   `google-apps-script/Code.gs`.
4. Click **Deploy → New deployment**.
5. Choose type **Web app**.
6. Set **Execute as**: *Me*.
7. Set **Who has access**: *Anyone* (this lets the static site POST to it
   without OAuth — the script still validates every submission).
8. Click **Deploy**, then authorize the script when prompted.
9. Copy the Web App URL you're given.
10. Paste it into `config.js` as `googleAppsScriptUrl`.

Every submission adds a new row — nothing is ever overwritten. Columns:
`Timestamp, Name, Response, Selected Date, Selected Time, Activity, Venue, Message`.

If you leave `googleAppsScriptUrl` as the placeholder, the site still works
end-to-end — it just won't save responses anywhere.

---

## 3. Deploy on GitHub Pages

1. Create a new GitHub repository and push this folder to it (branch `main`).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**
   (the included workflow at `.github/workflows/deploy.yml` will handle the
   rest automatically on every push to `main`).
4. Wait for the "Deploy to GitHub Pages" workflow to finish (check the
   **Actions** tab).
5. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

No build step, no server, no framework — it's static HTML/CSS/JS.

---

## 4. Local preview

Just open `index.html` in a browser, or serve the folder locally, e.g.:

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

---

## Project structure

```
/
├── index.html                  # all screens, one HTML file
├── style.css                   # design tokens + every screen's styling
├── script.js                   # navigation, calendar logic, form submit
├── config.js                   # <- edit this for personalization
├── README.md
├── assets/
│   ├── images/
│   ├── videos/
│   └── music/
├── google-apps-script/
│   └── Code.gs                 # paste into Apps Script editor
└── .github/workflows/deploy.yml
```

## Notes

- The guest's response is remembered in their browser (`localStorage`) so
  reopening the link shows their previous answer instead of a blank form —
  they can still edit and resend it.
- The "No" option is never hidden or made hard to click.
- Respects `prefers-reduced-motion`; keyboard-navigable throughout.
- Music never autoplays with sound — it only starts if the guest taps the
  music button, and their preference is remembered for next time.
