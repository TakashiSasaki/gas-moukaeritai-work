/**
 * Config.gs
 * アプリケーション設定、APIキー、ユーザープロパティ(キープリスト)の管理
 */

// アプリケーション全体の設定値
const CONFIG = {
  // Gemini APIキー（スクリプトプロパティから取得）
  get GEMINI_API_KEY() {
    return PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  },
  
  // 使用する軽量モデル
  MODEL_NAME: 'gemini-2.5-flash-lite',
  
  // 移動先のフォルダ名
  TARGET_FOLDER_NAME: '_Web_Clip_Stash',
  
  // 安全装置: 最終更新からこの日数以内のファイルはリストアップしない
  DAYS_TO_WAIT: 7,

  // 判定済みタグ
  CHECKED_TAG: '[AI_CHECKED: KEEP]'
};

// キープリストのデフォルト値
const DEFAULT_KEEP_KEYWORDS = [
  "議事録", "下書き", "Draft", "Project", "予算", 
  "確定申告", "パスワード", "住所", "契約", 
  "請求書", "Invoice", "Resume", "CV"
];

/**
 * 【フロントエンド用API】
 * キープリスト（静的フィルタ）を取得
 */
function getKeepKeywords() {
  try {
    const props = PropertiesService.getUserProperties();
    const saved = props.getProperty('KEEP_KEYWORDS');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Failed to load user properties, using default.", e);
  }
  return DEFAULT_KEEP_KEYWORDS;
}

/**
 * 【フロントエンド用API】
 * キープリストを保存
 */
function saveKeepKeywords(keywords) {
  if (!Array.isArray(keywords)) {
    throw new Error("Invalid format: keywords must be an array.");
  }
  
  const cleanList = keywords
    .map(k => String(k).trim())
    .filter(k => k.length > 0);
  const uniqueList = [...new Set(cleanList)];

  try {
    PropertiesService.getUserProperties().setProperty('KEEP_KEYWORDS', JSON.stringify(uniqueList));
    return uniqueList;
  } catch (e) {
    throw new Error("Failed to save keywords: " + e.message);
  }
}