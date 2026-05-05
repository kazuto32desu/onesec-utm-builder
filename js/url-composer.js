/**
 * url-composer.js
 * 入力値から utm_campaign と完成URLを生成する。
 * 規則 v1.2 準拠。
 */

(function (global) {
  "use strict";

  /**
   * 配信予定日（YYYY-MM-DD）から YYYYMM を返す
   */
  function dateToYYYYMM(dateStr) {
    if (!dateStr) return "";
    const [y, m] = dateStr.split("-");
    return `${y}${m}`;
  }

  /**
   * utm_campaign を組み立てる
   * @param {Object} params - { date, subject, appeal, role }
   * @returns {string}
   */
  function composeCampaign({ date, subject, appeal, role }) {
    const yyyymm = dateToYYYYMM(date);
    if (!yyyymm || !subject || !appeal) return "";
    const parts = [yyyymm, subject, appeal];
    if (role) parts.push(role);
    return parts.join("_");
  }

  /**
   * URLにクエリ文字列を append する。既存クエリがあれば & で連結。
   */
  function appendQuery(url, queryString) {
    if (!url) return "";
    if (!queryString) return url;
    // hash があれば一旦切り離し
    const hashIdx = url.indexOf("#");
    let base = url;
    let hash = "";
    if (hashIdx >= 0) {
      base = url.substring(0, hashIdx);
      hash = url.substring(hashIdx);
    }
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}${queryString}${hash}`;
  }

  /**
   * 完成URLを生成
   * @param {Object} params - { lpUrl, source, medium, campaign, content, term }
   * @returns {string}
   */
  function composeFullUrl({ lpUrl, source, medium, campaign, content, term }) {
    if (!lpUrl || !source || !medium || !campaign) return "";
    const params = new URLSearchParams();
    params.set("utm_source", source);
    params.set("utm_medium", medium);
    params.set("utm_campaign", campaign);
    if (content) params.set("utm_content", content);
    if (term) params.set("utm_term", term);
    return appendQuery(lpUrl, params.toString());
  }

  global.UrlComposer = {
    dateToYYYYMM,
    composeCampaign,
    composeFullUrl,
    appendQuery,
  };
})(window);
