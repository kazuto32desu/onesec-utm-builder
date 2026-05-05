---
title: UTMパラメータ命名規則
type: reference
version: v1.2
updated: 2026-05-04
tags:
  - type/reference
  - area/ops
aliases:
  - utm
  - utm規則
  - utm命名規則
---
# UTMパラメータ命名規則 v1.2

公式LINE・メルマガ・Facebook・YouTube・有料広告から LP / WisdomBase への流入を正しく計測し、施策の効果を可視化するための共通ルール。

> **バージョン**: v1.2（2026-05-04 更新）。v1.0（2026-05-01）／ v1.1（2026-05-04 朝）からの変更点は末尾「ログ」参照。
>
> **適用範囲**: **2026年5月以降の新規キャンペーン** に適用。  
> 2026年4月以前のキャンペーン（旧ルール）は触らず、過去データはそのまま保持する。  
> **旧ルール（参考）**: [Google Docs - UTMパラメータ社内運用ルール](https://docs.google.com/document/d/1eRbTzgaOXLLmEeT8XjzWxNofUdUyiu-AXxohNOvL-ZI/edit)
>
> **設計方針（v1.2）**: 基本3パラメーター運用（utm_source / utm_medium / utm_campaign）。**配信ロール（同一CP内の複数配信を識別する4要素目）はすべての訴求で任意**（v1.1 で seminar 専用だったが v1.2 で汎用化）。utm_content / utm_term は必要時のみ使用。
>
> **URLビルダー**: [[_experiments/utm-builder/_index|UTMキャンペーンURLビルダー要件定義]] ／ 辞書値の正本: [[_experiments/utm-builder/dictionary-source]] ／ 実装: [github.com/kazuto32desu/onesec-utm-builder](https://github.com/kazuto32desu/onesec-utm-builder)（private）

---

## 1. 基本原則

- **すべて小文字**（`Line` と `line` は別物として集計される）
- **区切り文字は `_` のみ**（ハイフン `-` ・ドット `.` ・スペースは禁止）
- **英数字とアンダースコアのみ**を使用
- **管理スプシに必ず記録**（配信日／担当者／URL／施策内容）
- **配信前に LP 側の GA4 タグを必ず確認**

---

## 2. utm_source（配信元 × アカウント／リスト）

媒体プレフィックス × アカウント or リストで階層化する。

| 媒体 / リスト | 規定値 |
|---|---|
| LINE: 1sec.公式 | `line_1sec` |
| LINE: 細菌検査 | `line_kensa` |
| LINE: FINAL ANSWER Academy | `line_fa_academy` |
| メルマガ: Benchmark × 細菌検査リスト | `email_benchmark_kensa` |
| メルマガ: Benchmark × 王道会員リスト | `email_benchmark_oudo` |
| メルマガ: Benchmark × 新卒CPリスト | `email_benchmark_shinsotsu` |
| メルマガ: Lステップ | `email_lstep_<リスト名>` |
| Facebook | `facebook` |
| Facebook: SHINYパートナー投稿 | `facebook_shiny` |
| YouTube（チャンネル説明欄等） | `youtube` |

### 新規 source を追加するときの命名

```
[媒体プレフィックス]_[アカウントorリスト名（小文字英数字_）]
```

媒体プレフィックスの規定値:

| 媒体 | プレフィックス |
|---|---|
| LINE | `line_` |
| メール | `email_` |
| 単独媒体（FB/YT等） | プレフィックスなし |

---

## 3. utm_medium（媒体カテゴリ）

GA4 のレポートで媒体ごとの比較ができるよう、`social` 一括をやめて細分化する。

| 媒体 | 規定値 |
|---|---|
| LINE | `messaging` |
| Facebook / Instagram | `social` |
| YouTube（オーガニック動画） | `video` |
| メルマガ | `email` |
| 有料広告 | `cpc` |

---

## 4. utm_campaign（施策名）

3要素または4要素を `_` で連結する。

```
[YYYYMM]_[対象]_[訴求][_ロール]
```

- `YYYYMM`: 配信開始月の6桁（例: `202605` = 2026年5月）
  - 日次キャンペーンのみ `YYYYMMDD` 8桁を許可
- `対象`: 科目・サービスの略称（[7. 略称辞書](#7-略称辞書) 参照）
- `訴求`: オファーやコンテンツ性質（[7. 略称辞書](#7-略称辞書) 参照）
- `ロール` (v1.2でフラット化・**すべての訴求で任意**): 同一CP内に複数配信がある場合、配信回や役割を識別する4要素目。**シリーズ性は訴求側で固定せず、配信パターンに応じて Operator が判断**。

### 「ロール」を付ける判断基準

配信が以下のいずれかなら4要素（ロール付き）にする:

- 同じ訴求で複数回配信される（preview の連載動画／seminar の告知①②③／archive の章別など）
- 役割が異なる（告知 vs リマインド vs 配信後フォロー）
- 同月内に同一CPで2回以上配信する

それ以外（単発配信）は3要素のまま。

### 例

| キャンペーン名 | 要素数 | 意味 |
|---|---|---|
| `202605_abx_archive` | 3 | 抗菌薬の王道 アーカイブ配信開始（単発） |
| `202605_derm_firstmonth` | 3 | 皮膚科の王道 初月無料CP（単発） |
| `202605_image_preview_ep2` | 4 | 画像診断 お試し動画 第2回（全6回シリーズ） |
| `202605_image_preview_ep3` | 4 | 同上 第3回 |
| `202606_resp_seminar_notice1` | 4 | 呼吸器科の王道 1-Day告知① D-65 |
| `202606_resp_seminar_notice2` | 4 | 同上 告知② D-30 |
| `202606_resp_seminar_remind_d7` | 4 | 同上 リマインド D-7 |
| `202604_compass_seminar_notice1` | 4 | 1sec.Compass 無料セミナー告知① |
| `202604_compass_seminar_archive` | 4 | 同上 配信後の録画告知 |
| `202604_oudo_pricelock` | 3 | 王道シリーズ 価格据え置きCP（単発・旧ルール期） |

### GA4 での集計パターン

- **キャンペーン全体（呼吸器科CP全配信）**: utm_campaign の前方一致 `202606_resp_seminar` でフィルタ
- **告知①の効果のみ**: utm_campaign 完全一致 `202606_resp_seminar_notice1`
- **告知系のみ（リマインド除く）**: 正規表現 `202606_resp_seminar_notice\d+`
- **同一CPの異媒体比較**: campaignで絞り込み → セカンダリディメンションで source/medium 比較

---

## 5. utm_content（クリエイティブ差分・任意）

**v1.1での再定義**: utm_content は「同一配信内のクリエイティブ差分（A/Bテスト）」専用に位置づける。配信ロール識別（告知①／②／リマインド等）は utm_campaign の第4要素 `[ロール]` で吸収するため、**通常配信では utm_content を使わない**。

### 使う場面

- 同じメール／LINE配信内に複数のバナーや CTA ボタンがあり、それぞれの効果を比較したい
- ランダム配信でクリエイティブ A／B を出し分けて A/B テストする
- 同じ訴求に対してデザイン違いの2 LPを並走テスト

### 値の例（自由入力可・小文字英数字＋アンダースコアのみ）

| 値 | 用途例 |
|---|---|
| `banner_a` / `banner_b` | クリエイティブ A／B |
| `link_top` / `link_bottom` | メール上部CTA／下部CTA |
| `cta_lp` / `cta_offer` / `cta_video` | 旧ルール v1.0 との互換用（既存ログ参照時） |

### 使わない場面

- 1-Dayセミナーの告知①②③ → utm_campaign の `[ロール]` で識別（`seminar_notice1` 等）
- 配信日違いのリマインド → 同上（`seminar_remind_d7` 等）
- これらは GA4 のセッション日付フィルターでも自然分離できるため、utm_content の出番はない

> **辞書の正本**: [[_experiments/utm-builder/dictionary-source]] §6 dict_content

---

## 6. utm_term（広告キーワード／予約）

通常配信では空のままにする。有料広告（GA4 medium=`cpc`）開始時に、キーワードまたはオーディエンス名を入れる用途で予約。

---

## 7. 略称辞書

辞書の完全版（priority・状態列含む）は [[_experiments/utm-builder/dictionary-source]] にある。本セクションは命名規則の正本としての一覧。

### 7-1. 対象（utm_campaign の `[対象]`）

#### 科目（王道シリーズ）

| 略称 | フル | 王道頻度 |
|---|---|---|
| `derm` | 皮膚科 | ◎ |
| `abx` | 抗菌薬 | ◎ |
| `resp` | 呼吸器科 | ◎ |
| `neuro` | 神経科 | ◎ |
| `hema` | 血液内科 | ◎ |
| `er` | 救急 | ○ |
| `image` | 画像診断（胸部・腹部含む） | ○ |
| `dx` | 臨床診断学 | ○ |
| `cardio` | 循環器科 | ○ |
| `endo` | 内分泌科 | △ |
| `path` | 臨床病理 | △ |
| `dental` | 歯科 | △ |
| `nutri` | 栄養学 | △ |
| `ophth` | 眼科 | △ |
| `ortho` | 整形外科 | △ |
| `behav` | 行動診療科 | △ |
| `gi` | 消化器科 | △ |
| `ent` | 耳科 | △ |
| `iv` | 輸液 | △ |
| `anes` | 麻酔科 | △ |

#### サービス

| 略称 | フル |
|---|---|
| `oudo` | 王道シリーズ（横断） |
| `compass` | 1sec.Compass |
| `media` | 1sec.メディア |
| `reborn` | Re-Born |

### 7-2. 訴求（utm_campaign の `[訴求]`・v1.2でフラット化）

訴求は単一カテゴリのフラット辞書（v1.1 の single/series 区分は廃止）。**シリーズ性は配信時に Operator がロール付与で判断**。

| 略称 | フル | よく使うロール |
|---|---|---|
| `archive` | アーカイブ配信 | `ep1`〜（章別）／単発なら省略 |
| `firstmonth` | 初月無料 | 単発が多い |
| `pricelock` | 価格据え置き／改定告知 | 単発が多い |
| `preview` | 一部無料公開 | `ep1`〜（連載動画）／単発なら省略 |
| `freshers` | 新卒応援CP（v1.1新規） | 単発が多い |
| `release` | 新科目リリース告知 | 単発が多い |
| `tokuten` | 特典付与 | 単発が多い |
| `freetrial` | 体験申込 | 単発が多い |
| `seminar` | セミナー単発訴求（1-Day／無料／協賛） | `notice1/2/3` `remind_d7/d3` `qa` `archive` 等 |

### 7-3. ロール（utm_campaign の `[ロール]`・v1.2で4カテゴリ化）

すべての訴求で任意。同一CP内に複数配信があるときに識別子として使う。**辞書にない値は自由入力可**（小文字英数字＋`_`のみ）。

#### A. シーケンス番号（汎用シリーズ）

| 略称 | フル | 想定ユース |
|---|---|---|
| `ep1`〜`ep20` | 第N回／第Nエピソード | 画像診断お試し動画6本／アーカイブ章別配信／Compass連載ウェビナー／メディア協賛シリーズ |

#### B. 告知（フェーズ別）

| 略称 | フル | 想定ユース |
|---|---|---|
| `notice1` | 第1告知（初回告知） | 王道1-Day D-65 / メディア協賛初回告知 / Compass無料セミナー告知① |
| `notice2` | 第2告知（再告知） | 王道1-Day D-30 / Compass告知② |
| `notice3` | 第3告知（直前告知） | 王道1-Day D-15 |

#### C. リマインド（直前催促）

| 略称 | フル |
|---|---|
| `remind_d14` | 2週間前リマインド |
| `remind_d7` | 1週間前リマインド（申込者向け） |
| `remind_d3` | 3日前リマインド |
| `remind_d1` | 前日リマインド |
| `remind_dday` | 当日リマインド |

#### D. 配信後フォロー

| 略称 | フル | 想定ユース |
|---|---|---|
| `qa` | 質疑応答アーカイブ配信 | 王道1-Day D+22 |
| `archive` | 録画配信告知 | Compass セミナー後／メディア協賛後 |
| `recap` | 振り返り／要約配信 | レポート系 |

→ 関連: [[projects/oudo/1day-seminars/_task-master|1-Dayセミナー共通タスクマスタ]]

> 辞書にない値を使うときは、このノート（および [[_experiments/utm-builder/dictionary-source]]）に追記してから使う。担当者ごとのブレ（`derm`/`hifu`/`skin`）防止のため。

---

## 8. 配信前チェックリスト

URLを生成して配信ボタンを押す前に、以下を必ず確認する。

- [ ] LP側に GA4 タグが設置されている（`gtag` または測定ID `G-XXXXXXX`）
- [ ] URL の末尾にスペース・日本語・大文字が混入していない
- [ ] `utm_campaign` が `[YYYYMM]_[対象]_[訴求]` の3要素になっている
- [ ] CTAが2つ以上あれば `utm_content` で識別している
- [ ] [管理スプシ](#9-管理スプシ運用履歴) に「配信日／担当者／URL／施策内容」を記録
- [ ] CTA着地LPを実際にクリックして遷移確認

---

## 9. 管理スプシ（運用履歴）

過去の発行URL一覧と配信ログは、チーム共有スプレッドシートで管理する。

- スプシURL: <!-- 確認次第追記 -->
- 記録項目: 配信日／担当者／施策名／チャネル／URL（複数CTAなら全て）／施策内容メモ

---

## 10. 過去キャンペーン記録（新ルール期）

| キャンペーン名 | 配信日 | チャネル | 担当 | 関連ノート |
|---|---|---|---|---|
| `202605_abx_archive` | 2026-05（予定） | メルマガ（Benchmark × 細菌検査リスト1300件）| 三橋 | [[projects/oudo/_index]] |
| `202605_derm_firstmonth` | 2026-05（予定） | LINE（FA Academy）| 三橋 | [[projects/1sec-media/final-answer]] |
| `202606_resp_seminar_notice1` | 2026-04-20（予定） | LINE 1sec.公式 ＋ メール 王道会員 | 三橋 | [[projects/oudo/1day-seminars/2026-06-24-resp]] |
| `202606_resp_seminar_notice2` | 2026-05-25（予定） | 同上 | 三橋 | 同上 |
| `202606_resp_seminar_notice3` | 2026-06-09（予定） | 同上 | 三橋 | 同上 |
| `202606_resp_seminar_remind_d7` | 2026-06-17（予定） | メール 王道会員（申込者限定） | 三橋 | 同上 |
| `202606_resp_seminar_remind_d3` | 2026-06-21（予定） | 同上 | 三橋 | 同上 |
| `202605_oudo_pricelock` | 2026-05（予定） | Facebook（SHINY） | 三橋 | [[services/oudo]] |

---

## 11. URL生成のテンプレート

社内では [[_experiments/utm-builder/_index|UTMキャンペーンURLビルダー]]（Phase 1: Google Sheets版）で発行する。手作業時は [Google Campaign URL Builder](https://ga-dev-tools.google/ga4/campaign-url-builder/) を使うと打ち間違いが減る。

### 例1: 単発キャンペーン（3要素campaign）

FA Academy 初月無料CP、基本3パラメーター運用:

| フィールド | 値 |
|---|---|
| Website URL | `https://oudo-offer.studio.site/` |
| Campaign Source | `line_fa_academy` |
| Campaign Medium | `messaging` |
| Campaign Name | `202605_derm_firstmonth` |

→ 出力:
```
https://oudo-offer.studio.site/?utm_source=line_fa_academy&utm_medium=messaging&utm_campaign=202605_derm_firstmonth
```

### 例2: 1-Dayセミナー告知①（4要素campaign）

呼吸器科 1-Day告知① D-65、LINE配信:

| フィールド | 値 |
|---|---|
| Website URL | `https://wisdombase.com/seminar/resp-2026-06-24` |
| Campaign Source | `line_1sec` |
| Campaign Medium | `messaging` |
| Campaign Name | `202606_resp_seminar_notice1` |

→ 出力:
```
https://wisdombase.com/seminar/resp-2026-06-24?utm_source=line_1sec&utm_medium=messaging&utm_campaign=202606_resp_seminar_notice1
```

### 例3: A/Bテスト（utm_content 使用）

抗菌薬アーカイブ告知メール、上部バナーと下部CTAの効果比較:

```
.../?utm_source=email_benchmark_kensa&utm_medium=email&utm_campaign=202605_abx_archive&utm_content=banner_top
.../?utm_source=email_benchmark_kensa&utm_medium=email&utm_campaign=202605_abx_archive&utm_content=link_bottom
```

→ utm_campaign は同一、utm_content で配信内位置を識別。

---

## 11-2. GA4 チャネル分類への注意（v1.1 新設）

GA4 の「デフォルト チャネルグループ」は標準的な utm_medium 値（`email` `social` `cpc` `display` `video` `sms` 等）を自動で分類する。本規則の以下の値は GA4 既定に存在しないため、Unassigned 扱いになる可能性がある:

| 値 | GA4既定での扱い | 対応 |
|---|---|---|
| `messaging` | 既定不在 → Unassigned | カスタムチャネルグループを作成（Phase 2） |
| QR・チラシ等の値（将来） | 同上 | 同上 |

→ Phase 2（[[_experiments/utm-builder/_index]] 参照）で Looker Studio ダッシュボード設計とセットでカスタムチャネル設定を行う。**v1.1 時点では設定なし**で運用を開始し、必要があれば GA4 のレポート側で utm_medium 直接フィルターを使う。

---

## 12. よくある間違い

| NG | 理由 |
|---|---|
| `utm_source=Line` | 大文字混入 |
| `utm_source=Benchmark Email` | 大文字＋スペース |
| `utm_campaign=free trial` | スペース |
| `utm_campaign=abx-archive-2026.05` | ハイフン・ドット混入 |
| `utm_medium=social`（LINE配信に使用） | LINE は `messaging` に分離 |
| `utm_content=cta_notice_1`（v1.0時の使い方） | v1.1以降は配信回識別は utm_campaign の `[ロール]` で行う（`seminar_notice1` 等） |
| `utm_campaign=202605_image_preview`（複数回配信なのにロール省略） | 全6回シリーズ等の複数配信時はロール必須（`_ep1` `_ep2` 等） |
| `utm_source` を媒体ごとに毎回新設 | 規定値表から選ぶ。新設時はこのノートに追記 |
| `utm_source=facebook` をパートナー投稿に流用 | 公式FBと混在して切り分け不能に。パートナーは `facebook_<partner>` で分ける（例: `facebook_shiny`） |

---

## 関連

- [[_experiments/utm-builder/_index|UTMキャンペーンURLビルダー要件定義]]
- [[_experiments/utm-builder/dictionary-source|辞書値の正本]]
- [[_ops/automation-registry|自動化レジストリ]]
- [[_ops/accounts|アカウント情報]]
- [[services/oudo|王道シリーズ]] — `202605_abx_archive` `202605_derm_firstmonth` 双方の最終目的地
- [[services/1sec-media|1sec.メディア]] — FA Academy 配信元の上位サービス
- [[projects/oudo/1day-seminars/_task-master|1-Dayセミナー共通タスクマスタ]]

## ログ
- **2026-05-04 夕 — v1.2 改訂**: ロール部の汎用化。v1.1 で「seminar専用4要素必須」だったが、preview/archive/メディア協賛/Compass連載など他訴求でも同一CP内複数配信がある実態が判明し、**ロール部はすべての訴求で任意**に変更。主な変更点:
  - §4 utm_campaign のロール定義を「seminar時は必須」→「すべての訴求で任意」に変更。シリーズ性は Operator が判断
  - §7-2 訴求辞書から `single` / `series` カテゴリ列を削除（フラット化）。代わりに「よく使うロール」列を追記
  - §7-3 ロール辞書を4カテゴリ化:
    - **A. シーケンス番号** `ep1`〜`ep20`（汎用シリーズ）新設
    - **B. 告知** `notice1/2/3`
    - **C. リマインド** `remind_d14/d7/d3/d1/dday`（v1.1 の `remind_d7/d3` から拡張）
    - **D. 配信後フォロー** `qa` `archive` `recap`
  - §12 よくある間違いに「複数回配信なのにロール省略」のNG例を追加
  - 関連: 実装repo [github.com/kazuto32desu/onesec-utm-builder](https://github.com/kazuto32desu/onesec-utm-builder) へのリンクを追加
- **2026-05-04 — v1.1 パッチ**: §2 utm_source 表に `facebook_shiny`（SHINYパートナーFB投稿）を追加。§10 過去CP記録に `202605_oudo_pricelock`（王道e-Learning価格改定告知 / Facebook配信）を追加。§12 よくある間違いに「`facebook` をパートナー投稿に流用」項目を追加。
- **2026-05-04 — v1.1 改訂**: 設計方針を「基本3パラメーター運用」に明確化。主な変更点:
  - §4 utm_campaign を `YYYYMM_対象_訴求[_ロール]` の3要素または4要素構造に拡張（ロール部新設）
  - §5 utm_content を「クリエイティブ差分（A/Bテスト）」専用に再定義。規定値を `cta_*` 7値から `banner_a/b` `link_top/bottom` 等に変更（旧値は互換用に残す）
  - §7 略称辞書に **`freshers`** 新規追加（新卒応援CP）
  - §7 ロール辞書 6値（`notice1` `notice2` `notice3` `remind_d7` `remind_d3` `qa`）を新設
  - §10 過去CP記録に呼吸器科1-Dayセミナー5配信を追記
  - §11 URL生成例を更新（3要素例＋4要素例＋A/Bテスト例）
  - §11-2 GA4チャネル分類注記を新設（messaging/QR等のカスタム設定要）
  - §12 よくある間違いを v1.1 仕様に合わせて更新
  - 関連ノート [[_experiments/utm-builder/_index]] [[_experiments/utm-builder/dictionary-source]] 新設
- 2026-05-01 — v1.0 新ルール策定。旧ルール（Google Docs）からの主な変更点: `utm_source` 階層化／`utm_medium` 細分化（`social` 分割）／`utm_campaign` 3要素構造／`utm_content` 規定値新設／略称辞書新設／配信前チェックリスト新設
