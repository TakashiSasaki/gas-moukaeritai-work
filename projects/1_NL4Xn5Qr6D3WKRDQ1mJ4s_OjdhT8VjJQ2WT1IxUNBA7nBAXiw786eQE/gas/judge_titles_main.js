/**
 * @file judge_titles_main.js
 * @fileoverview
 * ファイルタイトル判定システムの統合テストスクリプト（エントリーポイント）。
 * * このスクリプトは、`step1_checkFastRules()`, `step2_checkRegexRules()`, `step3_checkWithLLM()` 
 * および関連する定数 (`DEFAULT_MODEL`, `API_KEY`) が
 * 既に同じGASプロジェクトの名前空間に読み込まれていることを前提としています。
 *
 * @usage
 * 1. GASエディタの「プロジェクトの設定」>「スクリプト プロパティ」を開きます。
 * 2. 「GEMINI_API_KEY」という名前で、APIキーを追加します。
 * 3. このファイル（または依存先ファイル）の `runComprehensiveTest()` 関数を実行して動作確認ができます。
 */

// ===================================================================
// 統合判定関数
// ===================================================================

/**
 * すべてのステップを順番に実行してタイトルの適切性を判定します。
 * 依存関係: step1_checkFastRules, step2_checkRegexRules, step3_checkWithLLM, DEFAULT_MODEL
 *
 * @param {string} title - 判定対象のファイルタイトル。
 * @param {boolean} [useLLM=true] - (オプション) ステップ3 (LLM判定) を実行するかどうか。
 * @param {string} [modelName] - (オプション) LLM判定に使用するモデル名。指定しない場合は DEFAULT_MODEL を使用。
 * @returns {{
 * title: string,
 * isBad: boolean | null,
 * type: string | null,
 * judgedByStep: number | null
 * }} 判定結果オブジェクト。
 */
function judgeTitle(title, useLLM = true, modelName) {
  
  // 使用するモデル名を決定（引数が未指定ならデフォルトを使用）
  const effectiveModelName = modelName || DEFAULT_MODEL;

  // --- ステップ1: 高速ルール (辞書) ---
  let result = step1_checkFastRules(title);
  if (result.isBad) {
    // 判定結果を返す
    return { title: title, isBad: true, type: result.type, judgedByStep: 1 };
  }

  // --- ステップ2: 中速ルール (正規表現) ---
  result = step2_checkRegexRules(title);
  if (result.isBad) {
    // 判定結果を返す
    return { title: title, isBad: true, type: result.type, judgedByStep: 2 };
  }

  // --- ステップ3: LLM判定 (オプション) ---
  if (useLLM) {
    // APIレート制限のため、呼び出しごとにスリープを入れる (1秒)
    // 大量処理時は呼び出し側で制御するか、バッチ処理にしてください。
    Utilities.sleep(1000); 
    
    result = step3_checkWithLLM(title, effectiveModelName);
    return { 
      title: title, 
      isBad: result.isBad, // true, false, または null (判定不明)
      type: result.type, 
      judgedByStep: 3 
    };
  }

  // ステップ1, 2を通過し、LLMを使用しなかった場合は「適切」として扱う
  return { title: title, isBad: false, type: '適切なタイトル (ステップ1, 2を通過)', judgedByStep: 2 };
}


// ===================================================================
// 統合テスト実行関数
// ===================================================================

/**
 * すべてのステップをテストするための総合テスト関数です。
 * GASエディタでこの関数を選択して実行してください。
 * * 注意: LLM APIの呼び出しを伴うため、実行時間がかかります。
 * (APIキーが設定されていない場合、ステップ3はスキップされます)
 * 依存関係: judgeTitle, API_KEY, DEFAULT_MODEL
 */
function runComprehensiveTest() {
  const testTitles = [
    // 適切と判定されるべきもの
    "Git における pull・fetch・merge の動作理解と分岐ブランチの統合手順", // -> Step 3 (適切)
    "量子エンタングルメント（量子もつれ）に関する理解レポート", // -> Step 3 (適切)
    "ACSL不正流用事件の全貌：経営破綻、市場の衝撃、公的資金と信頼の行方", // -> Step 3 (適切)

    // ステップ1で検出されるべきもの
    "無題のドキュメント", // -> Step 1
    "README.md", // -> Step 1
    "log.txt", // -> Step 1
    "[LINE] Yoshiko Kitani.txt", // -> Step 1

    // ステップ2で検出されるべきもの
    "https://youtu.be/e1XT-6YpMKw", // -> Step 2
    "grok_report (1).pdf", // -> Step 2
    "20251101.pdf", // -> Step 2
    "この会話全体の内容を整理して、詳細なレポートを作成してください。", // -> Step 2
    "RANSACについて説明してください。", // -> Step 2
    "IntelのCPUにおけるvminshiftってなんですか？", // -> Step 2
    "1⃣用語の定義など", // -> Step 2

    // ステップ3でのみ検出されるべきもの (LLM判定)
    "なるほど、その歴史的経緯の説明にはとても説力があります", // -> Step 3 (不適切)
    "カスタムプロンプト編集", // -> Step 3 (不適切)
    "sasakilab 2025-11-07 dmesg解析", // -> Step 3 (不適切)
    "20240122_ءا.pdf" // -> Step 3 (不適切)
  ];

  Logger.log("総合タイトル判定テストを開始します...");
  Logger.log(`APIキー設定状況: ${API_KEY ? '設定済み' : '未設定 (ステップ3はスキップされます)'}`);
  
  // APIキーが設定されていない場合は、ステップ3を実行しない
  const useLLM = (API_KEY !== null && API_KEY !== ""); 
  
  // デフォルトモデル (Flash) でテスト
  Logger.log(`--- テスト実行 (モデル: ${DEFAULT_MODEL}) ---`);
  testTitles.forEach(title => {
    const result = judgeTitle(title, useLLM, DEFAULT_MODEL);
    let status = result.isBad === null ? '判定不明' : (result.isBad ? '不適切' : '適切');
    Logger.log(`【${title}】 -> 判定: ${status} (Type: ${result.type}, Step: ${result.judgedByStep})`);
  });

  // (オプション) Gemma 3 でもテストする場合
  // ※ 実行時間が倍になるため、必要に応じてコメントアウトしてください
  
  if (useLLM) {
    const gemmaModel = "models/gemma-3-27b-it";
    Logger.log(`--- テスト実行 (モデル: ${gemmaModel}) ---`);
    testTitles.forEach(title => {
      // judgeTitleはデフォルト(DEFAULT_MODEL)を使うため、明示的にGemmaモデル名を渡す
      const result = judgeTitle(title, useLLM, gemmaModel); 
      let status = result.isBad === null ? '判定不明' : (result.isBad ? '不適切' : '適切');
      Logger.log(`【${title}】 -> 判定: ${status} (Type: ${result.type}, Step: ${result.judgedByStep})`);
    });
  }
  

  Logger.log("総合タイトル判定テストが完了しました。");
}