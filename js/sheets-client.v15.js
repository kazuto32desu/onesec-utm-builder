/**
 * sheets-client.js
 * Google Apps Script Web App 経由で Sheets と通信。
 * 規則 v1.3 対応（複数URL一括ログ追記対応）
 *
 * デプロイ後、WEB_APP_URL / SHARED_SECRET を本番値に書き換えてpush。
 */

(function (global) {
  "use strict";

  const WEB_APP_URL =
    (global.UTM_BUILDER_CONFIG && global.UTM_BUILDER_CONFIG.WEB_APP_URL) ||
    "https://script.google.com/macros/s/AKfycbxtuHBdJEsj9QGKeZdTIWdLM8vYMIEOrx3PlXJvED5i-UbixnRNNP1fH4qYrEdH9H-i/exec";

  const SHARED_SECRET =
    (global.UTM_BUILDER_CONFIG && global.UTM_BUILDER_CONFIG.SHARED_SECRET) ||
    "jWmi-adPLdFRlwGWTP4AzGz_kpSwxJcbBl1T5T5y0Z0";

  function isConfigured() {
    return WEB_APP_URL && !WEB_APP_URL.startsWith("REPLACE_WITH");
  }

  /**
   * 1キャンペーンの複数URLをまとめて記録（行数 = sources の数）
   * @param {Object} cp - キャンペーン共通情報
   * @param {Array<{source, url}>} urls - 各リスト分のURL
   */
  async function logEntries(cp, urls) {
    if (!isConfigured()) {
      throw new Error("Apps Script Web App URL が未設定です（js/sheets-client.js を編集）");
    }
    const ts = new Date().toISOString();
    // 列順は Code.gs HEADER と同じ（A〜N）
    const entries = urls.map((u) => ({
      timestamp: ts,                                          // A
      campaign_name_jp: cp.campaignNameJp || "",              // B (v1.5新規)
      owner: cp.owner || "",                                  // C
      utm_source: u.source || "",                             // D
      utm_medium: cp.medium || "",                            // E
      utm_campaign: cp.campaign || "",                        // F
      utm_content: cp.content || "",                          // G
      utm_term: cp.term || "",                                // H
      delivery_date: cp.deliveryDate || "",                   // I
      scale: cp.scale || "",                                  // J
      lp_url: cp.lpUrl || "",                                 // K
      full_url: u.url || "",                                  // L
      memo: cp.memo || "",                                    // M
      rule_version: (global.UTM_DICT && global.UTM_DICT.meta && global.UTM_DICT.meta.rule_version) || "", // N
    }));

    const payload = {
      action: "log",
      secret: SHARED_SECRET,
      entries,
    };

    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ログ記録失敗: HTTP ${res.status} ${text}`);
    }
    const json = await res.json();
    if (!json.ok) throw new Error(`ログ記録失敗: ${json.error || "unknown"}`);
    return json;
  }

  async function fetchRecent(limit = 20) {
    if (!isConfigured()) throw new Error("Apps Script Web App URL が未設定です");
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

  global.SheetsClient = { logEntries, fetchRecent, isConfigured };
})(window);
