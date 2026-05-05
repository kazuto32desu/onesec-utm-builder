/**
 * validator.js
 * 入力値のバリデーション。規則 v1.2 準拠。
 */

(function (global) {
  "use strict";

  const ALLOWED = /^[a-z0-9_]+$/;

  /**
   * @returns {{ ok: boolean, errors: string[], warnings: string[] }}
   */
  function validate({ lpUrl, source, medium, date, subject, appeal, role, content, term }) {
    const errors = [];
    const warnings = [];

    // 必須
    if (!lpUrl) errors.push("LP URL を入れてください");
    else if (!/^https?:\/\//.test(lpUrl)) errors.push("LP URL は http:// または https:// で始めてください");
    if (!medium) errors.push("配信媒体（utm_medium）を選んでください");
    if (!source) errors.push("配信セグメント（utm_source）を選んでください");
    if (!date) errors.push("配信予定日を入れてください");
    if (!subject) errors.push("対象を選んでください");
    if (!appeal) errors.push("訴求を選んでください");

    // 文字種チェック（小文字英数字＋_）
    [
      ["utm_source", source],
      ["utm_medium", medium],
      ["対象", subject],
      ["訴求", appeal],
      ["ロール", role],
      ["utm_content", content],
    ].forEach(([name, value]) => {
      if (value && !ALLOWED.test(value)) {
        errors.push(`${name} は半角小文字英数字＋_ のみ使えます: "${value}"`);
      }
    });

    // medium と source の整合
    if (medium && source && global.UTM_DICT) {
      const src = global.UTM_DICT.source.values.find((s) => s.value === source);
      if (src && src.medium !== medium) {
        errors.push(`配信セグメント "${source}" は媒体 "${src.medium}" 用です（選択中の媒体と不整合）`);
      }
    }

    // 訴求 = seminar の時はロール推奨（必須ではないがwarning）
    if (appeal === "seminar" && !role) {
      warnings.push("訴求=seminar はロール（notice1/2/3, remind_*, qa, archive 等）を付けるのが通常です");
    }

    // utm_term は cpc 時のみ
    if (term && medium !== "cpc") {
      warnings.push("utm_term は通常 medium=cpc（有料広告）の時のみ使います");
    }

    return { ok: errors.length === 0, errors, warnings };
  }

  /**
   * 軽量チェック（ボタン活性判定用）。エラー有無だけ返す。
   */
  function isComposable({ lpUrl, source, medium, date, subject, appeal }) {
    return Boolean(lpUrl && source && medium && date && subject && appeal);
  }

  global.Validator = { validate, isComposable };
})(window);
