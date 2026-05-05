/**
 * onesec-utm-builder / Apps Script Web App
 *
 * Sheets「UTM管理」へのログ書込・読出を担うサーバー。
 * GitHub Pages の静的UIから fetch 経由で呼ばれる。
 *
 * 使い方:
 *   1. Google Drive で新規スプシ「UTM管理 v1」を作成
 *   2. Extensions > Apps Script でこのコードを貼付
 *   3. PropertiesService に設定（下記）
 *      - SHEET_ID: スプシのID
 *      - LOG_SHEET_NAME: 既定 "log"
 *      - SHARED_SECRET: 任意の長い文字列（フロントの sheets-client.js と同一値）
 *   4. 一度 setup() を実行してログシートのヘッダーを作る
 *   5. Deploy > New deployment > Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 *      - URL を控えて js/sheets-client.js の WEB_APP_URL に貼る
 */

// ========== 設定 ==========

function getProps() {
  const p = PropertiesService.getScriptProperties();
  return {
    sheetId: p.getProperty("SHEET_ID"),
    logSheetName: p.getProperty("LOG_SHEET_NAME") || "log",
    sharedSecret: p.getProperty("SHARED_SECRET"),
  };
}

const HEADER = [
  "timestamp",
  "owner",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "delivery_date",
  "scale",
  "lp_url",
  "full_url",
  "memo",
  "rule_version",
];

// ========== 初期化（手動で1回実行） ==========

function setup() {
  const { sheetId, logSheetName } = getProps();
  if (!sheetId) throw new Error("PropertiesService に SHEET_ID を設定してください");
  const ss = SpreadsheetApp.openById(sheetId);
  let sheet = ss.getSheetByName(logSheetName);
  if (!sheet) {
    sheet = ss.insertSheet(logSheetName);
  }
  // ヘッダーが空または異なる場合に書き直す
  const range = sheet.getRange(1, 1, 1, HEADER.length);
  range.setValues([HEADER]).setFontWeight("bold").setBackground("#f0f0f0");
  sheet.setFrozenRows(1);
  Logger.log("setup completed: " + sheet.getName());
}

// ========== POST: ログ追記 ==========

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    if (body.action !== "log") return jsonResponse({ ok: false, error: "unknown action" });

    const props = getProps();
    if (!props.sheetId) return jsonResponse({ ok: false, error: "SHEET_ID未設定" });
    if (!props.sharedSecret) return jsonResponse({ ok: false, error: "SHARED_SECRET未設定" });
    if (body.secret !== props.sharedSecret) return jsonResponse({ ok: false, error: "認証失敗" });

    const entry = body.entry || {};
    const ss = SpreadsheetApp.openById(props.sheetId);
    const sheet = ss.getSheetByName(props.logSheetName);
    if (!sheet) return jsonResponse({ ok: false, error: "ログシートが見つかりません" });

    const row = HEADER.map((key) => entry[key] || "");
    sheet.appendRow(row);
    const lastRow = sheet.getLastRow();
    return jsonResponse({ ok: true, row: lastRow });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

// ========== GET: 直近ログ取得 ==========

function doGet(e) {
  try {
    const params = e.parameter || {};
    if (params.action !== "recent") return jsonResponse({ ok: false, error: "unknown action" });

    const props = getProps();
    if (!props.sheetId) return jsonResponse({ ok: false, error: "SHEET_ID未設定" });
    if (params.secret !== props.sharedSecret) return jsonResponse({ ok: false, error: "認証失敗" });

    const limit = Math.min(parseInt(params.limit || "20", 10), 100);
    const ss = SpreadsheetApp.openById(props.sheetId);
    const sheet = ss.getSheetByName(props.logSheetName);
    if (!sheet) return jsonResponse({ ok: false, error: "ログシートが見つかりません" });

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return jsonResponse({ ok: true, entries: [] });

    const startRow = Math.max(2, lastRow - limit + 1);
    const rows = sheet.getRange(startRow, 1, lastRow - startRow + 1, HEADER.length).getValues();
    const entries = rows
      .map((r) => Object.fromEntries(HEADER.map((k, i) => [k, r[i]])))
      .reverse(); // 新しい順
    return jsonResponse({ ok: true, entries });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

// ========== Helper ==========

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
