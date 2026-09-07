/**
 * 指定された〇×問題とそのMoodleでの正解に基づいて、Gemini APIを使用して解説文を生成します。
 * 結果はキャッシュされ、同じ入力に対してはキャッシュから返されます。
 *
 * @param {string} questionText 解説を生成する対象の問題文。
 * @param {string} moodleAnswer Moodleで正解とされている解答 ("true" または "false")。
 * @param {string} geminiInferredAnswer Geminiによって推論された解答 ("true" または "false")。
 * @param {string} selectedModelName 解説生成に使用するGeminiモデルのID。
 * @param {object} userGenConfig ユーザーがUIで選択した生成設定 {temperature, topK, topP}。
 * @return {object} 成功時は { explanation: string, duration: number, fromCache: boolean } を、失敗時はエラーをスローします。
 */
function getExplanationForQuestion(questionText, moodleAnswer, geminiInferredAnswer, selectedModelName, userGenConfig) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    Logger.log('エラー: GEMINI_API_KEY がスクリプトプロパティに設定されていません。');
    throw new Error('APIキーが設定されていません。');
  }

  if (!questionText) {
    Logger.log('エラー: 解説生成のための問題文が提供されていません。');
    throw new Error('解説生成のための問題文が提供されていません。');
  }
  
  const isValidMoodleAnswer = (moodleAnswer === 'true' || moodleAnswer === 'false');
  const isValidGeminiAnswer = (geminiInferredAnswer === 'true' || geminiInferredAnswer === 'false');

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
  if (isValidMoodleAnswer && isValidGeminiAnswer && moodleAnswer !== geminiInferredAnswer) {
    prompt = `以下の〇×問題について、Moodleが示す正解とAIによる推論結果が異なっています。\n\n問題文:\n「${questionText}」\n\nMoodleの正解: 「${moodleAnswer}」\nAIの推論結果: 「${geminiInferredAnswer}」\n\nなぜこのような不一致が生じたのか、それぞれの解答の根拠、問題文の解釈の曖昧さや多義性、AIが誤解しやすいポイントなどを考慮して、詳しく解説してください。どちらの解答がより妥当性が高いかについても、可能であれば言及してください。`;
  } else if (isValidMoodleAnswer) {
    prompt = `以下の〇×問題について、なぜその答えが「${moodleAnswer}」になるのかを、問題文に基づいて具体的に、そして分かりやすく解説してください。\n\n問題文:\n「${questionText}」\n\nこの問題の正解は「${moodleAnswer}」とされています。その理由を説明してください。`;
  } else {
     Logger.log('Moodleの正解が無効なため、問題文のみで一般的な解説を試みます。');
     prompt = `以下の〇×問題について、考えられる解答とその理由を解説してください。\n\n問題文:\n「${questionText}」`;
  }

  // --- キャッシュ処理 ---
  const cache = CacheService.getScriptCache();
  // キャッシュキーは、プロンプト、モデル名、主要な生成パラメータの組み合わせから生成
  // パラメータオブジェクトを文字列化してハッシュ化するなど、より堅牢なキー生成も検討可能
  const cacheKeyParams = `model:${selectedModelName}_temp:${generationConfig.temperature}_topK:${generationConfig.topK}_topP:${generationConfig.topP}`;
  // プロンプトが非常に長くなる可能性を考慮し、ハッシュ化を推奨
  // 簡単な例として、プロンプトの最初のN文字とパラメータを組み合わせる
  // const promptSnippetForCache = prompt.substring(0, 200); // プロンプトが長すぎる場合、キーが長くなりすぎるのを防ぐ
  // const cacheKey = `exp_${Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, promptSnippetForCache + cacheKeyParams).map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('')}`;
  
  // よりシンプルなキー生成（プロンプトがユニークであればこれで十分な場合も）
  // ただし、プロンプトが非常に長い場合、キャッシュキーの長さに制限があるため注意が必要 (最大250文字)
  // そのため、プロンプトとパラメータを結合したものをハッシュ化するのが最も安全
  const combinedKeyString = prompt + JSON.stringify(generationConfig) + selectedModelName;
  const cacheKey = `exp_${Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, combinedKeyString).map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, '0')).join('')}`;


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
  const sampleQuestionText = "AIはアーティフィシャル・インテリジェンスの略語で、日本語では人工知能と呼ばれる";
  const sampleMoodleAnswer = "true";
  const sampleGeminiInferredAnswer = "true"; // 一致する場合
  const sampleModel = 'gemini-1.5-flash-latest';
  const sampleUserGenConfig = { temperature: 0.7, topK: 40, topP: 0.95 };

  try {
    Logger.log(`--- 1回目の解説生成テスト (キャッシュなし想定) ---`);
    const result1 = getExplanationForQuestion(sampleQuestionText, sampleMoodleAnswer, sampleGeminiInferredAnswer, sampleModel, sampleUserGenConfig);
    if (result1 && result1.explanation) {
      Logger.log(`生成された解説1 (処理時間: ${result1.duration.toFixed(3)}秒, キャッシュから: ${result1.fromCache}):`);
      Logger.log(result1.explanation.substring(0,100) + "...");
    } else {
      Logger.log("解説1が生成されませんでした。");
    }

    Logger.log(`\n--- 2回目の解説生成テスト (キャッシュあり想定) ---`);
    const result2 = getExplanationForQuestion(sampleQuestionText, sampleMoodleAnswer, sampleGeminiInferredAnswer, sampleModel, sampleUserGenConfig);
    if (result2 && result2.explanation) {
      Logger.log(`生成された解説2 (処理時間: ${result2.duration.toFixed(3)}秒, キャッシュから: ${result2.fromCache}):`);
      Logger.log(result2.explanation.substring(0,100) + "...");
    } else {
      Logger.log("解説2が生成されませんでした。");
    }

  } catch (error) {
    Logger.log(`解説生成テスト中にエラーが発生しました: ${error.message}`);
  }
}
