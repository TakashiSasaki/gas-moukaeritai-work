# Project: Moodle True/False Question Checker with Gemini AI

This Google Apps Script project is a web application designed to assist with Moodle true/false questions. It allows users to input Moodle XML files containing true/false questions, then leverages the Google Gemini API to infer answers and generate detailed explanations for each question.

## Overview

The primary purpose of this project is to provide an intelligent tool for educators and students to analyze Moodle quiz questions. It automates the process of checking answers and generating comprehensive explanations, which can be particularly useful for understanding reasoning or identifying ambiguities in questions.

## Functionality

The core functionality is implemented across `Code.js`, `explain.js`, `gemini.js`, `getSampleXml.js`, and the web interface (`index.html`).

### Core Features

-   **`doGet()`**: (in `Code.js`) Serves as the entry point for the web application, rendering the `index.html` file. It sets the page title to "Moodle 〇×問題チェッカー" (Moodle True/False Question Checker).
-   **`getExplanationForQuestion(questionText, moodleAnswer, geminiInferredAnswer, selectedModelName, userGenConfig)`**: (in `explain.js`) Uses the Gemini API to generate a detailed explanation for a given true/false question. It considers both the Moodle-provided answer and Gemini's inferred answer. If there's a discrepancy, it attempts to explain why. Explanations are cached to improve performance.
-   **`getGeminiAnswersForQuiz(questionsToProcess, selectedModelName, userGenConfig)`**: (in `gemini.js`) Calls the Gemini API to infer true/false answers for a list of quiz questions. It takes an array of question objects and returns Gemini's inferred answers in a structured JSON format, adhering to a predefined schema.
-   **`getSampleXml()`**: (in `getSampleXml.js`) Provides a sample Moodle XML string containing true/false questions, useful for testing and demonstration.

### Code Examples

#### `Code.js`

```javascript
/**
 * HTTP GETリクエストを処理し、ウェブアプリケーションのメインページを表示します。
 * @param {Object} e - Apps Scriptによって提供されるイベントオブジェクト。
 * @return {HtmlOutput} ウェブページを表示するためのHtmlOutputオブジェクト。
 */
function doGet(e) {
  // 'index.html' をHTMLテンプレートとして読み込みます。
  // evaluate()メソッドにより、テンプレート内のスクリプトレット（<?!= ... ?>）が実行されます。
  var htmlOutput = HtmlService.createTemplateFromFile('index').evaluate();
  
  // ウェブページのタイトルを設定します。
  htmlOutput.setTitle('Moodle 〇×問題チェッカー');
  
  // 必要に応じて、他のサイトへの埋め込みを許可する場合に以下の行のコメントを解除します。
  // htmlOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  
  return htmlOutput;
}
```

#### `explain.js` (Excerpt)

```javascript
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
  // ... (prompt construction, caching, API call logic) ...
}
```

#### `gemini.js` (Excerpt)

```javascript
/**
 * Google Apps ScriptからGemini APIを呼び出し、
 * true/false問題のリストに対する解答を推論させます。
 * @param {Array<Object>} questionsToProcess 質問の配列。各オブジェクトは { question_number, question_title, question_text } を持つ。
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
  // ... (prompt construction, API call logic) ...
}
```

## Web Interface (`index.html`, `input_styles.html`, `main_styles.html`, `script.html`)

The `index.html` file provides a comprehensive and interactive user interface:

-   **Input Section**: Allows users to input Moodle XML content via:
    -   Drag-and-drop XML files.
    -   Selecting local XML files.
    -   Pasting XML text into a `textarea`.
    -   A "Load Sample XML" button to quickly load example data.
-   **Processing Controls**: Buttons to "問題文の抽出" (Extract Questions) and "Geminiで回答を推論" (Infer Answers with Gemini).
-   **Inference Options**: A collapsible section to configure Gemini API parameters like model selection, temperature, TopK, and TopP.
-   **Output Section**: Displays the extracted questions and Gemini's inferred answers in a sortable table. It highlights whether Gemini's answer matches Moodle's answer.
-   **Explanation Generation**: Each question in the table has a "✨解説生成" (Generate Explanation) button to trigger Gemini to provide a detailed explanation.
-   **Action Buttons**: Includes buttons to copy the generated JSON to the clipboard and preview the JSON in a modal.
-   **Help Modals**: Provides help information for input methods and the explanation column.
-   **Styling**: Uses `main_styles.html` and `input_styles.html` for a modern and responsive design.
-   **Client-side Scripting**: `script.html` contains the JavaScript logic for handling UI interactions, file processing, calling server-side functions via `google.script.run`, and updating the display.

## Permissions

The `appsscript.json` file specifies the following permissions:

-   **Execution**: `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access**: `ANYONE_ANONYMOUS` (the web app is accessible by anyone, including anonymous users).
-   **Google Services**: Implicitly uses `UrlFetchApp` for calling the Gemini API, `PropertiesService` for API keys, `CacheService` for caching explanations, and `HtmlService` for the web interface.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **`GEMINI_API_KEY`**: A Google Gemini API key must be set as a script property (`PropertiesService.getScriptProperties()`) for the AI functionalities to work.

## Deployments

The project is deployed as a web application. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.
