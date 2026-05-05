// ローカル動作確認用の設定例。
// 本物の URL/トークンは config.local.js（.gitignore済）に書く。
// 本番（GitHub Pages）では js/sheets-client.js の定数を直接編集する想定。

window.UTM_BUILDER_CONFIG = {
  // Apps Script Web App URL (デプロイ後に取得)
  WEB_APP_URL: "https://script.google.com/macros/s/XXXXXX/exec",

  // Apps Script 側でチェックする共有シークレット
  // 値は Apps Script の PropertiesService にも同じ値を入れる
  SHARED_SECRET: "your-shared-secret-here",
};
