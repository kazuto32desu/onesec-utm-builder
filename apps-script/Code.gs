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

/**
 * setup() — ログシート作成 + ヘッダー書込
 * 失敗時は実行ログ（表示 → ログ）に詳細が出ます
 */
function setup() {
  Logger.log("setup() 開始");

  // Step 1: PropertiesService 確認
  const props = getProps();
  Logger.log("SHEET_ID: " + (props.sheetId ? props.sheetId.substring(0, 12) + "...(計" + props.sheetId.length + "字)" : "(未設定)"));
  Logger.log("LOG_SHEET_NAME: " + props.logSheetName);
  Logger.log("SHARED_SECRET: " + (props.sharedSecret ? "(設定済 " + props.sharedSecret.length + "文字)" : "(未設定 — POST/GET の認証で必須)"));

  if (!props.sheetId) {
    throw new Error("❌ PropertiesService に SHEET_ID を設定してください。\n手順: プロジェクトの設定（⚙️アイコン）→ スクリプト プロパティ → スクリプト プロパティを追加 → SHEET_ID = スプシのID（URLの /d/XXXXX/edit の XXXXX 部分）");
  }

  // Step 2: スプシを開く
  let ss;
  try {
    ss = SpreadsheetApp.openById(props.sheetId);
    Logger.log("✓ スプシを開きました: " + ss.getName());
  } catch (err) {
    throw new Error("❌ SHEET_ID のスプシを開けません: " + err.message + "\n— ID が正しいか／OAuth認可済か（初回は権限ダイアログを許可）／対象スプシに編集権限があるか を確認してください");
  }

  // Step 3: log シート取得 or 作成
  let sheet = ss.getSheetByName(props.logSheetName);
  if (!sheet) {
    Logger.log("log シート（" + props.logSheetName + "）が存在しないため新規作成");
    try {
      sheet = ss.insertSheet(props.logSheetName);
    } catch (err) {
      throw new Error("❌ シート「" + props.logSheetName + "」の作成に失敗: " + err.message);
    }
  } else {
    Logger.log("✓ 既存の log シート「" + sheet.getName() + "」を使用（" + sheet.getLastRow() + "行）");
  }

  // Step 4: ヘッダー書込
  Logger.log("HEADER 列数: " + HEADER.length);
  try {
    const range = sheet.getRange(1, 1, 1, HEADER.length);
    range.setValues([HEADER]).setFontWeight("bold").setBackground("#f0f0f0");
    sheet.setFrozenRows(1);
  } catch (err) {
    throw new Error("❌ ヘッダー書込失敗: " + err.message);
  }

  Logger.log("✅ setup 完了: シート名=" + sheet.getName() + ", 列数=" + HEADER.length);
  return "OK";
}

/**
 * setSecret() — SHARED_SECRET を Code.gs ハードコード値に強制更新
 * フロント（js/sheets-client.js）と Apps Script の SECRET を一致させるための設定関数。
 * 1度実行すれば PropertiesService に反映され、以降は doPost/doGet が新値を使う（再デプロイ不要）。
 */
function setSecret() {
  // フロント側 js/sheets-client.js の SHARED_SECRET と完全一致させる
  const FIXED_SECRET = "jWmi-adPLdFRlwGWTP4AzGz_kpSwxJcbBl1T5T5y0Z0";
  PropertiesService.getScriptProperties().setProperty("SHARED_SECRET", FIXED_SECRET);
  Logger.log("✅ SHARED_SECRET を更新しました (長さ=" + FIXED_SECRET.length + "文字)");
  Logger.log("→ Apps Script 再デプロイは不要です（PropertiesService の値が doPost/doGet で動的に読まれるため）");
  return "OK";
}

/**
 * diagnose() — 設定状況を確認（書込なし、安全に何度でも実行可）
 * setup() でエラーが出たら、まず diagnose() で原因を特定
 */
function diagnose() {
  Logger.log("=========================");
  Logger.log("UTM Builder Backend 診断");
  Logger.log("=========================");

  const props = getProps();
  Logger.log("[Properties]");
  Logger.log("  SHEET_ID:       " + (props.sheetId || "❌ 未設定"));
  Logger.log("  LOG_SHEET_NAME: " + props.logSheetName);
  Logger.log("  SHARED_SECRET:  " + (props.sharedSecret ? "✓ " + props.sharedSecret.length + "文字" : "❌ 未設定"));
  Logger.log("");
  Logger.log("[コード定数]");
  Logger.log("  HEADER ("+HEADER.length+"列): " + JSON.stringify(HEADER));
  Logger.log("");

  if (!props.sheetId) {
    Logger.log("⛔ SHEET_ID が未設定なので、これ以上のチェックはスキップ");
    Logger.log("   → プロジェクトの設定 → スクリプトプロパティ から追加してください");
    return;
  }

  Logger.log("[スプシアクセス]");
  try {
    const ss = SpreadsheetApp.openById(props.sheetId);
    Logger.log("  ✓ スプシ名: " + ss.getName());
    Logger.log("  ✓ URL: " + ss.getUrl());
    const sheets = ss.getSheets().map(function (s) { return s.getName(); });
    Logger.log("  既存シート: " + sheets.join(", "));

    const sheet = ss.getSheetByName(props.logSheetName);
    if (sheet) {
      Logger.log("  ✓ ログシート存在: 行=" + sheet.getLastRow() + ", 列=" + sheet.getLastColumn());
    } else {
      Logger.log("  ⓘ ログシート「" + props.logSheetName + "」未作成（setup() を実行すると作成されます）");
    }
  } catch (err) {
    Logger.log("  ❌ スプシアクセス失敗: " + err.message);
    Logger.log("     原因候補: ①SHEET_IDが間違い ②OAuth未認可 ③スプシに権限なし");
  }
  Logger.log("=========================");
  Logger.log("診断完了");
}

// ========== POST: ログ追記（複数行対応 v1.3） ==========

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    if (body.action !== "log") return jsonResponse({ ok: false, error: "unknown action" });

    const props = getProps();
    if (!props.sheetId) return jsonResponse({ ok: false, error: "SHEET_ID未設定" });
    if (!props.sharedSecret) return jsonResponse({ ok: false, error: "SHARED_SECRET未設定" });
    if (body.secret !== props.sharedSecret) return jsonResponse({ ok: false, error: "認証失敗" });

    // v1.3: entries[] の複数行対応。entry 単一は後方互換で残す
    const entries = Array.isArray(body.entries) ? body.entries : (body.entry ? [body.entry] : []);
    if (entries.length === 0) return jsonResponse({ ok: false, error: "entries 空" });

    const ss = SpreadsheetApp.openById(props.sheetId);
    const sheet = ss.getSheetByName(props.logSheetName);
    if (!sheet) return jsonResponse({ ok: false, error: "ログシートが見つかりません" });

    const rows = entries.map((entry) => HEADER.map((key) => entry[key] || ""));
    const lastRowBefore = sheet.getLastRow();
    sheet.getRange(lastRowBefore + 1, 1, rows.length, HEADER.length).setValues(rows);
    const lastRowAfter = sheet.getLastRow();
    return jsonResponse({
      ok: true,
      rows: rows.map((_, i) => lastRowBefore + 1 + i),
      first_row: lastRowBefore + 1,
      last_row: lastRowAfter,
    });
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
