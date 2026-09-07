/**
 * 指定された多肢選択問題とそのMoodleでの正解、Geminiの推論に基づいて、Gemini APIを使用して解説文を生成します。
 * 結果はキャッシュされ、同じ入力に対してはキャッシュから返されます。
 *
 * @param {string} questionText 解説を生成する対象の問題文。
 * @param {Array<Object>} choices 問題の選択肢の配列。各オブジェクトは { text: string } を持つ。
 * @param {string} moodleCorrectAnswerText Moodleで正解とされている選択肢のテキスト。
 * @param {string} geminiInferredAnswerText Geminiによって推論された選択肢のテキスト。
 * @param {string} selectedModelName 解説生成に使用するGeminiモデルのID。
 * @param {object} userGenConfig ユーザーがUIで選択した生成設定 {temperature, topK, topP}。
 * @return {object} 成功時は { explanation: string, duration: number, fromCache: boolean } を、失敗時はエラーをスローします。
 */
function getExplanationForQuestion(questionText, choices, moodleCorrectAnswerText, geminiInferredAnswerText, selectedModelName, userGenConfig) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    Logger.log('エラー: GEMINI_API_KEY がスクリプトプロパティに設定されていません。');
    throw new Error('APIキーが設定されていません。');
  }

  if (!questionText) {
    Logger.log('エラー: 解説生成のための問題文が提供されていません。');
    throw new Error('解説生成のための問題文が提供されていません。');
  }

  // Validate inputs (basic check, could be more robust e.g. check if answers are in choices)
  const isValidMoodleAnswer = typeof moodleCorrectAnswerText === 'string' && moodleCorrectAnswerText.trim() !== '';
  const isValidGeminiAnswer = typeof geminiInferredAnswerText === 'string' && geminiInferredAnswerText.trim() !== '';
  const choicesText = choices && Array.isArray(choices) ? choices.map(c => `- ${c.text}`).join('\n') : '選択肢情報なし';


  if (!selectedModelName) {
    selectedModelName = 'gemini-1.5-flash-latest';
    Logger.log('モデル名が指定されなかったため、解説生成にはデフォルトの ' + selectedModelName + ' を使用します。');
  }
  // Logger.log('解説生成に使用するGeminiモデル: ' + selectedModelName); // キャッシュヒット時は不要なログになるためコメントアウト

  const tempValue = (userGenConfig && typeof userGenConfig.temperature === 'number') ? userGenConfig.temperature : 0.7;
  const topKValue = (userGenConfig && typeof userGenConfig.topK === 'number') ? userGenConfig.topK : 40;
  const topPValue = (userGenConfig && typeof userGenConfig.topP === 'number') ? userGenConfig.topP : 0.95;

  const generationConfig = {
    temperature: tempValue,
    topP: topPValue,
    topK: topKValue,
    maxOutputTokens: 2048,
  };
  // Logger.log(`解説生成に使用する generationConfig for ${selectedModelName}: ${JSON.stringify(generationConfig)}`); // キャッシュヒット時は不要なログ

  let prompt;
  if (isValidMoodleAnswer && isValidGeminiAnswer && moodleCorrectAnswerText !== geminiInferredAnswerText) {
    prompt = `以下の多肢選択問題について、Moodleが示す正解とAIによる推論結果が異なっています。\n\n問題文:\n「${questionText}」\n\n選択肢:\n${choicesText}\n\nMoodleの正解: 「${moodleCorrectAnswerText}」\nAIの推論結果: 「${geminiInferredAnswerText}」\n\nそれぞれの解答の根拠、問題文の解釈、AIが誤解しやすいポイントなどを考慮して、詳しく解説してください。どちらの解答がより妥当性が高いかについても、可能であれば言及してください。`;
  } else if (isValidMoodleAnswer) {
    prompt = `以下の多肢選択問題について、なぜ「${moodleCorrectAnswerText}」が正解となるのか、問題文と選択肢に基づいて具体的に解説してください。可能であれば、他の選択肢がなぜ誤りなのかについても触れてください。\n\n問題文:\n「${questionText}」\n\n選択肢:\n${choicesText}\n\nこの問題の正解は「${moodleCorrectAnswerText}」とされています。その理由を説明してください。`;
  } else {
     Logger.log('Moodleの正解が無効、またはGeminiの解答と一致しているため、一般的な解説を試みます。');
     prompt = `以下の多肢選択問題について、各選択肢が正解である可能性と、そう判断する理由を解説してください。\n\n問題文:\n「${questionText}」\n\n選択肢:\n${choicesText}`;
  }

  // --- キャッシュ処理 ---
  const cache = CacheService.getScriptCache();
  const choicesString = JSON.stringify(choices); // choicesを文字列化してキーに含める
  const combinedKeyString = questionText + choicesString + moodleCorrectAnswerText + geminiInferredAnswerText + JSON.stringify(generationConfig) + selectedModelName;
  const cacheKey = `exp_mc_${Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, combinedKeyString).map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('')}`;
  // `exp_mc_` prefix for multi-choice explanations to avoid collision with potential other types

  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    Logger.log(`キャッシュヒット (キー: ${cacheKey}) - モデル: ${selectedModelName}`);
    const parsedResult = JSON.parse(cachedResult);
    return { ...parsedResult, fromCache: true }; // キャッシュから取得したことを示すフラグを追加
  }
  Logger.log(`キャッシュミス (キー: ${cacheKey}) - モデル: ${selectedModelName} - APIを呼び出します。`);
  // --- キャッシュ処理ここまで ---

  const contents = [{ role: 'user', parts: [{ text: prompt }] }];
  const dataPayload = { contents: contents, generationConfig: generationConfig };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModelName}:generateContent?key=${apiKey}`;
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(dataPayload),
    muteHttpExceptions: true,
  };

  const startTime = new Date().getTime();

  try {
    const response = UrlFetchApp.fetch(url, options);
    const endTime = new Date().getTime();
    const duration = (endTime - startTime) / 1000;

    const responseCode = response.getResponseCode();
    const responseBody = response.getContentText();
    Logger.log(`Gemini API (解説生成 - ${selectedModelName}) Response Code: ${responseCode}, Duration: ${duration.toFixed(3)} seconds`);

    if (responseCode === 200) {
      const jsonResponse = JSON.parse(responseBody);
      if (jsonResponse.candidates && jsonResponse.candidates.length > 0 &&
          jsonResponse.candidates[0].content && jsonResponse.candidates[0].content.parts &&
          jsonResponse.candidates[0].content.parts.length > 0 &&
          jsonResponse.candidates[0].content.parts[0].text) {

        const explanationText = jsonResponse.candidates[0].content.parts[0].text;
        const resultToCache = { explanation: explanationText.trim(), duration: duration };
        // キャッシュに保存 (有効期限: 例として6時間 = 21600秒)
        cache.put(cacheKey, JSON.stringify(resultToCache), 21600);
        Logger.log(`結果をキャッシュに保存しました (キー: ${cacheKey})`);
        return { ...resultToCache, fromCache: false }; // APIから取得したことを示す
      } else if (jsonResponse.candidates && jsonResponse.candidates.length > 0 && jsonResponse.candidates[0].finishReason) {
         let reason = jsonResponse.candidates[0].finishReason;
         let message = `Gemini APIが解説を生成できませんでした。理由: ${reason}`;
         if (jsonResponse.candidates[0].safetyRatings) {
           message += ` Safety Ratings: ${JSON.stringify(jsonResponse.candidates[0].safetyRatings)}`;
         }
         Logger.log(message);
         throw new Error(message);
      } else {
        Logger.log(`エラー: Gemini API (${selectedModelName}) からの解説レスポンスに期待される構造のデータが見つかりませんでした。Body: ${responseBody.substring(0,500)}`);
        throw new Error('Geminiからの解説レスポンス形式が不正です。');
      }
    } else {
      Logger.log(`エラー: Gemini API (${selectedModelName}) 解説生成呼び出し失敗。HTTP ${responseCode}。Body: ${responseBody.substring(0,500)}`);
      throw new Error(`Gemini API解説生成エラー (HTTP ${responseCode}): ${responseBody.substring(0,200)}...`);
    }
  } catch (e) {
    const endTime = new Date().getTime();
    const duration = (endTime - startTime) / 1000;
    Logger.log(`例外発生: Gemini API (${selectedModelName}) 解説生成呼び出し中。所要時間(エラー発生まで): ${duration.toFixed(3)}秒。詳細: ${e.toString()}`);
    throw new Error(`Gemini API解説生成呼び出し中に例外発生: ${e.message || e.toString()}`);
  }
}


// --- テスト用のヘルパー関数 (explain.gs 内でテストする場合) ---
function testGetExplanationWithCache() {
  const sampleQuestionText = "「AI」の正式名称は何ですか？";
  const sampleChoices = [
      { text: "Advanced Intelligence" },
      { text: "Artificial Intelligence" },
      { text: "Automated Interface" },
      { text: "Applied Integration" }
  ];
  const sampleMoodleCorrectAnswerText = "Artificial Intelligence";
  const sampleGeminiInferredAnswerText = "Artificial Intelligence"; // 一致する場合
  const sampleGeminiInferredAnswerTextMismatch = "Advanced Intelligence"; // 不一致の場合

  const sampleModel = 'gemini-1.5-flash-latest';
  const sampleUserGenConfig = { temperature: 0.7, topK: 40, topP: 0.95 };

  try {
    Logger.log(`--- 1回目の解説生成テスト (一致、キャッシュなし想定) ---`);
    const result1 = getExplanationForQuestion(sampleQuestionText, sampleChoices, sampleMoodleCorrectAnswerText, sampleGeminiInferredAnswerText, sampleModel, sampleUserGenConfig);
    if (result1 && result1.explanation) {
      Logger.log(`生成された解説1 (処理時間: ${result1.duration.toFixed(3)}秒, キャッシュから: ${result1.fromCache}):`);
      Logger.log(result1.explanation.substring(0,150) + "...");
    } else {
      Logger.log("解説1が生成されませんでした。");
    }

    Logger.log(`\n--- 2回目の解説生成テスト (一致、キャッシュあり想定) ---`);
    const result2 = getExplanationForQuestion(sampleQuestionText, sampleChoices, sampleMoodleCorrectAnswerText, sampleGeminiInferredAnswerText, sampleModel, sampleUserGenConfig);
    if (result2 && result2.explanation) {
      Logger.log(`生成された解説2 (処理時間: ${result2.duration.toFixed(3)}秒, キャッシュから: ${result2.fromCache}):`);
      Logger.log(result2.explanation.substring(0,150) + "...");
    } else {
      Logger.log("解説2が生成されませんでした。");
    }

    Logger.log(`\n--- 3回目の解説生成テスト (不一致、キャッシュなし想定) ---`);
    const result3 = getExplanationForQuestion(sampleQuestionText, sampleChoices, sampleMoodleCorrectAnswerText, sampleGeminiInferredAnswerTextMismatch, sampleModel, sampleUserGenConfig);
    if (result3 && result3.explanation) {
      Logger.log(`生成された解説3 (処理時間: ${result3.duration.toFixed(3)}秒, キャッシュから: ${result3.fromCache}):`);
      Logger.log(result3.explanation.substring(0,150) + "...");
    } else {
      Logger.log("解説3が生成されませんでした。");
    }

    Logger.log(`\n--- 4回目の解説生成テスト (不一致、キャッシュあり想定) ---`);
    const result4 = getExplanationForQuestion(sampleQuestionText, sampleChoices, sampleMoodleCorrectAnswerText, sampleGeminiInferredAnswerTextMismatch, sampleModel, sampleUserGenConfig);
    if (result4 && result4.explanation) {
      Logger.log(`生成された解説4 (処理時間: ${result4.duration.toFixed(3)}秒, キャッシュから: ${result4.fromCache}):`);
      Logger.log(result4.explanation.substring(0,150) + "...");
    } else {
      Logger.log("解説4が生成されませんでした。");
    }

  } catch (error) {
    Logger.log(`解説生成テスト中にエラーが発生しました: ${error.message}`);
    Logger.log(`スタックトレース: ${error.stack}`);
  }
}