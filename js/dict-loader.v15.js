/**
 * dict-loader.js
 * dict/*.json を fetch して window.UTM_DICT に格納する。
 * 規則 v1.3 対応（フラット構造・カスタム入力対応）
 */

(function (global) {
  "use strict";

  const DICT_BASE = "dict/";
  const DICT_FILES = ["medium", "source", "subject", "appeal", "role", "meta"];

  async function loadDicts() {
    const dicts = {};
    await Promise.all(
      DICT_FILES.map(async (name) => {
        const url = `${DICT_BASE}${name}.json?t=${Date.now()}`;
        const res = await fetch(url, { cache: "no-cache" });
        if (!res.ok) throw new Error(`辞書ロード失敗: ${name}.json (${res.status})`);
        dicts[name] = await res.json();
      })
    );
    global.UTM_DICT = dicts;
    return dicts;
  }

  /** medium 配列を priority 昇順で返す */
  function listMediums() {
    if (!global.UTM_DICT) return [];
    return [...global.UTM_DICT.medium.values].sort((a, b) => a.priority - b.priority);
  }

  /** medium に紐づく source 配列を返す */
  function sourcesByMedium(mediumValue) {
    if (!global.UTM_DICT || !mediumValue) return [];
    return global.UTM_DICT.source.values
      .filter((s) => s.medium === mediumValue)
      .sort((a, b) => a.priority - b.priority);
  }

  /** medium ごとの選択モード */
  function selectionModeFor(mediumValue) {
    if (!global.UTM_DICT) return "single";
    return (global.UTM_DICT.source._meta.selection_mode_by_medium || {})[mediumValue] || "single";
  }

  function listSubjects() {
    if (!global.UTM_DICT) return [];
    return [...global.UTM_DICT.subject.values].sort((a, b) => a.priority - b.priority);
  }

  function listAppeals() {
    if (!global.UTM_DICT) return [];
    return [...global.UTM_DICT.appeal.values].sort((a, b) => a.priority - b.priority);
  }

  function listRoles() {
    if (!global.UTM_DICT) return [];
    return [...global.UTM_DICT.role.values].sort((a, b) => a.priority - b.priority);
  }

  function listOwners() {
    if (!global.UTM_DICT) return [];
    return global.UTM_DICT.meta.owners || [];
  }

  global.DictLoader = {
    loadDicts,
    listMediums,
    sourcesByMedium,
    selectionModeFor,
    listSubjects,
    listAppeals,
    listRoles,
    listOwners,
  };
})(window);
