/**
 * sheets-client.js
 * Google Apps Script Web App 経由で Sheets と通信。
 *
 * デプロイ後、以下の値をWEB_APP_URL / SHARED_SECRET に書き換えてpushしてください。
 * （SHARED_SECRETはJSに埋まるため秘密性は限定的。Apps Script側のレート制限と組合せて利用）
 */

(function (global) {
  "use strict";

  // 本番値（GAS デプロイ後に上書き）
  const WEB_APP_URL =
    (global.UTM_BUILDER_CONFIG && global.UTM_BUILDER_CONFIG.WEB_APP_URL) ||
    "REPLACE_WITH_APPS_SCRIPT_WEB_APP_URL";

  const SHARED_SECRET =
    (global.UTM_BUILDER_CONFIG && global.UTM_BUILDER_CONFIG.SHARED_SECRET) ||
    "REPLACE_WITH_SHARED_SECRET";

  function isConfigured() {
    return WEB_APP_URL && !WEB_APP_URL.startsWith("REPLACE_WITH");
  }

  /**
   * 発行ログを Sheets に追記
   * @param {Object} entry - 発行ログ1行分
   */
  async function logEntry(entry) {
    if (!isConfigured()) {
      throw new Error("Apps Script Web App URL が未設定です。js/sheets-client.js を編集してください");
    }
    const payload = {
      action: "log",
      secret: SHARED_SECRET,
      entry: {
        timestamp: new Date().toISOString(),
        owner: entry.owner || "",
        utm_source: entry.source || "",
        utm_medium: entry.medium || "",
        utm_campaign: entry.campaign || "",
        utm_content: entry.content || "",
        utm_term: entry.term || "",
        delivery_date: entry.deliveryDate || "",
        scale: entry.scale || "",
        lp_url: entry.lpUrl || "",
        full_url: entry.fullUrl || "",
        memo: entry.memo || "",
        rule_version: (global.UTM_DICT && global.UTM_DICT.meta && global.UTM_DICT.meta.rule_version) || "",
      },
    };

    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // GAS doPost で simple POST
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ログ記録失敗: HTTP ${res.status} ${text}`);
    }
    const json = await res.json();
    if (!json.ok) {
      throw new Error(`ログ記録失敗: ${json.error || "unknown"}`);
    }
    return json;
  }

  /**
   * 直近の発行ログを取得
   * @param {number} limit - 取得件数（最大100）
   */
  async function fetchRecent(limit = 20) {
    if (!isConfigured()) {
      throw new Error("Apps Script Web App URL が未設定です");
    }
    const url = new URL(WEB_APP_URL);
    url.searchParams.set("action", "recent");
    url.searchParams.set("secret", SHARED_SECRET);
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`過去ログ取得失敗: HTTP ${res.status}`);
    const json = await res.json();
    if (!json.ok) throw new Error(`過去ログ取得失敗: ${json.error || "unknown"}`);
    return json.entries || [];
  }

  global.SheetsClient = { logEntry, fetchRecent, isConfigured };
})(window);
