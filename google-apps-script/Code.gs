/**
 * ============================================================
 *  Code.gs — Google Apps Script backend for the invitation.
 *
 *  What it does:
 *   - Accepts POST requests from the invitation website
 *   - Validates the payload
 *   - Appends one new row per submission to the active sheet
 *   - Never overwrites existing rows
 *   - Returns a small JSON response
 *
 *  Setup instructions live in README.md.
 * ============================================================
 */

const SHEET_NAME = "Responses";
const HEADERS = ["Timestamp", "Name", "Response", "Selected Date", "Selected Time", "Activity", "Venue", "Message"];
const ALLOWED_RESPONSES = ["yes", "maybe", "no"];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: "Missing request body." });
    }

    const data = JSON.parse(e.postData.contents);
    const validation = validate(data);
    if (!validation.ok) {
      return jsonResponse({ ok: false, error: validation.error });
    }

    const sheet = getOrCreateSheet();
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      sanitize(data.name),
      sanitize(data.response),
      sanitize(data.date),
      sanitize(data.time),
      sanitize(data.activity),
      sanitize(data.venue),
      sanitize(data.message)
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: "Server error: " + err.message });
  }
}

function doGet() {
  return jsonResponse({ ok: true, message: "This endpoint only accepts POST requests." });
}

function validate(data) {
  if (!data || typeof data !== "object") return { ok: false, error: "Malformed payload." };
  if (!data.name || String(data.name).trim() === "") return { ok: false, error: "Name is required." };
  if (data.response && ALLOWED_RESPONSES.indexOf(data.response) === -1) {
    return { ok: false, error: "Invalid response value." };
  }
  return { ok: true };
}

function sanitize(value) {
  if (value === undefined || value === null) return "";
  // Strip characters that could trigger spreadsheet formula injection.
  const str = String(value);
  return /^[=+\-@]/.test(str) ? "'" + str : str;
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
