/**
 * @file doGet.gs
 * @fileoverview
 * Webアプリのサーバーサイド エントリーポイント。
 * HTMLテンプレートの提供と、クライアントからのAPIリクエスト（判定処理）の受付を行います。
 *
 * このスクリプトは、judge_fast_rules.js, judge_regex_rules.js,
 * judge_llm_titles.js, judge_titles_main.js が
 * 同じプロジェクトに存在することを前提としています。
 */

/**
 * HTTP GETリクエストを処理し、Webアプリのメインページ（index.html）を表示します。
 */
function doGet() {
  const template = HtmlService.createTemplateFromFile('index.html');
  
  // 自動取得可能なデプロイメントURLをHTMLテンプレートに渡す
  template.webAppUrl = ScriptApp.getService().getUrl();
  
  return template.evaluate()
    .setTitle('ファイルタイトル判定Webアプリ')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Webアプリ（クライアントサイドHTML）から呼び出されるグローバル関数。
 * 統合判定関数 `judgeTitle` を呼び出して結果を返します。
 *
 * @param {string} title - 判定対象のファイルタイトル。
 * @param {boolean} useLLM - ステップ3 (LLM判定) を実行するかどうか。
 * @param {string} modelName - LLM判定に使用するモデル名。
 * @returns {{
 * title: string,
 * isBad: boolean | null,
 * type: string | null,
 * judgedByStep: number | null
 * }} 判定結果オブジェクト。
 */
function processTitle(title, useLLM, modelName) {
  try {
    // judge_titles_main.js に定義されている関数を呼び出す
    return judgeTitle(title, useLLM, modelName);
  } catch (e) {
    Logger.log(`processTitle エラー: ${e}`);
    // クライアント側にエラーを返す
    // GASの google.script.run は Error オブジェクトを直接返せないので、
    // メッセージを抽出して再スローするか、エラーオブジェクトを自作する必要があります。
    // ここでは簡潔さのため、Error オブジェクトを new して throw します。
    throw new Error(`サーバーサイドでの判定中にエラーが発生しました: ${e.message}`);
  }
}