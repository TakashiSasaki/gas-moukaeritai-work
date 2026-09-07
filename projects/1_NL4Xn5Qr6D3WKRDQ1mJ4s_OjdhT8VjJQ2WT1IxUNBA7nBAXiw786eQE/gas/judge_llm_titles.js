/**
 * @file judge_llm_titles.js
 * @fileoverview
 * ファイルタイトル判定システムのステップ3（LLMによる意味解析）を実装します。
 * このスクリプトは、Google Apps Script (GAS) での実行を前提としています。
 *
 * @usage
 * 1. GASエディタの「プロジェクトの設定」>「スクリプト プロパティ」を開きます。
 * 2. 「GEMINI_API_KEY」という名前で、お持ちのGoogle AI StudioのAPIキーを追加します。
 * 3. `runTest()` 関数を実行して動作確認ができます。
 */

// APIキーをスクリプトプロパティから取得します。
const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');

// 軽量で高速なモデルをデフォルトに設定 (ユーザー指示に基づき gemini-2.5-flash を使用)
const DEFAULT_MODEL = "models/gemini-2.5-flash-preview-09-2025";

/**
 * ステップ3: LLM (Gemini API) を使用してタイトルの不適切性を判定します。
 *
 * @param {string} title - 判定対象のファイルタイトル。
 * @param {string} [modelName=DEFAULT_MODEL] - (オプション) 使用するGeminiモデル名。
 * 例: "models/gemini-2.5-flash-preview-09-2025", "models/gemma-3-27b-it"
 * @returns {{isBad: boolean | null, type: string}} 判定結果オブジェクト。
 * isBad: true (不適切), false (適切), null (判定不明/エラー)
 * 例: { isBad: true, type: '指示文・質問文・会話の断片' }
 * 例: { isBad: false, type: '適切なタイトル' }
 * 例: { isBad: null, type: '判定不明 (APIキー未設定)' }
 */
function step3_checkWithLLM(title, modelName = DEFAULT_MODEL) {
  if (!API_KEY) {
    Logger.log("エラー: スクリプトプロパティ 'GEMINI_API_KEY' が設定されていません。");
    // 修正: true -> null (判定不明)
    return { isBad: null, type: '判定不明 (APIキー未設定)' };
  }

  // API URL。モデル名を動的に組み込みます。
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${API_KEY}`;

  let prompt = `
あなたは高性能なファイルタイトル判定AIです。
以下の「判定基準」に基づき、入力された「判定対象タイトル」が不適切かどうかを判定し、JSON形式で回答してください。

# 判定基準
- **適切なタイトル**: ファイルの内容を具体的かつ簡潔に示している。 (例: 「RANSACについて説明してください.md」、「愛媛大学DX推進企画 業務改善アイディアソン.pdf」)
- **不適切なタイトル**: 以下のいずれかに該当するもの。
  1.  **デフォルト・汎用ファイル名**: (例: 「新規ドキュメント 1」)
  2.  **URL・URI**: (例: 「https://youtu.be/...」) ※ステップ1, 2で検出漏れした場合
  3.  **指示文・質問文・会話の断片**: (例: 「URLも含めてください」、「なるほど、その歴史的経緯の説明には...」)
  4.  **システム・設定ファイル名**: (例: 「README.md」) ※ステップ1, 2で検出漏れした場合
  5.  **タイムスタンプ・日付のみ**: (例: 「20251101.pdf」) ※ステップ1, 2で検出漏れした場合
  6.  **OS自動命名サフィックス**: (例: 「grok_report (1).pdf」) ※ステップ1, 2で検出漏れした場合
  7.  **文字化け・エンコーディングエラー**: (例: 「ءا.pdf」)
  8.  **文脈依存・暗号的なタイトル**: (例: 「sasakilab 2025-11-07 dmesg解析」)
  9.  **汎用的・内容不明なタイトル**: (例: 「カスタムプロンプト編集」、「合成データの関連する考察について」)

# 判定対象タイトル
"${title}"

# 出力フォーマット (JSON)
{
  "isBad": (true または false),
  "type": "(「適切なタイトル」または上記「不適切なタイトル」の類型名)"
}
`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      // responseMimeType: "application/json", // Gemmaでは削除する必要がある
      temperature: 0.0, // 判定の安定性を高めるため、創造性を0に
    },
  };

  // --- 修正箇所: モデルによるペイロードの分岐 ---
  const isGemmaModel = modelName.includes("gemma-3");

  if (isGemmaModel) {
    // GemmaはJSONモードをサポートしていないため、プロンプトで出力を強く指示
    prompt += `
重要: 回答は上記のJSONオブジェクトのみを含み、前置きや説明（「承知しました」など）を一切含めないでください。
`;
    payload.contents = [{ parts: [{ text: prompt }] }];
    // payload.generationConfig から responseMimeType は削除 (または最初から含めない)
  } else {
    // Gemini Flash など、JSONモードをサポートするモデル
    payload.generationConfig.responseMimeType = "application/json";
  }
  // --- 修正箇所ここまで ---


  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true, // HTTPエラー（429等）でスクリプトが停止しないようにする
  };

  try {
    const response = UrlFetchApp.fetch(API_URL, options);
    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();

    if (responseCode !== 200) {
      Logger.log(`APIエラー (HTTP ${responseCode}): ${responseBody}`);
      // 修正: true -> null (判定不明)
      return { isBad: null, type: `判定不明 (APIエラー HTTP ${responseCode})` };
    }

    const data = JSON.parse(responseBody);
    
    if (!data.candidates || !data.candidates[0].content.parts[0].text) {
       Logger.log(`APIエラー (不正なレスポンス): ${responseBody}`);
       // 修正: true -> null (判定不明)
       return { isBad: null, type: '判定不明 (不正なレスポンス)' };
    }

    // APIが生成したJSON文字列を再度パースしてオブジェクトとして返す
    let resultJson = data.candidates[0].content.parts[0].text;

    // --- 修正箇所: GemmaのテキストレスポンスからJSONを抽出 ---
    if (isGemmaModel) {
      // GemmaはJSONモードではないため、テキストからJSON部分を抽出する試み
      const match = resultJson.match(/\{[\s\S]*\}/); // 最初の { から最後の } までを抽出
      if (match) {
        resultJson = match[0];
      }
      // もしGemmaがJSON "のみ" を返せなかった場合、ここでパースエラーが発生する可能性がある
    }
    // --- 修正箇所ここまで ---

    try {
      return JSON.parse(resultJson);
    } catch (parseError) {
      Logger.log(`JSONパースエラー (モデル: ${modelName}): ${parseError}\nレスポンス原文: ${resultJson}`);
      // 修正: true -> null (判定不明)
      return { isBad: null, type: '判定不明 (JSONパース失敗)' };
    }

  } catch (e) {
    Logger.log(`LLM判定エラー (タイトル: ${title}): ${e}`);
    // 修正: true -> null (判定不明)
    return { isBad: null, type: '判定不明 (GAS実行例外)' };
  }
}

/**
 * 動作テスト用の関数です。
 * GASエディタでこの関数を選択して実行してください。
 */
function runTest() {
  if (!API_KEY) {
    Logger.log("テスト実行不可: スクリプトプロパティ 'GEMINI_API_KEY' が設定されていません。");
    return;
  }

  const testTitles = [
    // 適切なタイトルの例
    "Git における pull・fetch・merge の動作理解と分岐ブランチの統合手順", // 適切
    "量子エンタングルメント（量子もつれ）に関する理解レポート", // 適切
    // 不適切なタイトルの例 (ステップ1, 2を通過した前提)
    "なるほど、その歴史的経緯の説明にはとても説力があります", // 不適切: 会話の断片
    "カスタムプロンプト編集", // 不適切: 汎用的・内容不明
    "sasakilab 2025-11-07 dmesg解析", // 不適切: 文脈依存
    "20240122_ءا.pdf" // 不適切: 文字化け
  ];

  Logger.log("LLM判定テストを開始します...");

  testTitles.forEach(title => {
    // APIのレート制限（例: Free tierで1分間に60回）を避けるため、1秒待機
    Utilities.sleep(1000); 
    
    // デフォルトモデル (gemini-2.5-flash) でテスト
    const resultFlash = step3_checkWithLLM(title); // modelName を省略
    let statusFlash = resultFlash.isBad === null ? '判定不明' : (resultFlash.isBad ? '不適切' : '適切');
    Logger.log(`[Flash]【${title}】 -> 判定: ${statusFlash} (${resultFlash.type})`);
    
    // APIのレート制限のため、さらに待機
    Utilities.sleep(1000); 

    // Gemma 3 モデルでテスト
    const resultGemma = step3_checkWithLLM(title, "models/gemma-3-27b-it");
    let statusGemma = resultGemma.isBad === null ? '判定不明' : (resultGemma.isBad ? '不適切' : '適切');
    Logger.log(`[Gemma3]【${title}】 -> 判定: ${statusGemma} (${resultGemma.type})`);
  });

  Logger.log("LLM判定テストが完了しました。");
}