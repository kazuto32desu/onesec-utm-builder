/**
 * validator.js
 * 入力値のバリデーション。規則 v1.3 準拠（複数source対応）
 */

(function (global) {
  "use strict";

  const ALLOWED = /^[a-z0-9_]+$/;

  /**
   * @param {Object} state
   * @returns {{ ok: boolean, errors: string[], warnings: string[] }}
   */
  function validate(state) {
    const errors = [];
    const warnings = [];

    if (!state.lpUrl) errors.push("LP URL を入れてください");
    else if (!/^https?:\/\//.test(state.lpUrl)) errors.push("LP URL は http:// または https:// で始めてください");

    if (!state.medium) errors.push("配信媒体（utm_medium）を選んでください");
    if (!state.date) errors.push("配信予定日を入れてください");
    if (!state.subject) errors.push("サービス名を選んでください");
    if (!state.appeal) errors.push("訴求を選んでください");

    // sources は配列。空ならエラー
    if (!Array.isArray(state.sources) || state.sources.length === 0) {
      errors.push("配信セグメント（utm_source）を選んでください");
    }

    // 文字種チェック
    [
      ["utm_medium", state.medium],
      ["サービス名", state.subject],
      ["訴求", state.appeal],
      ["ロール", state.role],
      ["utm_content", state.content],
    ].forEach(([name, value]) => {
      if (value && !ALLOWED.test(value)) {
        errors.push(`${name} は半角小文字英数字＋_ のみ使えます: "${value}"`);
      }
    });
    (state.sources || []).forEach((s) => {
      if (s && !ALLOWED.test(s)) {
        errors.push(`utm_source は半角小文字英数字＋_ のみ使えます: "${s}"`);
      }
    });

    // utm_term は cpc 時のみ
    if (state.term && state.medium !== "cpc") {
      warnings.push("utm_term は通常 medium=cpc（有料広告）の時のみ使います");
    }

    return { ok: errors.length === 0, errors, warnings };
  }

  function isComposable(state) {
    return Boolean(
      state.lpUrl &&
        state.medium &&
        state.date &&
        state.subject &&
        state.appeal &&
        Array.isArray(state.sources) &&
        state.sources.length > 0
    );
  }

  global.Validator = { validate, isComposable };
})(window);
