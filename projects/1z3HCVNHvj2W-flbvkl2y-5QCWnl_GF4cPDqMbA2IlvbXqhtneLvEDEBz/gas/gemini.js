/**
 * Google Apps ScriptからGemini APIを呼び出し、
 * 多肢選択問題のリストに対する解答を推論させます。
 * @param {Array<Object>} questionsToProcess 質問の配列。各オブジェクトは { question_number, question_title, question_text, choices } を持つ。
 * @param {string} selectedModelName 使用するGeminiモデルのID。
 * @param {object} userGenConfig ユーザーがUIで選択した生成設定 {temperature, topK, topP}。
 * @return {Object} 結果 ({ results: Array<Object>, duration: number, generationConfigUsed: Object }) またはエラーをスロー。
 */
function getGeminiAnswersForQuiz(questionsToProcess, selectedModelName, userGenConfig) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    Logger.log('エラー: GEMINI_API_KEY がスクリプトプロパティに設定されていません。');
    throw new Error('APIキーが設定されていません。Gemini APIを呼び出すには、スクリプトプロパティに GEMINI_API_KEY を設定してください。');
  }

  if (!selectedModelName) {
    selectedModelName = 'gemini-1.5-flash-latest'; // デフォルトモデル
    Logger.log('モデル名が指定されなかったため、デフォルトの ' + selectedModelName + ' を使用します。');
  }
  Logger.log('使用するGeminiモデル: ' + selectedModelName);

  // ユーザー指定のパラメータを使用。指定がない場合はUIのデフォルト値をフォールバックとして使用。
  // UI側でデフォルト値が設定されているため、通常はuserGenConfigに値が入ってくる想定。
  const tempValue = (userGenConfig && typeof userGenConfig.temperature === 'number') ? userGenConfig.temperature : 0.7;
  const topKValue = (userGenConfig && typeof userGenConfig.topK === 'number') ? userGenConfig.topK : 10;
  const topPValue = (userGenConfig && typeof userGenConfig.topP === 'number') ? userGenConfig.topP : 0.7;

  const generationConfig = {
    temperature: tempValue,
    topP: topPValue,
    topK: topKValue,
    maxOutputTokens: 8192, // この値はサーバーサイドで固定
    responseMimeType: 'application/json',
    responseSchema: {
      type: 'array',
      description: 'クイズの質問のリストです。', // Note: Consider swapping with items.description if more accurate.
      items: {
        type: 'object',
        description: '個々の多肢選択形式のクイズの質問とその解答を表します。',
        properties: {
          question_number: {
            type: 'integer',
            description: '質問の通し番号です。入力されたものと同じ番号を返します。',
            example: 1,
          },
          question_title: {
            type: 'string',
            description: '質問のタイトルまたは識別子です。入力されたものと同じタイトルを返します。',
            example: 'Q1 MC',
          },
          question_text: {
            type: 'string',
            description: '質問の全文です。入力されたものと同じ問題文を返します。',
            example: '「AI」の正式名称は何ですか？',
          },
          answer_by_gemini: {
            type: 'string',
            description: 'Geminiによって推論された多肢選択形式の解答（選択肢のテキストそのもの）。',
            example: 'Artificial Intelligence',
          },
        },
        required: ['question_number', 'question_title', 'question_text', 'answer_by_gemini'],
      },
    }
  };

  Logger.log(`使用する generationConfig for ${selectedModelName}: ${JSON.stringify(generationConfig)}`);

  if (!questionsToProcess || questionsToProcess.length === 0) {
    Logger.log('処理する質問がありません。');
    // クライアントが { results: [], duration: X, generationConfigUsed: Y } を期待しているので合わせる
    return { results: [], duration: 0, generationConfigUsed: generationConfig };
  }

  const promptInstructions = `以下のJSON形式で提供される多肢選択問題のリストについて、各問題の選択肢の中から最も適切と思われる正解を一つ選び、その選択肢のテキスト全体を返してください。\n提供された各質問に対して、question_number、question_title、question_textはそのまま保持し、推論した解答の選択肢テキストを answer_by_gemini フィールドに含めて、指定されたJSONスキーマの配列形式で返してください。`;
  const contents = [{
    role: 'user',
    parts: [{ text: `${promptInstructions}\n\n${JSON.stringify(questionsToProcess, null, 2)}` }]
  }];
  const dataPayload = { generationConfig, contents };

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
    Logger.log(`Gemini API (${selectedModelName}) Response Code: ${responseCode}, Duration: ${duration.toFixed(3)} seconds`);

    if (responseCode === 200) {
      const jsonResponse = JSON.parse(responseBody);
      if (jsonResponse.candidates && jsonResponse.candidates.length > 0 &&
          jsonResponse.candidates[0].content && jsonResponse.candidates[0].content.parts &&
          jsonResponse.candidates[0].content.parts.length > 0 &&
          jsonResponse.candidates[0].content.parts[0].text) {
        const structuredOutputText = jsonResponse.candidates[0].content.parts[0].text;
        // Logger.log(`Gemini API (${selectedModelName}) Structured Output (raw): ${structuredOutputText.substring(0, 500)}...`);
        const structuredOutputJson = JSON.parse(structuredOutputText);
        return { results: structuredOutputJson, duration: duration, generationConfigUsed: generationConfig };
      } else if (jsonResponse.candidates && jsonResponse.candidates.length > 0 && jsonResponse.candidates[0].finishReason) {
         let reason = jsonResponse.candidates[0].finishReason;
         let message = `Gemini APIがコンテンツを生成できませんでした。理由: ${reason}`;
         if (jsonResponse.candidates[0].safetyRatings) {
           Logger.log(`Safety Ratings for ${selectedModelName}: ${JSON.stringify(jsonResponse.candidates[0].safetyRatings)}`);
           message += ` Safety Ratings: ${JSON.stringify(jsonResponse.candidates[0].safetyRatings)}`;
         }
         Logger.log(message);
         throw new Error(message);
      } else {
        Logger.log(`エラー: Gemini API (${selectedModelName}) からのレスポンスに期待される構造のデータが見つかりませんでした。Body: ${responseBody.substring(0,500)}`);
        throw new Error('Geminiからのレスポンス形式が不正です。');
      }
    } else {
      Logger.log(`エラー: Gemini API (${selectedModelName}) 呼び出し失敗。HTTP ${responseCode}。Body: ${responseBody.substring(0,500)}`);
      throw new Error(`Gemini APIエラー (HTTP ${responseCode}): ${responseBody.substring(0,200)}...`);
    }
  } catch (e) {
    // Ensure endTime and duration are calculated even if UrlFetchApp.fetch itself throws an error (e.g. timeout)
    const endTime = new Date().getTime();
    const duration = (endTime - startTime) / 1000;
    Logger.log(`例外発生: Gemini API (${selectedModelName}) 呼び出し中。所要時間(エラー発生まで): ${duration.toFixed(3)}秒。詳細: ${e.toString()}`);
    // Re-throw the original error or a new one with more context
    throw new Error(`Gemini API呼び出し中に例外発生: ${e.message || e.toString()}`);
  }
}

// テスト関数
function testGetGeminiAnswers() {
  const sampleQuestions = [
    {
      "question_number": 1,
      "question_title": "Q1 MC",
      "question_text": "「AI」の正式名称は何ですか？",
      "choices": [
        { "text": "Advanced Intelligence", "fraction": "0" },
        { "text": "Artificial Intelligence", "fraction": "100" },
        { "text": "Automated Interface", "fraction": "0" },
        { "text": "Applied Integration", "fraction": "0" }
      ]
    },
    {
      "question_number": 2,
      "question_title": "Q2 MC",
      "question_text": "太陽系で最も大きな惑星は何ですか？",
      "choices": [
        { "text": "地球", "fraction": "0" },
        { "text": "火星", "fraction": "0" },
        { "text": "木星", "fraction": "100" },
        { "text": "土星", "fraction": "0" }
      ]
    }
  ];

  const modelsToTest = [
    'gemini-1.5-flash-8b',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash-preview-04-17',
    'gemini-2.5-flash-preview-05-20',
    'gemini-2.5-pro-preview-05-06'
  ];

  // テスト用の生成設定 (UIのデフォルト値に合わせるか、特定の値をテスト)
  const testGenConfig = {
      temperature: 0.7,
      topK: 10,
      topP: 0.7
  };
  // または、モデルごとに異なる設定でテストすることも可能
  // const testGenConfigForModel = {
  //   'gemini-1.5-flash-8b': { temperature: 1, topK: 40, topP: 0.95 },
  //   'gemini-1.5-flash-latest': { temperature: 0.7, topK: 64, topP: 0.9 },
  //   // ...
  // };


  Logger.log(`--- 全 ${modelsToTest.length} モデルのテストを開始します ---`);
  Logger.log(`テストに使用する固定生成設定: T=${testGenConfig.temperature}, K=${testGenConfig.topK}, P=${testGenConfig.topP}`);


  modelsToTest.forEach(modelId => {
    Logger.log(`\n--- モデル: ${modelId} でテスト中 ---`);
    try {
      // const currentTestConfig = testGenConfigForModel[modelId] || testGenConfig; // モデル別設定を使う場合
      const currentTestConfig = testGenConfig; // 固定設定を使う場合

      const responseObj = getGeminiAnswersForQuiz(sampleQuestions, modelId, currentTestConfig);

      if (responseObj && typeof responseObj.results !== 'undefined' && typeof responseObj.duration !== 'undefined') {
        Logger.log(`  Geminiからの解答結果 (処理時間: ${responseObj.duration.toFixed(3)}秒):`);
        Logger.log(`  使用された生成設定: ${JSON.stringify(responseObj.generationConfigUsed)}`);
        if (responseObj.results.length > 0) {
          responseObj.results.forEach(item => {
            const questionTextSnippet = item.question_text.length > 50 ? item.question_text.substring(0, 50) + "..." : item.question_text;
            // 多肢選択問題の場合、choicesも表示するとより詳細なログになるが、ここではanswer_by_geminiのみ表示
            Logger.log(`    Q${item.question_number} (${item.question_title}): 「${questionTextSnippet}」 -> Gemini推論: ${item.answer_by_gemini}`);
          });
        } else {
          Logger.log(`  モデル ${modelId} からは解答が得られましたが、結果リストは空でした。`);
        }
      } else {
        Logger.log(`  モデル ${modelId} から予期しない形式の応答がありました。Response: ${JSON.stringify(responseObj)}`);
      }
    } catch (error) {
      Logger.log(`  モデル ${modelId} のテスト実行中にエラーが発生しました: ${error.message}`);
    }
    // APIのレート制限を避けるため、必要に応じて短い遅延を入れることも考慮できます。
    // if (modelsToTest.indexOf(modelId) < modelsToTest.length - 1) {
    //   Utilities.sleep(2000); // 次のモデルのテスト前に2秒待機 (例)
    // }
  });

  Logger.log(`\n--- 全モデルのテストが完了しました ---`);
}