# onesec-utm-builder

OneSec メディア教育事業部の UTMキャンペーンURLビルダー。

GitHub Pages で動く静的Webアプリ + Google Sheets ログ + Apps Script Web App バックエンド。

## 構成

```
GitHub Pages (静的UI)
   ↓ fetch
Google Apps Script Web App (POST/GET エンドポイント)
   ↓
Google Sheets「UTM管理」（発行ログ・閲覧）
```

## チームの使い方

1. ブックマーク: `https://kazuto32desu.github.io/onesec-utm-builder/`
2. 5フィールド選択 → リアルタイムでURL生成
3. 「発行＆ログ記録」ボタンで Sheets に追記
4. 「過去CPから複製」で直近20件から再利用

## 命名規則

- **正本**: vault `1sec.works/_ops/utm-naming-conventions.md`（v1.2）
- **このrepo内のミラー**: `docs/naming-rules.md`
- **辞書の正本**: `dict/*.json`

## 辞書追加・改訂フロー

1. このrepo の `dict/*.json` をPRで編集
2. 三橋（または木下）がレビュー → mainマージ
3. アプリは即時反映（次回ロードで新辞書を読む）
4. 規則自体の改訂は vault の `utm-naming-conventions.md` を先に更新してから dict を反映

## ディレクトリ

```
.
├── index.html              # メインUI
├── styles.css
├── js/
│   ├── app.js              # 起動時初期化＋イベントバインド
│   ├── url-composer.js     # UTM URL生成ロジック
│   ├── validator.js        # バリデーション
│   ├── dict-loader.js      # dict/*.json 読込
│   └── sheets-client.js    # Apps Script Web App通信
├── dict/                   # 辞書データ（git管理＝チーム共有・PRレビュー可）
│   ├── medium.json
│   ├── source.json
│   ├── subject.json
│   ├── appeal.json
│   ├── role.json
│   └── meta.json
├── apps-script/
│   ├── Code.gs             # Apps Script コード（GAS UIに貼付）
│   └── DEPLOY.md           # デプロイ手順
├── docs/
│   └── naming-rules.md     # 命名規則 v1.2 のミラー
└── config.local.example.js # ローカル動作確認用設定（コミット禁止）
```

## ローカル動作確認

`python3 -m http.server 8000` でルートを配信して `http://localhost:8000/` にアクセス。

Apps Script Web App URL は `js/sheets-client.js` 上部の `WEB_APP_URL` 定数を編集。

## 本番デプロイ

GitHub Pages は repo の Settings → Pages から有効化。Source: `main` branch / `/ (root)`。

Apps Script Web App は `apps-script/DEPLOY.md` 参照。

## ライセンス

社内利用のみ。

## 関連

- 規則正本: vault `1sec.works/_ops/utm-naming-conventions.md`
- 要件定義: vault `1sec.works/_experiments/utm-builder/_index.md`
- 自動化レジストリ: vault `1sec.works/_ops/automation-registry.md`
