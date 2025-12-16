/**
 * @file Code.gs
 * @description Google Workspace Add-on (CardService) using Gemini API.
 */

const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';
const API_VERSION = 'v1beta';

/**
 * アドオン起動時（ホームページ）のUIを作成
 * 自動的にタイトル案を生成して表示する
 */
function onHomepage(e) {
  try {
    // ドキュメント取得を試みる (onHomepageではnullの場合があるためtry-catchやnullチェック推奨)
    // 実際には DocumentApp.getActiveDocument() はonHomepageトリガーでも動作することが多いが、
    // コンテキストによっては取れない場合もある。
    let doc = null;
    try {
        doc = DocumentApp.getActiveDocument();
    } catch (ex) {
        // 無視
    }

    if (!doc) {
      return buildErrorCard('ドキュメントが開かれていないか、アクセスできません。');
    }

    const text = doc.getBody().getText();
    if (!text || text.trim().length === 0) {
      return buildErrorCard('ドキュメントが空です。文字を入力してから実行してください。');
    }

    // Gemini API呼び出し (自動生成)
    const temperature = 0.5;
    const result = callGeminiApi(text.substring(0, 30000), 5, temperature);
    
    // 結果表示カードを返す
    return buildResultCard(result.titles, result.prompt, temperature);

  } catch (err) {
    return buildErrorCard('エラーが発生しました: ' + err.message);
  }
}

/**
 * 「お任せ」ボタンが押されたときのアクション
 * Gemini APIを呼び出し、生成されたタイトルを即座に適用する
 */
function quickApplyAction(e) {
  try {
    const doc = DocumentApp.getActiveDocument();
    if (!doc) {
      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText('ドキュメントが開かれていません'))
        .build();
    }
    
    const text = doc.getBody().getText();
    if (!text || text.trim().length === 0) {
      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText('ドキュメントが空です'))
        .build();
    }

    // Gemini API呼び出し (1つだけ生成)
    const temperature = parseFloat(e.formInput.temperature_setting || "0.5");
    const result = callGeminiApi(text.substring(0, 30000), 1, temperature);
    const newTitle = result.titles[0];
    
    // タイトル適用
    doc.setName(newTitle);

    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText('タイトルを変更しました: ' + newTitle))
      .build();

  } catch (err) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText('エラー: ' + err.message))
      .build();
  }
}

/**
 * 「生成」ボタン（または再生成）が押されたときのアクション
 * Gemini APIを呼び出し、結果カードを更新する
 */
function generateAction(e) {
  try {
    const doc = DocumentApp.getActiveDocument();
    if (!doc) {
      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText('ドキュメントが開かれていません'))
        .build();
    }
    
    const text = doc.getBody().getText();
    if (!text || text.trim().length === 0) {
      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification().setText('ドキュメントが空です'))
        .build();
    }

    // Gemini API呼び出し
    const temperature = parseFloat(e.formInput.temperature_setting || "0.5");
    const result = callGeminiApi(text.substring(0, 30000), 5, temperature);
    
    // 結果表示カードの作成と更新
    const card = buildResultCard(result.titles, result.prompt, temperature);
    return CardService.newActionResponseBuilder()
      .setNavigation(CardService.newNavigation().updateCard(card))
      .build();

  } catch (err) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText('エラー: ' + err.message))
      .build();
  }
}

/**
 * プロンプトを表示するカードをプッシュする
 */
function showPromptAction(e) {
  const prompt = e.parameters.prompt;
  const card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader().setTitle('使用されたプロンプト'));
  
  const section = CardService.newCardSection();
  // プロンプトが長い場合も考慮してそのまま表示
  section.addWidget(CardService.newTextParagraph().setText(prompt));
  
  card.addSection(section);
  
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(card.build()))
    .build();
}

/**
 * 結果選択用のカードを作成する (CardBuilderを返す)
 */
function buildResultCard(titles, prompt, currentTemperature = 0.5) {
  const card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader().setTitle('提案されたタイトル'));

  const section = CardService.newCardSection();
  
  if (!titles || titles.length === 0) {
    section.addWidget(CardService.newTextParagraph().setText('案が生成されませんでした。'));
  } else {
    section.addWidget(CardService.newTextParagraph().setText('適用したいタイトルを選択してください:'));

    // ラジオボタンの作成
    const selectionInput = CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.RADIO_BUTTON)
      .setTitle('タイトル案')
      .setFieldName('selected_title'); // フォームのキー名

    titles.forEach((title, index) => {
      // 最初の項目をデフォルト選択にする
      selectionInput.addItem(title, title, index === 0);
    });

    section.addWidget(selectionInput);

    // 「適用」ボタン
    const applyAction = CardService.newAction().setFunctionName('applyAction');
    section.addWidget(
      CardService.newTextButton()
        .setText('選択したタイトルを適用')
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setOnClickAction(applyAction)
    );
  }

  // 再生成・お任せボタンのセクション
  const footerSection = CardService.newCardSection();
  
  // Temperature設定 (0.1 - 1.0)
  const tempDropdown = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle('創造性 (Temperature)')
    .setFieldName('temperature_setting');
  
  for (let i = 1; i <= 10; i++) {
    const val = (i / 10).toFixed(1); // "0.1", "0.2"...
    // currentTemperatureと比較して選択状態にする
    const isSelected = Math.abs(parseFloat(val) - parseFloat(currentTemperature)) < 0.001;
    tempDropdown.addItem(val, val, isSelected);
  }
  footerSection.addWidget(tempDropdown);

  // 「再生成」ボタン (旧: 生成ボタン)
  const regenAction = CardService.newAction().setFunctionName('generateAction');
  footerSection.addWidget(
    CardService.newTextButton()
      .setText('タイトル案を再生成')
      .setOnClickAction(regenAction)
  );

  // 「お任せ」ボタン (便利なため残す)
  const quickAction = CardService.newAction().setFunctionName('quickApplyAction');
  footerSection.addWidget(
    CardService.newTextButton()
      .setText('お任せで適用 (1つ生成して適用)')
      .setOnClickAction(quickAction)
  );

  // プロンプト確認ボタン (もしpromptがあれば)
  if (prompt) {
    const promptAction = CardService.newAction()
        .setFunctionName('showPromptAction')
        .setParameters({ prompt: prompt });
        
    footerSection.addWidget(
      CardService.newTextButton()
        .setText('使用したプロンプトを確認')
        .setOnClickAction(promptAction)
    );
  }

  card.addSection(section);
  card.addSection(footerSection);
  
  return card.build();
}

/**
 * エラー時や初期状態用のカードを作成
 */
function buildErrorCard(message) {
  const card = CardService.newCardBuilder();
  card.setHeader(CardService.newCardHeader().setTitle('AI Title Generator'));
  
  const section = CardService.newCardSection();
  section.addWidget(CardService.newTextParagraph().setText(message));
  
  // 「生成」ボタン (リトライ用)
  const action = CardService.newAction().setFunctionName('generateAction');
  section.addWidget(
    CardService.newTextButton()
      .setText('タイトル案を生成')
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      .setOnClickAction(action)
  );
  
  card.addSection(section);
  return card.build();
}

/**
 * 「適用」ボタンが押されたときのアクション
 */
function applyAction(e) {
  // フォーム入力値を取得
  const selectedTitle = e.formInput.selected_title;
  
  if (!selectedTitle) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText('タイトルが選択されていません'))
      .build();
  }

  try {
    const doc = DocumentApp.getActiveDocument();
    doc.setName(selectedTitle);

    // 完了通知と、ルートカードへのリセット（任意）
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText('変更しました: ' + selectedTitle))
      // .setNavigation(CardService.newNavigation().popToRoot()) // 最初の画面に戻りたければコメントアウト解除
      .build();
      
  } catch (err) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText('適用エラー: ' + err.message))
      .build();
  }
}

/**
 * Gemini API 呼び出し
 */
function callGeminiApi(text, count = 5, temperature = 0.5) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) throw new Error("APIキーが設定されていません");

  const endpoint = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

  const prompt = `
    以下のテキストの内容に基づき、適切で魅力的なドキュメントのタイトル案を${count}つ提案してください。
    視認性を高めるため、その文書を特徴づける重要な単語がタイトルの前方に来るような案を優先してください。
    出力は純粋なJSON配列形式（["タイトル1", "タイトル2", ...]）のみとしてください。
    
    テキスト:
    ${text}
  `;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: temperature,
      responseMimeType: "application/json"
    }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(endpoint, options);
  const json = JSON.parse(response.getContentText());

  if (response.getResponseCode() !== 200) {
    throw new Error(json.error?.message || 'API Error');
  }

  const contentText = json.candidates[0].content.parts[0].text;
  return {
    titles: JSON.parse(contentText),
    prompt: prompt
  };
}