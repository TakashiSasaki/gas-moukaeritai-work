/**
 * @file Code.gs
 * @description Google Workspace Add-on (CardService) using Gemini API.
 */

const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';
const API_VERSION = 'v1beta';

/**
 * アドオン起動時（ホームページ）のUIを作成
 */
function onHomepage(e) {
  const card = CardService.newCardBuilder();
  
  // ヘッダー
  card.setHeader(CardService.newCardHeader().setTitle('AI Title Generator'));

  // セクション1: 説明とボタン
  const section = CardService.newCardSection();
  
  section.addWidget(
    CardService.newTextParagraph()
      .setText('現在のドキュメント内容を分析し、最適なタイトル案を提案します。')
  );

  // 「生成」ボタン
  // ボタンを押すと generateAction 関数を実行する
  const action = CardService.newAction().setFunctionName('generateAction');
  
  section.addWidget(
    CardService.newTextButton()
      .setText('タイトル案を生成（選択）')
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      .setOnClickAction(action)
  );

  // 「お任せ」ボタン
  // ボタンを押すと quickApplyAction 関数を実行する
  const quickAction = CardService.newAction().setFunctionName('quickApplyAction');

  section.addWidget(
    CardService.newTextButton()
      .setText('お任せでタイトルを適用')
      .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
      .setOnClickAction(quickAction)
  );

  card.addSection(section);
  return card.build();
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
    const titles = callGeminiApi(text.substring(0, 30000), 1);
    const newTitle = titles[0];
    
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
 * 「生成」ボタンが押されたときのアクション
 * Gemini APIを呼び出し、結果を選択画面として表示する
 */
function generateAction(e) {
  try {
    // ドキュメント本文を取得
    // ※CardServiceでは getActiveDocument() がnullになることがあるため、eから取得する場合もあるが、
    // currentonlyスコープでは通常通り取得可能
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
    const titles = callGeminiApi(text.substring(0, 30000));
    
    // 結果表示カードの作成
    return createResultCard(titles);

  } catch (err) {
    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText('エラー: ' + err.message))
      .build();
  }
}

/**
 * 結果選択用のカードを作成してナビゲーションにプッシュする
 */
function createResultCard(titles) {
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

  card.addSection(section);
  
  // ナビゲーションを更新（新しいカードを重ねて表示）
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(card.build()))
    .build();
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
function callGeminiApi(text, count = 5) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) throw new Error("APIキーが設定されていません");

  const endpoint = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

  const prompt = `
    以下のテキストの内容に基づき、適切で魅力的なドキュメントのタイトル案を${count}つ提案してください。
    出力は純粋なJSON配列形式（["タイトル1", "タイトル2", ...]）のみとしてください。
    
    テキスト:
    ${text}
  `;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
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
  return JSON.parse(contentText);
}