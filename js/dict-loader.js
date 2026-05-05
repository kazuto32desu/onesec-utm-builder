/**
 * dict-loader.js
 * dict/*.json を fetch して window.UTM_DICT に格納する。
 * v1.2 規則に対応。
 */

(function (global) {
  "use strict";

  const DICT_BASE = "dict/";
  const DICT_FILES = ["medium", "source", "subject", "appeal", "role", "meta"];

  async function loadDicts() {
    const dicts = {};
    await Promise.all(
      DICT_FILES.map(async (name) => {
        // cache buster でブラウザキャッシュを回避
        const url = `${DICT_BASE}${name}.json?t=${Date.now()}`;
        const res = await fetch(url, { cache: "no-cache" });
        if (!res.ok) {
          throw new Error(`辞書ロード失敗: ${name}.json (${res.status})`);
        }
        dicts[name] = await res.json();
      })
    );
    global.UTM_DICT = dicts;
    return dicts;
  }

  /** medium → 連動するsource候補のみ返す */
  function filterSourcesByMedium(mediumValue) {
    if (!global.UTM_DICT) return [];
    return global.UTM_DICT.source.values
      .filter((s) => s.medium === mediumValue && s.status !== "reserved")
      .sort((a, b) => a.priority - b.priority);
  }

  /** subject の全セクションを priority 順にフラット展開（折り畳み制御は呼び出し側で） */
  function flatSubjects(includeLowFrequency = true) {
    if (!global.UTM_DICT) return [];
    const out = [];
    global.UTM_DICT.subject.sections.forEach((sec) => {
      if (sec.collapsed_by_default && !includeLowFrequency) return;
      sec.values.forEach((v) => {
        out.push({ section: sec.label, ...v });
      });
    });
    return out.sort((a, b) => a.priority - b.priority);
  }

  /** appeal をpriority昇順で返す */
  function listAppeals() {
    if (!global.UTM_DICT) return [];
    return [...global.UTM_DICT.appeal.values].sort((a, b) => a.priority - b.priority);
  }

  /** role をカテゴリでグループ化して返す */
  function listRolesGrouped() {
    if (!global.UTM_DICT) return [];
    return global.UTM_DICT.role.categories.map((cat) => ({
      name: cat.name,
      label: cat.label,
      description: cat.description,
      values: [...cat.values].sort((a, b) => a.priority - b.priority),
    }));
  }

  global.DictLoader = {
    loadDicts,
    filterSourcesByMedium,
    flatSubjects,
    listAppeals,
    listRolesGrouped,
  };
})(window);
