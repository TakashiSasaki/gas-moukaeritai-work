/**
 * Google Drive内の全Apps Scriptプロジェクトのデプロイメント状況を網羅的に確認する。
 * Drive API (Drive Service) で全Script IDを取得し、Apps Script API (UrlFetchApp) で
 * 各プロジェクトのウェブアプリデプロイメント情報を取得する。
 * Apps Script APIのレート制限に対応するため、エクスポネンシャル・バックオフを実装している。
 */

const MAX_RETRIES = 3; // 最大リトライ回数

// ====================================================================
// サブルーチン 1: Drive Advanced Service を使用して全 Script ID を取得
// ====================================================================

/**
 * Google Drive内のスタンドアロンApps ScriptファイルのファイルID (Script ID) のリストを取得します。
 * ドキュメントにバウンドされたスクリプトは、Drive APIの検索対象に含まれません。
 * @returns {Array<{id: string, title: string}>} Script IDとタイトルのリスト。
 */
function getScriptIdsFromDrive() {
  // MIMEタイプはハイフンありの形式を使用
  const SCRIPT_MIME_TYPE = 'application/vnd.google-apps.script'; 
  let scriptFiles = [];
  let pageToken = null;
  
  try {
    do {
      // 検索クエリ: Apps Script MIMEタイプかつゴミ箱に入っていないファイル
      const response = Drive.Files.list({
        q: `mimeType='${SCRIPT_MIME_TYPE}' and trashed=false`,
        // fields: 'nextPageToken, files(id, name)' はDrive API v3の標準形式
        fields: 'nextPageToken, files(id, name)', 
        pageToken: pageToken
      });
      
      if (response.files && response.files.length > 0) {
        response.files.forEach(file => {
          // nameをtitleとして使用
          scriptFiles.push({
            id: file.id,
            title: file.name
          });
        });
      }
      
      pageToken = response.nextPageToken;
      
    } while (pageToken);
  } catch(e) {
    // 例外を再スロー (Rethrow)
    console.error(`FATAL ERROR in Drive API (getScriptIdsFromDrive): ${e.toString()}`);
    console.error('原因: OAuthスコープ "https://www.googleapis.com/auth/drive.readonly" が承認されているか確認してください。');
    throw new Error('Drive APIへのアクセスに失敗しました。詳細についてはログを確認してください。');
  }
  
  return scriptFiles;
}


// ====================================================================
// サブルーチン 2: 特定の Script ID のウェブアプリ情報を取得 (バックオフ付き)
// ====================================================================

/**
 * 特定のScript IDに対してApps Script APIにアクセスし、ウェブアプリのデプロイ情報を取得する。
 * Quota超過に対応するため、エクスポネンシャル・バックオフを実装。
 * @param {string} scriptId 対象のApps Script ID
 * @returns {{status: string, message?: string, deployments?: Array<Object>}} 処理結果
 */
function getDeploymentsForScriptId(scriptId) {
  const API_URL = `https://script.googleapis.com/v1/projects/${scriptId}/deployments`;
  let deployments = [];
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    
    // リトライが必要な場合は待機する (初回は待機なし)
    if (i > 0) {
      const sleepTime = Math.pow(2, i - 1) * 1000; // 1000ms, 2000ms, 4000ms
      console.warn(`    ⚠️ Quota超過のためリトライ #${i} を実行します。${sleepTime / 1000}秒待機します...`);
      Utilities.sleep(sleepTime);
    }
    
    const options = {
      method: "get",
      headers: {
        Authorization: `Bearer ${ScriptApp.getOAuthToken()}` // Apps ScriptのOAuthトークンを使用
      },
      muteHttpExceptions: true
    };

    try {
      const response = UrlFetchApp.fetch(API_URL, options);
      const responseCode = response.getResponseCode();
      const result = JSON.parse(response.getContentText());

      if (responseCode === 200) {
        // 成功: デプロイメントの抽出ロジックを実行し、リトライループを抜ける
        if (result.deployments) {
            result.deployments.forEach(deployment => {
              if (deployment.entryPoints) {
                  deployment.entryPoints.forEach(entryPoint => {
                      // entryPointTypeがWEB_APPであることを確認
                      if (entryPoint.entryPointType === 'WEB_APP' && entryPoint.webApp) {
                          const webApp = entryPoint.webApp;
                          const config = webApp.entryPointConfig;
                          const depConfig = deployment.deploymentConfig;

                          deployments.push({
                              id: deployment.deploymentId,
                              // バージョン番号と説明のNull安全な取得
                              version: depConfig && depConfig.versionNumber ? depConfig.versionNumber : 'HEAD/LATEST',
                              description: depConfig && depConfig.description ? depConfig.description : 'N/A',
                              url: webApp.url,
                              executeAs: config.executeAs,
                              access: config.access
                          });
                      }
                  });
              }
          });
        }
        return { status: 'SUCCESS', deployments: deployments }; // 成功したら即座に返す

      } else if (responseCode === 403 || responseCode === 429) {
        // 403 Forbidden (権限不足) か 429 (Too Many Requests / Quota Exceeded) の場合
        if (i < MAX_RETRIES - 1) {
          // リトライ回数が残っていれば続行
          continue; 
        } else {
          // リトライ上限に達した場合
          const errorMessage = result.error ? result.error.message : `HTTP Error ${responseCode}`;
          return { status: 'ERROR', message: `APIアクセス失敗: リトライ上限到達。${errorMessage}` };
        }
      } else {
        // その他のエラー (404 Not Found など) の場合はリトライせず終了
        const errorMessage = result.error ? result.error.message : `HTTP Error ${responseCode}`;
        return { status: 'ERROR', message: `APIアクセス失敗: ${errorMessage}` };
      }

    } catch (e) {
      // UrlFetchApp自体の実行時エラー
      return { status: 'FATAL_ERROR', message: `UrlFetchの実行中に例外が発生しました: ${e.toString()}` };
    }
  } // リトライループ終了
  
  // ここに到達するのは、リトライが全て失敗した場合
  return { status: 'ERROR', message: 'APIアクセス失敗: 不明なエラーでリトライを完了できませんでした。' };
}


// ====================================================================
// メイン関数: 全Script IDのデプロイメント状況を網羅的に確認しログ出力
// ====================================================================

/**
 * Drive内の全Apps Scriptプロジェクトのデプロイメント状況を網羅的に確認するメイン関数。
 * 全てのプロジェクトの結果を配列として返し、実行ログに出力します。
 * @returns {Array<Object>} 全てのApps Scriptプロジェクトの確認結果。
 */
function getDeploymentStatusForAllScripts() {
  const allScriptFiles = getScriptIdsFromDrive();
  const allResults = [];
  
  console.log(`--- Google Drive内で ${allScriptFiles.length} 件のスタンドアロンApps Scriptファイルが検出されました ---`);

  allScriptFiles.forEach((file, index) => {
    // ログに出力して進行状況を可視化
    console.log(`\n[${index + 1}/${allScriptFiles.length}] Script: ${file.title} (ID: ${file.id}) のデプロイメントを確認中...`);
    
    // 特定のScript IDのデプロイメント情報を取得 (バックオフ付き)
    const deploymentData = getDeploymentsForScriptId(file.id);
    
    const resultEntry = {
      scriptId: file.id,
      scriptTitle: file.title,
      status: deploymentData.status,
      message: deploymentData.message || 'SUCCESS',
      webApps: deploymentData.deployments || []
    };
    
    allResults.push(resultEntry);

    // ログに出力
    if (resultEntry.status === 'SUCCESS') {
      if (resultEntry.webApps.length > 0) {
        console.log(`  ✅ デプロイ済みウェブアプリ数: ${resultEntry.webApps.length}`);
        resultEntry.webApps.forEach(app => console.log(`    - [Version: ${app.version}] [Access: ${app.access}] / URL: ${app.url}`));
      } else {
        console.log('  ➖ ウェブアプリのデプロイメントは見つかりませんでした。');
      }
    } else {
      console.error(`  ❌ 確認エラー: ${resultEntry.message}`);
    }
  });

  console.log('\n--- 全てのスクリプトの確認完了 ---');
  return allResults;
}


// ====================================================================
// テスト実行関数
// ====================================================================

/**
 * メイン関数を実行して、全スクリプトのデプロイメント状況を確認します。
 * ログウィンドウで結果を確認してください。
 */
function test_getDeploymentStatusForAllScripts() {
  getDeploymentStatusForAllScripts();
}