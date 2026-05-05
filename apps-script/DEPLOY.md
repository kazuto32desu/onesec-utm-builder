# Apps Script Web App デプロイ手順

UTMビルダーのバックエンドとして動く Google Apps Script Web App をデプロイします。三橋アカウントで一度だけ実施してください。

## 前提

- 三橋の Google アカウントで Drive / Apps Script が使える
- スプシ「UTM管理 v1」を新規作成しておく（または既存に統合）

## 手順

### 1. スプシの準備

1. https://drive.google.com で新規スプシ「**UTM管理 v1**」を作成
2. URLから Sheet ID をコピー
   - 例: `https://docs.google.com/spreadsheets/d/`**`1ABCxxxxx`**`/edit#gid=0` ← ボールド部分

### 2. Apps Script プロジェクトの作成

1. スプシの上部メニュー **拡張機能 > Apps Script** を選択
2. プロジェクト名を「UTM管理 Backend」等に変更
3. デフォルトの `Code.gs` の中身を、本リポジトリの [`Code.gs`](./Code.gs) で全置換
4. ⌘+S（Mac）で保存

### 3. PropertiesService に設定値を入れる

1. Apps Script エディタ左のサイドメニュー **プロジェクトの設定（⚙️）** を開く
2. 下のほう「スクリプト プロパティ」セクションで「**スクリプト プロパティを追加**」
3. 以下3つを追加:

| プロパティ | 値 |
|---|---|
| `SHEET_ID` | 手順1でコピーしたID |
| `LOG_SHEET_NAME` | `log` |
| `SHARED_SECRET` | 任意の長い文字列（例: `onesec-utm-builder-x9k2m4q8`）。**この値を後でフロント側にも入れる** |

### 4. 初期化（ログシートのヘッダー作成）

1. Apps Script エディタに戻る
2. 上部のドロップダウンから関数 `setup` を選択
3. **▶ 実行** をクリック
4. 初回は「権限を確認」「アクセスを許可」の OAuth ダイアログが出る → 許可
5. ログに `setup completed: log` と出ればOK
6. スプシを開いて `log` シートにヘッダー行（timestamp / owner / utm_source ...）が入っているか確認

### 5. Web App としてデプロイ

1. Apps Script エディタ右上 **デプロイ > 新しいデプロイ**
2. 種類の選択（歯車アイコン）→ **ウェブアプリ**
3. 設定:
   - 説明: `onesec-utm-builder v1.2`
   - 次のユーザーとして実行: **自分（三橋）**
   - アクセスできるユーザー: **全員**
4. **デプロイ** をクリック
5. **ウェブアプリのURL** が表示される → コピー（末尾が `/exec` で終わる長いURL）

### 6. フロント（GitHub Pages）と接続

`js/sheets-client.js` の冒頭 `WEB_APP_URL` と `SHARED_SECRET` を実値に書き換え:

```js
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbX_yyyy/exec";
const SHARED_SECRET = "onesec-utm-builder-x9k2m4q8";
```

→ git commit & push → GitHub Pages に反映

## 動作確認

1. GitHub Pages のURLをブラウザで開く
2. テスト入力（例: 画像診断 preview ep2 を 5/20 配信予定で組む）
3. 「📝 発行＆ログに記録」ボタンを押下
4. ステータスに「✅ ログ記録しました（行N）」と出る
5. スプシ `log` シートに1行追加されていることを確認
6. 「🕘 過去CPから複製」を押下 → 直近1件が表示される

## トラブルシュート

| 症状 | 原因 | 対策 |
|---|---|---|
| `認証失敗` | フロントとAS の SHARED_SECRET 不一致 | 両方を完全一致させる |
| `SHEET_ID未設定` | プロパティ未設定 | 手順3を再実行 |
| `ログシートが見つかりません` | LOG_SHEET_NAME と実シート名が違う | プロパティを `log` に統一 |
| CORS エラー | doPostのCORSヘッダーは GAS が自動付与するはず。それでも出る場合はリデプロイ | 「**新しいデプロイ**」を作成（更新ではなく新規） |
| 修正してもフロントに反映されない | デプロイURLは更新ごとに変わる仕様 | 「**新しいデプロイ**」のURLを再コピー |

## 更新時

`Code.gs` を更新したら **デプロイ > 新しいデプロイ** で新URL発行 → フロントに反映。「**デプロイの管理**」から既存デプロイを編集すると同URL継続もできるが、安全のため新規デプロイ推奨。
