/**
 * app.js
 * v1.3: 複数source対応 + カスタム自由入力 + 複数URL生成
 */

(function () {
  "use strict";

  // ============ State ============

  const state = {
    lpUrl: "",
    // medium 関連
    mediumSelect: "",   // ドロップダウンの値（"_custom" もありうる）
    mediumCustom: "",   // medium が "_custom" の時のテキスト入力
    // source 関連
    sourceSelect: "",      // 単一選択モードでの値（"_custom" もありうる）
    sourceCustom: "",      // 単一モード _custom の時のテキスト入力
    sourceMulti: {},       // 複数選択モード（email）: { value: bool } と { "_custom": "入力値" }
    // 共通
    date: "",
    subjectSelect: "",
    subjectCustom: "",
    appealSelect: "",
    appealCustom: "",
    roleSelect: "",
    roleCustom: "",
    content: "",
    term: "",
    campaignNameJp: "",
    owner: "",
    scale: "",
    memo: "",
  };

  const $ = (id) => document.getElementById(id);
  const els = {};

  function initEls() {
    [
      "lp-url",
      "medium",
      "medium-custom",
      "source-field",
      "source-label",
      "source",
      "source-multi",
      "source-multi-list",
      "source-custom",
      "delivery-date",
      "subject",
      "subject-custom",
      "appeal",
      "appeal-custom",
      "role",
      "role-custom",
      "content",
      "term",
      "term-field",
      "meta-campaign-name",
      "meta-owner",
      "meta-scale",
      "meta-memo",
      "preview-campaign",
      "preview-urls",
      "preview-url-count",
      "btn-log",
      "btn-load-recent",
      "validation",
      "status",
      "recent-list",
      "recent-items",
      "rule-version",
      "reload-dict",
    ].forEach((id) => {
      els[toCamel(id)] = $(id);
    });
  }
  function toCamel(s) {
    return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  }

  // ============ Resolved values（"_custom" 解決後の実値） ============

  function resolvedMedium() {
    if (state.mediumSelect === "_custom") return (state.mediumCustom || "").toLowerCase();
    return state.mediumSelect;
  }

  function resolvedSubject() {
    if (state.subjectSelect === "_custom") return (state.subjectCustom || "").toLowerCase();
    return state.subjectSelect;
  }

  function resolvedAppeal() {
    if (state.appealSelect === "_custom") return (state.appealCustom || "").toLowerCase();
    return state.appealSelect;
  }

  function resolvedRole() {
    if (state.roleSelect === "_custom") return (state.roleCustom || "").toLowerCase();
    return state.roleSelect;
  }

  /**
   * 選択された source の配列を返す（解決済み）
   * - 単一モード: [選んだ値]（_custom なら custom_prefix を考慮）
   * - 複数モード: 選択された値の配列
   */
  function resolvedSources() {
    const medium = resolvedMedium();
    const mode = DictLoader.selectionModeFor(state.mediumSelect);
    const sourceDict = DictLoader.sourcesByMedium(state.mediumSelect);

    if (mode === "multi") {
      // メルマガ複数選択モード
      const out = [];
      sourceDict.forEach((src) => {
        if (src.is_custom) {
          const customVal = state.sourceMulti[src.value + "__custom"];
          if (state.sourceMulti[src.value] && customVal) {
            out.push(applyCustomPrefix(src, customVal));
          }
        } else {
          if (state.sourceMulti[src.value]) out.push(src.value);
        }
      });
      return out;
    }

    // 単一選択モード
    if (!state.sourceSelect) return [];
    if (state.sourceSelect === "_custom") {
      if (!state.sourceCustom) return [];
      const customDef = sourceDict.find((s) => s.value === "_custom");
      return [applyCustomPrefix(customDef, state.sourceCustom)];
    }
    return [state.sourceSelect];
  }

  function applyCustomPrefix(srcDef, raw) {
    const prefix = (srcDef && srcDef.custom_prefix) || "";
    const cleaned = String(raw || "")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");
    if (!cleaned) return "";
    return prefix + cleaned;
  }

  // ============ Dict → Form populate ============

  function populateMediumSelect() {
    els.medium.innerHTML = '<option value="">— 選択 —</option>';
    DictLoader.listMediums().forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.value;
      opt.textContent = m.is_custom ? m.label : `${m.label} (${m.value})`;
      els.medium.appendChild(opt);
    });
  }

  /** medium が変わるたびに呼ぶ。source UI を切り替える */
  function rebuildSourceUI() {
    const mode = state.mediumSelect ? DictLoader.selectionModeFor(state.mediumSelect) : "single";
    const sources = DictLoader.sourcesByMedium(state.mediumSelect);

    // リセット
    state.sourceSelect = "";
    state.sourceCustom = "";
    state.sourceMulti = {};
    els.sourceCustom.value = "";
    els.sourceCustom.hidden = true;

    if (state.mediumSelect === "_custom") {
      // medium=その他 → source は自由入力1個
      els.source.hidden = true;
      els.sourceMulti.hidden = true;
      els.sourceLabel.textContent = "配信セグメント (utm_source) ※自由入力 *";
      els.sourceCustom.hidden = false;
      els.sourceCustom.placeholder = "セグメント名を入力（半角小文字英数字＋_）";
      return;
    }

    if (mode === "multi") {
      // メルマガ複数選択
      els.source.hidden = true;
      els.sourceMulti.hidden = false;
      els.sourceLabel.textContent = "配信セグメント (utm_source) — 複数選択可 *";
      els.sourceMultiList.innerHTML = "";
      sources.forEach((src) => {
        const wrap = document.createElement("div");
        const id = `src-${src.value}-${src.priority}`;
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.id = id;
        cb.dataset.value = src.value;
        cb.addEventListener("change", () => {
          state.sourceMulti[src.value] = cb.checked;
          if (src.is_custom) {
            const txt = wrap.querySelector("input[type=text]");
            if (txt) txt.disabled = !cb.checked;
          }
          update();
        });
        const label = document.createElement("label");
        label.htmlFor = id;
        label.appendChild(cb);
        const span = document.createElement("span");
        span.textContent = src.is_custom ? src.label : `${src.label} (${src.value})`;
        label.appendChild(span);
        wrap.appendChild(label);

        if (src.is_custom) {
          const txt = document.createElement("input");
          txt.type = "text";
          txt.placeholder = "リスト名を入力（例: 王道アンケート回答者）";
          txt.disabled = true;
          txt.style.marginLeft = "24px";
          txt.style.marginTop = "4px";
          txt.style.width = "calc(100% - 24px)";
          txt.addEventListener("input", () => {
            state.sourceMulti[src.value + "__custom"] = txt.value;
            update();
          });
          wrap.appendChild(txt);
        }
        els.sourceMultiList.appendChild(wrap);
      });
      return;
    }

    // 単一選択（messaging/social/video/cpc/flyer/referral）
    els.source.hidden = false;
    els.sourceMulti.hidden = true;
    els.sourceLabel.textContent = "配信セグメント (utm_source) *";
    els.source.innerHTML = '<option value="">— 選択 —</option>';
    sources.forEach((src) => {
      const opt = document.createElement("option");
      opt.value = src.value;
      opt.textContent = src.is_custom ? src.label : `${src.label} (${src.value})`;
      els.source.appendChild(opt);
    });
  }

  function populateSubjectSelect() {
    els.subject.innerHTML = '<option value="">— 選択 —</option>';
    DictLoader.listSubjects().forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v.value;
      opt.textContent = v.is_custom ? v.label : `${v.label} (${v.value})`;
      els.subject.appendChild(opt);
    });
  }

  function populateAppealSelect() {
    els.appeal.innerHTML = '<option value="">— 選択 —</option>';
    DictLoader.listAppeals().forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v.value;
      opt.textContent = v.is_custom ? v.label : `${v.label} (${v.value})`;
      els.appeal.appendChild(opt);
    });
  }

  function populateRoleSelect() {
    els.role.innerHTML = '<option value="">— なし（単発配信）—</option>';
    DictLoader.listRoles().forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v.value;
      opt.textContent = v.is_custom ? v.label : `${v.label} (${v.value})`;
      els.role.appendChild(opt);
    });
  }

  function populateOwnerSelect() {
    els.metaOwner.innerHTML = '<option value="">— 選択 —</option>';
    DictLoader.listOwners().forEach((o) => {
      const opt = document.createElement("option");
      opt.value = o.value;
      opt.textContent = o.label;
      els.metaOwner.appendChild(opt);
    });
  }

  // ============ Input bindings ============

  function bindInputs() {
    els.lpUrl.addEventListener("input", () => { state.lpUrl = els.lpUrl.value.trim(); update(); });
    els.deliveryDate.addEventListener("input", () => { state.date = els.deliveryDate.value; update(); });
    els.metaCampaignName.addEventListener("input", () => { state.campaignNameJp = els.metaCampaignName.value; update(); });
    els.metaOwner.addEventListener("input", () => { state.owner = els.metaOwner.value; });
    els.metaScale.addEventListener("input", () => { state.scale = els.metaScale.value; });
    els.metaMemo.addEventListener("input", () => { state.memo = els.metaMemo.value; });
    els.content.addEventListener("input", () => { state.content = els.content.value.trim(); update(); });
    els.term.addEventListener("input", () => { state.term = els.term.value.trim(); update(); });

    // medium
    els.medium.addEventListener("change", () => {
      state.mediumSelect = els.medium.value;
      els.mediumCustom.hidden = state.mediumSelect !== "_custom";
      if (els.mediumCustom.hidden) state.mediumCustom = "";
      // term の活性
      els.term.disabled = state.mediumSelect !== "cpc";
      if (els.term.disabled) { els.term.value = ""; state.term = ""; }
      rebuildSourceUI();
      update();
    });
    els.mediumCustom.addEventListener("input", () => {
      state.mediumCustom = els.mediumCustom.value;
      update();
    });

    // source 単一
    els.source.addEventListener("change", () => {
      state.sourceSelect = els.source.value;
      const isCustom = state.sourceSelect === "_custom";
      els.sourceCustom.hidden = !isCustom;
      if (!isCustom) state.sourceCustom = "";
      update();
    });
    els.sourceCustom.addEventListener("input", () => {
      state.sourceCustom = els.sourceCustom.value;
      update();
    });

    // subject
    els.subject.addEventListener("change", () => {
      state.subjectSelect = els.subject.value;
      const isCustom = state.subjectSelect === "_custom";
      els.subjectCustom.hidden = !isCustom;
      if (!isCustom) state.subjectCustom = "";
      update();
    });
    els.subjectCustom.addEventListener("input", () => {
      state.subjectCustom = els.subjectCustom.value;
      update();
    });

    // appeal
    els.appeal.addEventListener("change", () => {
      state.appealSelect = els.appeal.value;
      const isCustom = state.appealSelect === "_custom";
      els.appealCustom.hidden = !isCustom;
      if (!isCustom) state.appealCustom = "";
      update();
    });
    els.appealCustom.addEventListener("input", () => {
      state.appealCustom = els.appealCustom.value;
      update();
    });

    // role
    els.role.addEventListener("change", () => {
      state.roleSelect = els.role.value;
      const isCustom = state.roleSelect === "_custom";
      els.roleCustom.hidden = !isCustom;
      if (!isCustom) state.roleCustom = "";
      update();
    });
    els.roleCustom.addEventListener("input", () => {
      state.roleCustom = els.roleCustom.value;
      update();
    });
  }

  // ============ Update preview ============

  function update() {
    const medium = resolvedMedium();
    const subject = resolvedSubject();
    const appeal = resolvedAppeal();
    const role = resolvedRole();
    const sources = resolvedSources();

    const campaign = UrlComposer.composeCampaign({
      date: state.date, subject, appeal, role,
    });

    const unified = UrlComposer.composeUnifiedUrl({
      lpUrl: state.lpUrl,
      sources,
      medium,
      campaign,
      content: state.content,
      term: state.term,
    });

    // プレビュー（campaign）
    els.previewCampaign.textContent = campaign || "—";

    // プレビュー（統合URL 1本）
    renderPreviewUrl(unified, sources);

    // バリデーション（統合済みsourceで検証）
    const validationState = {
      lpUrl: state.lpUrl,
      medium,
      sources: unified ? [unified.source] : [],
      date: state.date,
      subject,
      appeal,
      role,
      content: state.content,
      term: state.term,
    };
    const result = Validator.validate(validationState);
    renderValidation(result, unified);

    // ボタン活性
    const composable = Validator.isComposable(validationState);
    els.btnLog.disabled = !composable || !result.ok || !SheetsClient.isConfigured();

    // 状態を後で参照する用に保存
    state._resolved = { medium, subject, appeal, role, sources, campaign, unified };
  }

  function renderPreviewUrl(unified, sources) {
    els.previewUrls.innerHTML = "";
    if (!unified) {
      els.previewUrlCount.textContent = "";
      const ph = document.createElement("code");
      ph.className = "preview-url placeholder";
      ph.textContent = "—";
      els.previewUrls.appendChild(ph);
      return;
    }

    // バッジ: 複数リスト同時配信時に表示
    els.previewUrlCount.textContent = unified.sourceCount > 1 ? `${unified.sourceCount}リスト統合` : "";

    const row = document.createElement("div");
    row.className = "preview-url-row";

    if (unified.sourceCount > 1) {
      const tag = document.createElement("span");
      tag.className = "url-source-tag";
      tag.textContent = `📨 配信先リスト (${unified.sourceCount}件): ` + sources.join(" / ");
      row.appendChild(tag);
    }

    const code = document.createElement("code");
    code.textContent = unified.url;
    row.appendChild(code);

    const btn = document.createElement("button");
    btn.className = "btn btn-secondary btn-mini";
    btn.textContent = "📋 コピー";
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(unified.url);
        setStatus("✅ URLをコピーしました", "success");
      } catch (err) {
        setStatus("コピー失敗: " + err.message, "error");
      }
    });
    row.appendChild(btn);

    els.previewUrls.appendChild(row);
  }

  function renderValidation({ ok, errors, warnings }, unified) {
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
    if (ok && unified) {
      const ver = (window.UTM_DICT && window.UTM_DICT.meta && window.UTM_DICT.meta.rule_version) || "v?";
      els.validation.className = "validation success";
      els.validation.textContent =
        unified.sourceCount > 1
          ? `✅ OK — 規則${ver} 準拠（${unified.sourceCount}リスト統合の単一URL）`
          : `✅ OK — 規則${ver} 準拠`;
    } else {
      els.validation.className = "validation";
      els.validation.textContent = "";
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
  }

  // ============ Actions ============

  async function logCurrent() {
    if (!state._resolved || !state._resolved.unified) return;
    setStatus("ログ記録中…", "loading");
    try {
      const u = state._resolved.unified;
      const result = await SheetsClient.logEntries(
        {
          campaignNameJp: state.campaignNameJp,
          owner: state.owner,
          medium: state._resolved.medium,
          campaign: state._resolved.campaign,
          content: state.content,
          term: state.term,
          deliveryDate: state.date,
          scale: state.scale,
          lpUrl: state.lpUrl,
          memo: state.memo,
        },
        [{ source: u.source, url: u.url }]
      );
      const n = (result.rows || []).length || 1;
      setStatus(`✅ ログ記録しました（${n}行追加）`, "success");
    } catch (err) {
      setStatus("❌ " + err.message, "error");
    }
  }

  async function loadRecent() {
    setStatus("過去ログ取得中…", "loading");
    try {
      const entries = await SheetsClient.fetchRecent(20);
      // utm_campaign 単位でグルーピング（複数source = 同一campaign）
      const grouped = groupByCampaign(entries);
      renderRecentList(grouped);
      setStatus(`✅ ${entries.length}行（${grouped.length}キャンペーン）読み込みました`, "success");
    } catch (err) {
      setStatus("❌ " + err.message, "error");
    }
  }

  function groupByCampaign(entries) {
    const map = new Map();
    entries.forEach((e) => {
      const key = e.utm_campaign || `_${e.timestamp}`;
      if (!map.has(key)) map.set(key, e); // 最新優先
    });
    return Array.from(map.values());
  }

  function renderRecentList(entries) {
    els.recentList.hidden = entries.length === 0;
    els.recentItems.innerHTML = "";
    entries.forEach((entry) => {
      const li = document.createElement("li");
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
    // 単純に主要フィールドを埋める（細かい再現は割愛）
    if (entry.lp_url) { els.lpUrl.value = entry.lp_url; els.lpUrl.dispatchEvent(new Event("input")); }
    if (entry.utm_medium) { els.medium.value = entry.utm_medium; els.medium.dispatchEvent(new Event("change")); }
    setTimeout(() => {
      // utm_campaign を分解
      const parts = (entry.utm_campaign || "").split("_");
      if (parts.length >= 3) {
        const [yyyymm, subject, appeal, ...rest] = parts;
        if (/^\d{6}$/.test(yyyymm)) {
          els.deliveryDate.value = `${yyyymm.substring(0, 4)}-${yyyymm.substring(4, 6)}-01`;
          els.deliveryDate.dispatchEvent(new Event("input"));
        }
        if (subject) {
          els.subject.value = subject;
          els.subject.dispatchEvent(new Event("change"));
        }
        if (appeal) {
          els.appeal.value = appeal;
          els.appeal.dispatchEvent(new Event("change"));
        }
        const role = rest.join("_");
        if (role) {
          els.role.value = role;
          els.role.dispatchEvent(new Event("change"));
        }
      }
      setStatus("📋 過去CPから入力を複製しました（必要に応じて調整してください）", "success");
    }, 100);
  }

  function setStatus(msg, klass = "") {
    els.status.textContent = msg;
    els.status.className = "status " + klass;
  }

  // ============ Init ============

  async function init() {
    initEls();
    setStatus("辞書を読み込み中…", "loading");
    try {
      await DictLoader.loadDicts();
      els.ruleVersion.textContent = window.UTM_DICT.meta.rule_version || "v?";
      populateMediumSelect();
      populateSubjectSelect();
      populateAppealSelect();
      populateRoleSelect();
      populateOwnerSelect();
      bindInputs();
      rebuildSourceUI();

      els.btnLog.addEventListener("click", logCurrent);
      els.btnLoadRecent.addEventListener("click", loadRecent);
      els.reloadDict.addEventListener("click", async (e) => {
        e.preventDefault();
        await DictLoader.loadDicts();
        populateMediumSelect();
        populateSubjectSelect();
        populateAppealSelect();
        populateRoleSelect();
        populateOwnerSelect();
        rebuildSourceUI();
        setStatus("✅ 辞書を再読み込みしました", "success");
      });

      update();
      if (!SheetsClient.isConfigured()) {
        setStatus("⚠️ Apps Script Web App URL未設定（コピーは可・ログ記録不可）", "loading");
      } else {
        setStatus("");
      }
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
