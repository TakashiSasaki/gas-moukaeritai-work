// ==========================================
// Main.gs
// Webアプリのルーティングと実行制御を担当
// ==========================================

function doGet(e) {
  const pageId = e.parameter.page;
  const mimeType = e.parameter.mime; // 追加: mimeパラメータの取得
  const props = PropertiesService.getScriptProperties();
  
  if (pageId && FACILITY_CONFIG[pageId]) {
    const htmlContent = getLatestHtml(pageId);
    
    if (htmlContent) {
      // ----------------------------------------------------
      // ▼ 追加: mime=text/plain が指定されている場合はプレーンテキストで返す
      // ----------------------------------------------------
      if (mimeType === 'text/plain') {
        return ContentService.createTextOutput(htmlContent)
          .setMimeType(ContentService.MimeType.TEXT);
      }
      
      // デフォルト: ブラウザで表示するための HTML として返す
      return HtmlService.createHtmlOutput(htmlContent)
        .setTitle(FACILITY_CONFIG[pageId].name + " - 最新レポート")
        .addMetaTag('viewport', 'width=device-width, initial-scale=1');
    } else {
      // データ未取得時のエラーメッセージもMIMEタイプに合わせる
      if (mimeType === 'text/plain') {
        return ContentService.createTextOutput("Error: まだデータが取得されていません。")
          .setMimeType(ContentService.MimeType.TEXT);
      }
      return HtmlService.createHtmlOutput("<h1>まだデータが取得されていません。</h1>");
    }
  } else {
    const template = HtmlService.createTemplateFromFile('index');
    template.webAppUrl = ScriptApp.getService().getUrl();
    template.facilities = FACILITY_CONFIG;
    
    const ss = getOrCreateSpreadsheet();
    template.ssUrl = ss.getUrl();
    template.timestamps = getLatestTimestamps();
    
    // 現在選択されているモデルと選択肢をUIに渡す
    template.currentModel = props.getProperty("SELECTED_MODEL") || DEFAULT_MODEL;
    template.availableModels = AVAILABLE_MODELS;
    
    return template.evaluate()
      .setTitle("施設情報レポート一覧")
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
}

function updateModelSetting(modelName) {
  if (AVAILABLE_MODELS.indexOf(modelName) === -1) throw new Error("無効なモデル名です。");
  PropertiesService.getScriptProperties().setProperty("SELECTED_MODEL", modelName);
  return `使用モデルを ${modelName} に変更しました。`;
}

function executeAndSave(pageId) {
  const config = FACILITY_CONFIG[pageId];
  if (!config) return;
  try {
    console.log(`開始: ${config.name} (ID: ${pageId}) のデータ生成中...`);
    const generatedHtml = generateFacilityHtml(buildPrompt(pageId));
    saveHtmlData(pageId, config.name, generatedHtml);
    console.log(`成功: ${config.name} の保存が完了しました。`);
  } catch (error) {
    console.error(`エラー: ID ${pageId} の処理中に問題が発生しました。`, error);
    throw error;
  }
}

function triggerUpdateFromWeb(pageId) {
  const config = FACILITY_CONFIG[pageId];
  if (!config) throw new Error("無効な施設IDです。");
  try {
    executeAndSave(pageId);
    return `${config.name} のデータを更新しました。`;
  } catch (e) {
    throw new Error(`${config.name} の更新に失敗しました: ${e.message}`);
  }
}

function triggerSet1()  { executeAndSave(1); }
function triggerSet2()  { executeAndSave(2); }
function triggerSet3()  { executeAndSave(3); }
function triggerSet4()  { executeAndSave(4); }
function triggerSet5()  { executeAndSave(5); }
function triggerSet6()  { executeAndSave(6); }
function triggerSet7()  { executeAndSave(7); }
function triggerSet8()  { executeAndSave(8); }
function triggerSet9()  { executeAndSave(9); }
function triggerSet10() { executeAndSave(10); }
