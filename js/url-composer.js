/**
 * url-composer.js
 * 入力値から utm_campaign と完成URL（複数の場合あり）を生成する。
 * 規則 v1.3 準拠（複数source対応）
 */

(function (global) {
  "use strict";

  function dateToYYYYMM(dateStr) {
    if (!dateStr) return "";
    const [y, m] = dateStr.split("-");
    return `${y}${m}`;
  }

  /**
   * utm_campaign を組み立てる
   * @param {Object} params - { date, subject, appeal, role }
   */
  function composeCampaign({ date, subject, appeal, role }) {
    const yyyymm = dateToYYYYMM(date);
    if (!yyyymm || !subject || !appeal) return "";
    const parts = [yyyymm, subject, appeal];
    if (role) parts.push(role);
    return parts.join("_");
  }

  /**
   * URLにクエリ文字列を append する。既存クエリ・hash対応
   */
  function appendQuery(url, queryString) {
    if (!url) return "";
    if (!queryString) return url;
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
   * 完成URLを1本生成
   * @param {Object} params - { lpUrl, source, medium, campaign, content, term }
   */
  function composeOneUrl({ lpUrl, source, medium, campaign, content, term }) {
    if (!lpUrl || !source || !medium || !campaign) return "";
    const params = new URLSearchParams();
    params.set("utm_source", source);
    params.set("utm_medium", medium);
    params.set("utm_campaign", campaign);
    if (content) params.set("utm_content", content);
    if (term) params.set("utm_term", term);
    return appendQuery(lpUrl, params.toString());
  }

  /**
   * 完成URLを sources の配列分まとめて生成
   * @param {Object} params - { lpUrl, sources: string[], medium, campaign, content, term }
   * @returns {Array<{ source: string, url: string }>}
   */
  function composeMultipleUrls({ lpUrl, sources, medium, campaign, content, term }) {
    if (!Array.isArray(sources) || sources.length === 0) return [];
    return sources.map((source) => ({
      source,
      url: composeOneUrl({ lpUrl, source, medium, campaign, content, term }),
    }));
  }

  global.UrlComposer = {
    dateToYYYYMM,
    composeCampaign,
    composeOneUrl,
    composeMultipleUrls,
    appendQuery,
  };
})(window);
