/**
 * @file judge_fast_rules.js
 * @fileoverview
 * ファイルタイトル判定システムのステップ1（高速ルールベース判定）を実装します。
 * このスクリプトは、Google Apps Script (GAS) での実行を前提としています。
 *
 * このステップは、API呼び出しを必要とせず、GASのみで高速に実行されます。
 * 辞書（Set）を使用して、最も一般的で明白な不適切タイトルを判定します。
 */

// --- 判定辞書 ---

/**
 * @const {Set<string>}
 * タイトル全体がこのリストの文字列と「完全一致」する場合に不適切と判定する辞書。
 * （ファイル拡張子を含む完全なファイル名を想定）
 */
const EXACT_MATCH_BAD_TITLES = new Set([
  // 類型1: デフォルト・汎用ファイル名
  '無題のドキュメント',
  'Untitled document',
  'Untitled',
  'ファイル名無題のドキュメント',
  '新しい書類',
  '新規ドキュメント',

  // 類型4: システム・設定ファイル名
  'README.md',
  'README.txt',
  'README',
  'LICENSE',
  'LICENSE.txt',
  'LICENSE.md',
  'LICENSES.txt',
  'EULA.txt',
  'COPYING.txt',
  'AUTHORS.txt',
  'vendor.txt',
  'CMakeLists.txt',
  'buildId.txt',
  'tag.txt',
  'R.txt',
  'manifest-merger-debug-report.txt',

  // 類型9: 汎用的・内容不明なタイトル（システム予約語含む）
  'log.txt',
  'main.pdf',
  'output1.txt',
  'test.txt',
  'empty.txt',
  'hogehoge',
  'index.pdf',
  'all.pdf',
  'data.txt',
  'iris.txt',
  'results.txt',
  'inputs.txt',
  'usage.txt',
  'seeds.txt',
  'mapping.txt',
  'dump.txt',
  'proguard.txt',
  'proguard-rules.txt',

  // リストから検出されたその他の典型的なシステムファイル
  'entry_points.txt',
  'top_level.txt',
  'dex-renamer-state.txt',
  'file-input-save-data.txt',
  'proguard-project.txt',
]);

/**
 * @const {string[]}
 * タイトルがこのリストの文字列で「前方一致」する場合に不適切と判定する辞書。
 */
const PREFIX_MATCH_BAD_TITLES = [
  // 類型1: デフォルト・汎用ファイル名 (例: 新規ドキュメント 1.pdf)
  '新規ドキュメント ',
  '無題の Jam',
  
  // 類型4: システム・設定ファイル名 (例: [LINE] ...とのトーク.txt)
  '[LINE] ',

  // 類型9: 汎用的・内容不明 (例: cdist-X1.txt)
  'cdist-',
  'pdist-',
  'random-',
  'test_cli_',
];

// --- 判定関数 ---

/**
 * ステップ1: 高速ルール（辞書）に基づいてタイトルの不適切性を判定します。
 *
 * @param {string} title - 判定対象のファイルタイトル。
 * @returns {{isBad: boolean | null, type: string | null}} 判定結果オブジェクト。
 * isBad: true (不適切), false (適切)
 * ※ステップ1で判定できなかった場合は false (適切) を返します。
 */
function step1_checkFastRules(title) {
  // 1. 完全一致のチェック
  if (EXACT_MATCH_BAD_TITLES.has(title)) {
    return { isBad: true, type: 'デフォルト・システム名 (完全一致)' };
  }

  // 2. 前方一致のチェック
  for (const prefix of PREFIX_MATCH_BAD_TITLES) {
    if (title.startsWith(prefix)) {
      return { isBad: true, type: 'デフォルト・システム名 (前方一致)' };
    }
  }

  // ステップ1では判定できなかった（不適切ではない）
  return { isBad: false, type: null };
}

// --- テスト実行 ---

/**
 * 動作テスト用の関数です。
 * GASエディタでこの関数を選択して実行してください。
 */
function runTest_Step1() {
  const testTitles = [
    // 適切なタイトルの例
    "Git における pull・fetch・merge の動作理解と分岐ブランチの統合手順", // 適切
    "量子エンタングルメント（量子もつれ）に関する理解レポート", // 適切
    
    // 不適切なタイトルの例 (ステップ1で検出対象)
    "無題のドキュメント", // 不適切 (完全一致)
    "README.md",      // 不適切 (完全一致)
    "log.txt",        // 不適切 (完全一致)
    "entry_points.txt", // 不適切 (完全一致)
    "hogehoge",       // 不適切 (完全一致)
    "[LINE] Yoshiko Kitani.txt", // 不適切 (前方一致)
    "pdist-spearman-ml.txt", // 不適切 (前方一致)

    // ステップ1では「適切」と判定されるもの (ステップ2, 3の対象)
    "https://youtu.be/e1XT-6YpMKw",
    "grok_report (1).pdf",
    "20251101.pdf",
    "この会話全体の内容を整理して、詳細なレポートを作成してください。",
    "20240122_ءا.pdf",
    "sasakilab 2025-11-07 dmesg解析"
  ];

  Logger.log("ステップ1 高速ルール判定テストを開始します...");

  testTitles.forEach(title => {
    const result = step1_checkFastRules(title);
    let status = result.isBad ? '不適切' : '適切';
    Logger.log(`【${title}】 -> 判定: ${status} (${result.type || 'N/A'})`);
  });

  Logger.log("ステップ1 高速ルール判定テストが完了しました。");
}