/**
 * app.js
 * 起動時初期化＋イベントバインド。各モジュールを連携。
 */

(function () {
  "use strict";

  // 状態
  const state = {
    lpUrl: "",
    medium: "",
    source: "",
    date: "",
    subject: "",
    appeal: "",
    role: "",
    content: "",
    term: "",
    owner: "",
    scale: "",
    memo: "",
    campaign: "",
    fullUrl: "",
  };

  // DOM 参照
  const $ = (id) => document.getElementById(id);
  const els = {
    lpUrl: $("lp-url"),
    medium: $("medium"),
    source: $("source"),
    date: $("delivery-date"),
    subject: $("subject"),
    appeal: $("appeal"),
    role: $("role"),
    content: $("content"),
    term: $("term"),
    termField: $("term-field"),
    owner: $("meta-owner"),
    scale: $("meta-scale"),
    memo: $("meta-memo"),
    previewCampaign: $("preview-campaign"),
    previewUrl: $("preview-url"),
    btnCopy: $("btn-copy"),
    btnLog: $("btn-log"),
    btnLoadRecent: $("btn-load-recent"),
    validation: $("validation"),
    status: $("status"),
    recentList: $("recent-list"),
    recentItems: $("recent-items"),
    ruleBadge: $("rule-version"),
    reloadDict: $("reload-dict"),
  };

  // ============ 辞書をフォームに反映 ============

  function populateMediumSelect() {
    const mediums = window.UTM_DICT.medium.values.sort((a, b) => a.priority - b.priority);
    els.medium.innerHTML = '<option value="">— 選択 —</option>';
    mediums.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.value;
      opt.textContent = `${m.label} (${m.value})`;
      els.medium.appendChild(opt);
    });
  }

  function populateSourceSelect() {
    const sources = state.medium
      ? DictLoader.filterSourcesByMedium(state.medium)
      : window.UTM_DICT.source.values.filter((s) => s.status === "active");
    els.source.innerHTML = '<option value="">— 選択 —</option>';
    sources.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.value;
      opt.textContent = `${s.label} (${s.value})`;
      els.source.appendChild(opt);
    });
  }

  function populateSubjectSelect() {
    els.subject.innerHTML = '<option value="">— 選択 —</option>';
    window.UTM_DICT.subject.sections.forEach((sec) => {
      if (sec.values.length === 0) return;
      const og = document.createElement("optgroup");
      og.label = sec.label;
      sec.values
        .sort((a, b) => a.priority - b.priority)
        .forEach((v) => {
          const opt = document.createElement("option");
          opt.value = v.value;
          opt.textContent = `${v.label} (${v.value})`;
          og.appendChild(opt);
        });
      els.subject.appendChild(og);
    });
  }

  function populateAppealSelect() {
    els.appeal.innerHTML = '<option value="">— 選択 —</option>';
    DictLoader.listAppeals().forEach((a) => {
      const opt = document.createElement("option");
      opt.value = a.value;
      opt.textContent = `${a.label} (${a.value})`;
      els.appeal.appendChild(opt);
    });
  }

  function populateRoleSelect() {
    els.role.innerHTML = '<option value="">— なし（単発配信）—</option>';
    DictLoader.listRolesGrouped().forEach((cat) => {
      const og = document.createElement("optgroup");
      og.label = cat.label;
      cat.values.forEach((v) => {
        const opt = document.createElement("option");
        opt.value = v.value;
        opt.textContent = v.note ? `${v.label} (${v.value}) — ${v.note}` : `${v.label} (${v.value})`;
        og.appendChild(opt);
      });
      els.role.appendChild(og);
    });
  }

  // ============ 入力 → state 同期 ============

  function bindInputs() {
    Object.entries({
      lpUrl: els.lpUrl,
      medium: els.medium,
      source: els.source,
      date: els.date,
      subject: els.subject,
      appeal: els.appeal,
      role: els.role,
      content: els.content,
      term: els.term,
      owner: els.owner,
      scale: els.scale,
      memo: els.memo,
    }).forEach(([key, el]) => {
      el.addEventListener("input", () => {
        state[key] = el.value;
        if (key === "medium") {
          // medium変更時はsourceを再構築
          populateSourceSelect();
          state.source = "";
          // term の活性切替
          els.term.disabled = state.medium !== "cpc";
          if (els.term.disabled) {
            els.term.value = "";
            state.term = "";
          }
        }
        update();
      });
    });
  }

  // ============ プレビュー更新 ============

  function update() {
    state.campaign = UrlComposer.composeCampaign({
      date: state.date,
      subject: state.subject,
      appeal: state.appeal,
      role: state.role,
    });
    state.fullUrl = UrlComposer.composeFullUrl({
      lpUrl: state.lpUrl,
      source: state.source,
      medium: state.medium,
      campaign: state.campaign,
      content: state.content,
      term: state.term,
    });

    els.previewCampaign.textContent = state.campaign || "—";
    els.previewUrl.textContent = state.fullUrl || "—";

    // バリデーション
    const result = Validator.validate(state);
    renderValidation(result);

    // ボタン活性
    const composable = Validator.isComposable(state);
    els.btnCopy.disabled = !composable || !result.ok;
    els.btnLog.disabled = !composable || !result.ok || !SheetsClient.isConfigured();
  }

  function renderValidation({ ok, errors, warnings }) {
    if (errors.length > 0) {
      els.validation.className = "validation error";
      els.validation.innerHTML =
        "<strong>⚠️ 修正が必要:</strong><ul>" +
        errors.map((e) => `<li>${escapeHtml(e)}</li>`).join("") +
        "</ul>";
      return;
    }
    if (warnings.length > 0) {
      els.validation.className = "validation warning";
      els.validation.innerHTML =
        "<strong>💡 確認:</strong><ul>" +
        warnings.map((w) => `<li>${escapeHtml(w)}</li>`).join("") +
        "</ul>";
      return;
    }
    if (Validator.isComposable(state)) {
      els.validation.className = "validation success";
      els.validation.textContent = "✅ OK — 規則v1.2 準拠";
    } else {
      els.validation.className = "validation";
      els.validation.textContent = "";
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[c]);
  }

  // ============ アクション ============

  async function copyUrl() {
    if (!state.fullUrl) return;
    try {
      await navigator.clipboard.writeText(state.fullUrl);
      setStatus("✅ クリップボードにコピーしました", "success");
    } catch (err) {
      setStatus("コピー失敗: " + err.message, "error");
    }
  }

  async function logCurrent() {
    if (!state.fullUrl) return;
    setStatus("ログ記録中…", "loading");
    try {
      const result = await SheetsClient.logEntry({
        owner: state.owner,
        source: state.source,
        medium: state.medium,
        campaign: state.campaign,
        content: state.content,
        term: state.term,
        deliveryDate: state.date,
        scale: state.scale,
        lpUrl: state.lpUrl,
        fullUrl: state.fullUrl,
        memo: state.memo,
      });
      setStatus(`✅ ログ記録しました（行${result.row || "?"}）`, "success");
    } catch (err) {
      setStatus("❌ " + err.message, "error");
    }
  }

  async function loadRecent() {
    setStatus("過去ログ取得中…", "loading");
    try {
      const entries = await SheetsClient.fetchRecent(20);
      renderRecentList(entries);
      setStatus(`✅ ${entries.length}件読み込みました`, "success");
    } catch (err) {
      setStatus("❌ " + err.message, "error");
    }
  }

  function renderRecentList(entries) {
    els.recentList.hidden = entries.length === 0;
    els.recentItems.innerHTML = "";
    entries.forEach((entry) => {
      const li = document.createElement("li");
      li.dataset.entry = JSON.stringify(entry);
      const date = entry.delivery_date || (entry.timestamp || "").split("T")[0] || "—";
      li.innerHTML = `
        <span class="recent-date">${escapeHtml(date)}</span>
        <span class="recent-campaign">${escapeHtml(entry.utm_campaign || "—")}</span>
      `;
      li.addEventListener("click", () => duplicateFrom(entry));
      els.recentItems.appendChild(li);
    });
  }

  function duplicateFrom(entry) {
    // medium → source の順で反映（連動の都合）
    if (entry.utm_medium) {
      els.medium.value = entry.utm_medium;
      els.medium.dispatchEvent(new Event("input"));
    }
    setTimeout(() => {
      if (entry.utm_source) els.source.value = entry.utm_source;
      if (entry.utm_content) els.content.value = entry.utm_content;
      if (entry.utm_term) els.term.value = entry.utm_term;
      if (entry.lp_url) els.lpUrl.value = entry.lp_url;

      // utm_campaign を分解して date/subject/appeal/role に流す
      const parts = (entry.utm_campaign || "").split("_");
      if (parts.length >= 3) {
        const [yyyymm, subject, appeal, ...rest] = parts;
        // 日付は同月1日にセット
        if (/^\d{6}$/.test(yyyymm)) {
          els.date.value = `${yyyymm.substring(0, 4)}-${yyyymm.substring(4, 6)}-01`;
        }
        els.subject.value = subject;
        els.appeal.value = appeal;
        els.role.value = rest.join("_");
      }
      // 全input/changeを発火してstate同期
      [els.lpUrl, els.source, els.date, els.subject, els.appeal, els.role, els.content, els.term].forEach(
        (el) => el.dispatchEvent(new Event("input"))
      );
      setStatus("📋 過去CPから入力を複製しました（必要に応じて調整してください）", "success");
    }, 50);
  }

  function setStatus(msg, klass = "") {
    els.status.textContent = msg;
    els.status.className = "status " + klass;
  }

  // ============ Init ============

  async function init() {
    setStatus("辞書を読み込み中…", "loading");
    try {
      await DictLoader.loadDicts();
      els.ruleBadge.textContent = window.UTM_DICT.meta.rule_version || "v?";
      populateMediumSelect();
      populateSourceSelect();
      populateSubjectSelect();
      populateAppealSelect();
      populateRoleSelect();
      bindInputs();

      els.btnCopy.addEventListener("click", copyUrl);
      els.btnLog.addEventListener("click", logCurrent);
      els.btnLoadRecent.addEventListener("click", loadRecent);
      els.reloadDict.addEventListener("click", async (e) => {
        e.preventDefault();
        await DictLoader.loadDicts();
        populateMediumSelect();
        populateSourceSelect();
        populateSubjectSelect();
        populateAppealSelect();
        populateRoleSelect();
        setStatus("✅ 辞書を再読み込みしました", "success");
      });

      update();
      setStatus(SheetsClient.isConfigured() ? "" : "⚠️ Apps Script Web App URL未設定（コピーは可・ログ記録不可）", "loading");
    } catch (err) {
      setStatus("❌ 起動失敗: " + err.message, "error");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
