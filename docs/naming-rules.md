---
title: UTMパラメータ命名規則
type: reference
version: v1.3
updated: 2026-05-05
tags:
  - type/reference
  - area/ops
aliases:
  - utm
  - utm規則
  - utm命名規則
---
# UTMパラメータ命名規則 v1.3

公式LINE・メルマガ・Facebook・YouTube・有料広告・チラシ・紹介から LP / WisdomBase への流入を正しく計測し、施策の効果を可視化するための共通ルール。

> **バージョン**: v1.3（2026-05-05 更新）。過去の変更点は末尾「ログ」参照。
>
> **適用範囲**: **2026年5月以降の新規キャンペーン** に適用。  
> 2026年4月以前のキャンペーン（旧ルール）は触らず、過去データはそのまま保持する。  
> **旧ルール（参考）**: [Google Docs - UTMパラメータ社内運用ルール](https://docs.google.com/document/d/1eRbTzgaOXLLmEeT8XjzWxNofUdUyiu-AXxohNOvL-ZI/edit)
>
> **設計方針（v1.3）**: 基本3パラメーター運用（utm_source / utm_medium / utm_campaign）。すべての主要フィールドに「その他（自由入力）」枠を用意し、辞書非依存の運用を可能に。メルマガ（Benchmark等）配信先は**複数選択 → 個別URLを同時発行**できる。ロールは v1〜v8 のシンプルな番号制 + 自由入力に簡略化。
>
> **URLビルダー**: 
> - 🚀 ライブ: https://kazuto32desu.github.io/onesec-utm-builder/
> - 📦 repo: [github.com/kazuto32desu/onesec-utm-builder](https://github.com/kazuto32desu/onesec-utm-builder)（public）
> - 📋 要件定義: [[_experiments/utm-builder/_index]]
> - 📚 辞書正本: [[_experiments/utm-builder/dictionary-source]]

---

## 1. 基本原則

- **すべて小文字**（`Line` と `line` は別物として集計される）
- **区切り文字は `_` のみ**（ハイフン `-` ・ドット `.` ・スペースは禁止）
- **英数字とアンダースコアのみ**を使用
- **管理スプシに必ず記録**（配信日／担当者／URL／施策内容）
- **配信前に LP 側の GA4 タグを必ず確認**

---

## 2. utm_source（配信元 × アカウント／リスト）

媒体プレフィックス × アカウント or リストで階層化する。**v1.3 で大幅再編**: LINE FA Academy 削除（他社のため）、メルマガリスト整理、Facebook 細分化。

### LINE

| リスト | 規定値 |
|---|---|
| LINE: 1sec.公式 | `line_1sec` |
| LINE: 細菌検査公式 | `line_kensa` |

> ⚠️ v1.2 まで存在した `line_fa_academy`（Final Answer Academy）は **v1.3 で削除**。他社運営のため自社UTM管理対象外。

### メルマガ（Benchmark）— **複数選択して同時配信可**（v1.3 新機能）

| リスト | 規定値 |
|---|---|
| 王道の会員 | `email_benchmark_oudo_member` |
| 王道1Dayセミナー参加者 | `email_benchmark_oudo_1day` |
| 過去に企業セミナーを申込んだ人 | `email_benchmark_kigyou_seminar` |
| 細菌検査ユーザー | `email_benchmark_kensa_users` |
| 新卒CPリスト | `email_benchmark_shinsotsu` |
| Lステップ × 王道（自動返信フロー・予定） | `email_lstep_oudo` |
| その他のリスト | `email_benchmark_<入力名>`（ビルダーで自由入力） |

→ ビルダーでメルマガを選ぶと**チェックボックス群**で複数選択可。選択したリスト数だけ別URLが同時生成され、Sheetsログにも個別行で記録される。これにより「3リスト同時に1キャンペーン配信」が1操作で完了。

### Facebook（v1.3 細分化）

| 種別 | 規定値 |
|---|---|
| グループ: 動物病院経営考察室 | `facebook_group_keiei` |
| グループ: 獣医皮膚科情報 | `facebook_group_derm` |
| パートナー投稿: SHINY | `facebook_shiny` |
| その他のFacebook投稿 | `facebook_<入力名>`（自由入力） |

### その他媒体

| 媒体 | 規定値 |
|---|---|
| YouTube（チャンネル説明欄等） | `youtube` |
| 有料広告 | （自由入力 例: `google_ads` `yahoo_ads`） |
| チラシ: 新卒2980円CP | `flyer_shinsotsu` |
| その他のチラシ | `flyer_<入力名>` |
| 紹介 | （自由入力 例: `referral_friend`） |

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

v1.3 で **8値**に拡張。GA4 のレポートで媒体ごとの比較ができるよう、`social` 一括をやめて細分化。

| 媒体 | 規定値 | v1.3変更 |
|---|---|---|
| LINEメッセージ | `messaging` | — |
| メルマガ | `email` | 配信先複数選択対応 |
| Facebook | `social` | グループ／パートナー細分化 |
| YouTube（オーガニック動画） | `video` | — |
| 有料広告 | `cpc` | — |
| チラシ | `flyer` | **v1.3 新規** |
| 紹介 | `referral` | **v1.3 新規** |
| その他 | （自由入力） | **v1.3 新規**：辞書になければ手動で値を入力可 |

**注意**: `messaging` `flyer` は GA4 既定チャネルグループに不在 → カスタムチャネル設定要（Phase 2）。

---

## 4. utm_campaign（施策名）

3要素または4要素を `_` で連結する。**v1.3 で「対象」→「サービス名」にリネーム**。

```
[YYYYMM]_[サービス名]_[訴求][_ロール]
```

- `YYYYMM`: 配信開始月の6桁（例: `202605` = 2026年5月）
  - 日次キャンペーンのみ `YYYYMMDD` 8桁を許可
- `サービス名` (v1.3 でリネーム・5値+カスタム): 1sec の事業サービス略称（[7. 略称辞書](#7-略称辞書) 参照）
- `訴求`: オファーやコンテンツ性質（[7. 略称辞書](#7-略称辞書) 参照）
- `ロール` (v1.3 で `v1`〜`v8` に簡略化・任意): 同一CP内に複数配信がある場合、第N配信を識別する4要素目。複雑な値は自由入力可。

### 「ロール」を付ける判断基準

配信が以下のいずれかなら4要素（ロール付き）にする:

- 同じ訴求で複数回配信される（preview の連載動画／seminar の告知①②③／archive の章別など）
- 役割が異なる（告知 vs リマインド vs 配信後フォロー）
- 同月内に同一CPで2回以上配信する

それ以外（単発配信）は3要素のまま。

### 例（v1.3 仕様）

サービス名はサービス単位（科目別ではない）になり、ロールは v1〜v8 になった点に注意:

| キャンペーン名 | 要素数 | 意味 |
|---|---|---|
| `202605_oudo_archive` | 3 | 王道e-Learning アーカイブ配信開始（単発） |
| `202605_oudo_firstmonth` | 3 | 王道e-Learning 初月無料CP（単発） |
| `202605_oudo_preview_v2` | 4 | 王道e-Learning 一部無料公開 第2配信（全6回シリーズの2本目） |
| `202606_oudo1day_seminar_v1` | 4 | 王道1Day セミナー第1配信（告知①相当） |
| `202606_oudo1day_seminar_v2` | 4 | 同上 第2配信 |
| `202606_oudo1day_seminar_v3` | 4 | 同上 第3配信 |
| `202606_oudo1day_seminar_remind_d7` | 4 | 同上 D-7リマインド（v表記で表現できないため自由入力ロール） |
| `202604_compass_seminar_v1` | 4 | 1sec.Compass 無料セミナー第1配信 |
| `202604_compass_seminar_archive` | 4 | 同上 配信後の録画告知（自由入力ロール） |
| `202604_oudo_pricelock` | 3 | 王道シリーズ 価格据え置きCP（単発） |

> **v1.2 → v1.3 移行注意**: v1.2 期に発行済みの `202606_resp_seminar_notice1` のような「科目名_seminar_notice1」形式のCPは **そのまま保持**（過去データ整合性のため）。v1.3 以降の新規CPでは **サービス名（oudo / oudo1day等）** を使用し、ロールは `v1〜v8`（または自由入力）を使う。

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

辞書の完全版（priority・状態列含む）は [[_experiments/utm-builder/dictionary-source]] および GitHub の [`dict/*.json`](https://github.com/kazuto32desu/desu/onesec-utm-builder/tree/main/dict) にある。本セクションは命名規則の正本としての一覧。

### 7-1. サービス名（v1.3 で「対象」からリネーム・5値＋自由入力）

| 略称 | フル |
|---|---|
| `oudo` | 王道シリーズ e-Learning |
| `oudo1day` | 王道シリーズ 1DAYセミナー |
| `compass` | 1sec.Compass |
| `media` | 1sec.メディア |
| `reborn` | Re-Born |
| (自由入力) | 新サービス・コラボ等。半角小文字英数字＋_ |

> **v1.2 までの「科目辞書」（皮膚科 derm 等 20値）は v1.3 で廃止**。科目情報が必要な場合は訴求側で表現（例: `image_preview` のように複合化）するか、utm_content で補足する。

### 7-2. 訴求（utm_campaign の `[訴求]`・v1.3で「その他」追加）

| 略称 | フル |
|---|---|
| `archive` | アーカイブ配信 |
| `firstmonth` | 初月無料 |
| `pricelock` | 価格据え置き／改定告知 |
| `preview` | 一部無料公開 |
| `freshers` | 新卒応援CP（v1.1新規） |
| `release` | 新科目リリース告知 |
| `tokuten` | 特典付与 |
| `freetrial` | 体験申込 |
| `seminar` | セミナー（1Day／無料／協賛） |
| (自由入力) | 辞書にない訴求。半角小文字英数字＋_ |

### 7-3. ロール（v1.3 で v1〜v8 に大幅簡略化）

**v1.2 までの sequence(ep1-ep20)/notice/reminder/followup の細分カテゴリは廃止**。シンプルな番号制 + 自由入力に統一。

| 略称 | フル |
|---|---|
| `v1` | V1（第1配信） |
| `v2` | V2（第2配信） |
| `v3` | V3（第3配信） |
| `v4` | V4（第4配信） |
| `v5` | V5（第5配信） |
| `v6` | V6（第6配信） |
| `v7` | V7（第7配信） |
| `v8` | V8（第8配信） |
| (自由入力) | v表記で表現できない配信用（例: `notice1` `remind_d7` `qa` `archive` 等） |

→ 関連: [[projects/oudo/1day-seminars/_task-master|1-Dayセミナー共通タスクマスタ]]

> 辞書にない値を使うときは、このノート（および [[_experiments/utm-builder/dictionary-source]]）に追記してから使う。担当者ごとのブレ防止のため。

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
- **2026-05-05 夜 — v1.3 改訂**: チームから挙がった一気の要望を反映した大規模アップデート。主な変更点:
  - §3 utm_medium を 8値に拡張: `flyer`（チラシ）／`referral`（紹介）／**自由入力枠**を新設
  - §2 utm_source 大幅再編:
    - LINE: `line_fa_academy` 削除（他社運営のため）
    - メルマガ: 配信先リスト群を整理（`oudo_member` `oudo_1day` `kigyou_seminar` `kensa_users` `shinsotsu` `lstep_oudo`）。**ビルダーで複数選択 → 個別URLを同時発行**できる新機能
    - Facebook 細分化: `facebook_group_keiei`（経営考察室）／`facebook_group_derm`（皮膚科情報）／既存 `facebook_shiny`
    - 全媒体に「**その他（自由入力）**」枠を追加
  - §4 utm_campaign の「対象」→「**サービス名**」にリネーム
  - §7-1 サービス辞書を5値+自由入力に削減: `oudo` `oudo1day` `compass` `media` `reborn`
  - §7-1 **科目辞書（皮膚科 derm 等 20値）を廃止**。科目情報は訴求側または utm_content で表現
  - §7-2 訴求に「その他（自由入力）」を追加
  - §7-3 ロール辞書を **v1〜v8 + 自由入力** に大幅簡略化（旧 sequence/notice/reminder/followup を廃止）
  - 担当者: 三橋・木下・**芦田**・**豊田（SHINY）**・その他（旧「あきら」「栗須」を更新）
  - URLビルダー (https://kazuto32desu.github.io/onesec-utm-builder/) も同時にv1.3対応：複数source選択UI／複数URL同時発行／全主要フィールドに自由入力枠／配信予定日のhint改善
  - GitHub repo public化（GitHub Pagesは無料プランではpublicが必要）
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
