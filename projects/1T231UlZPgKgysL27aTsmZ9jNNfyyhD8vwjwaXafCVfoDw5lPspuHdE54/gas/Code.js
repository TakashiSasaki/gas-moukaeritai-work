/**
 * Google Drive内の全Apps Scriptプロジェクト（スタンドアロン）の
 * ウェブアプリデプロイメント状況を網羅的に確認するシステム。
 *
 * - Drive Advanced Service および Apps Script API (UrlFetch経由) を使用。
 * - CacheServiceを導入し、DriveからのスクリプトID取得とデプロイメント情報の取得を高速化。
 * - APIリクエスト間に固定遅延(50ms)と、エラー発生時のエクスポネンシャル・バックオフ処理を実装し、
 * レート制限 (Quota Exceeded) による中断を回避する。
 */

// ====================================================================
// 定数設定
// ====================================================================
const SCRIPT_MIME_TYPE = 'application/vnd.google-apps.script';
const MAX_RETRIES = 3;
const DEFAULT_WAIT_MS = 50; // 固定遅延 (50ms)
const CACHE_KEY_SCRIPTS = 'ALL_SCRIPT_IDS';
const CACHE_KEY_DEPLOYMENT_PREFIX = 'DEPLOYMENTS_'; // デプロイメント情報キャッシュのプレフィックス


// ====================================================================
// サブルーチン 1: Drive Advanced Service を使用して全 Script ID を取得 (Cache使用)
// ====================================================================

/**
 * Drive Advanced Service を使用して、Google Drive内のスタンドアロンApps Scriptファイルの
 * ファイルID (Apps Script IDとして機能) のリストを取得します。
 * 取得結果は CacheService に格納され、次回以降の実行を高速化します。
 * * @returns {Array<{id: string, title: string, createdDate: string, modifiedDate: string}>} Script ID、タイトル、作成日時、更新日時のリスト。
 */
function getScriptIdsFromDrive() {
  const cache = CacheService.getUserCache();
  const cachedData = cache.get(CACHE_KEY_SCRIPTS);

  if (cachedData) {
    console.log('--- CacheServiceからScript IDリストをロードしました ---');
    return JSON.parse(cachedData);
  }

  let scriptFiles = [];
  let pageToken = null;
  
  try {
    do {
      // 検索クエリ: Apps Script MIMEタイプかつゴミ箱に入っていないファイル
      const response = Drive.Files.list({
        q: `mimeType='${SCRIPT_MIME_TYPE}' and trashed=false`,
        // 修正: createdDate/modifiedDate -> createdTime/modifiedTime に変更
        fields: 'nextPageToken, files(id, name, createdTime, modifiedTime)', 
        pageToken: pageToken
      });
      
      if (response.files && response.files.length > 0) {
        response.files.forEach(file => {
          // 修正: createdDate/modifiedDate フィールド名を受信時に createdTime/modifiedTime で処理
          scriptFiles.push({
            id: file.id,
            title: file.name,
            createdDate: file.createdTime, // 作成日時 (ISO 8601形式)
            modifiedDate: file.modifiedTime // 最終更新日時 (ISO 8601形式)
          });
        });
      }
      
      pageToken = response.nextPageToken;
      
    } while (pageToken);

    // 取得したデータをキャッシュに保存 (有効期限: 1時間)
    cache.put(CACHE_KEY_SCRIPTS, JSON.stringify(scriptFiles), 3600);

  } catch(e) {
    console.error(`Drive API (getScriptIdsFromDrive) 実行エラー: ${e.toString()}`);
    throw e; // エラーを再スロー
  }
  
  return scriptFiles;
}


// ====================================================================
// サブルーチン 2: 特定の Script ID のウェブアプリ情報を取得 (キャッシュ、バックオフ、固定遅延)
// ====================================================================

/**
 * 特定のScript IDに対してApps Script APIにアクセスし、デプロイ情報を取得する。
 * CacheServiceを優先的に使用し、Quota超過エラー回避のため、エクスポネンシャル・バックオフと固定遅延を適用する。
 * * @param {string} scriptId 対象のApps Script ID
 * @returns {{status: string, message?: string, deployments?: Array<Object>}} 処理結果
 */
function getDeploymentsForScriptId(scriptId) {
  const cache = CacheService.getUserCache();
  const cacheKey = CACHE_KEY_DEPLOYMENT_PREFIX + scriptId;

  // 1. キャッシュチェック
  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    console.log(`    ℹ️ Script ID ${scriptId} のデプロイメント情報をキャッシュからロードしました。`);
    return JSON.parse(cachedResult);
  }
  
  const API_URL = `https://script.googleapis.com/v1/projects/${scriptId}/deployments`;
  let deployments = [];

  const options = {
    method: "get",
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`
    },
    muteHttpExceptions: true
  };

  for (let i = 0; i < MAX_RETRIES; i++) {
    // 2. APIリクエスト間の固定遅延 (レート制限の緩和)
    Utilities.sleep(DEFAULT_WAIT_MS);

    // 3. APIリクエストの実行
    try {
      const response = UrlFetchApp.fetch(API_URL, options);
      const responseCode = response.getResponseCode();
      const result = JSON.parse(response.getContentText());

      if (responseCode === 200) {
        // 成功: データの抽出とリトライループの終了
        if (result.deployments) {
          result.deployments.forEach(deployment => {
            if (deployment.entryPoints) {
                deployment.entryPoints.forEach(entryPoint => {
                    if (entryPoint.entryPointType === 'WEB_APP' && entryPoint.webApp) {
                        const webApp = entryPoint.webApp;
                        const config = webApp.entryPointConfig;
                        const depConfig = deployment.deploymentConfig;

                        deployments.push({
                            id: deployment.deploymentId,
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
        
        // 4. 成功した場合、結果をキャッシュに保存 (有効期限: 50分)
        const successResult = { status: 'SUCCESS', deployments: deployments };
        cache.put(cacheKey, JSON.stringify(successResult), 3000); // 3000秒 = 50分
        
        return successResult;
        
      } else if (responseCode === 429 || responseCode === 403 && result.error.message.includes('Quota exceeded')) {
        // Quota超過またはレート制限: リトライ対象
        if (i < MAX_RETRIES - 1) {
          // 初期バックオフ時間を2秒に変更 (2秒, 4秒, 8秒...)
          const waitTime = Math.pow(2, i) * 2000; 
          console.warn(`    ⚠️ Quota超過のためリトライ #${i + 1} を実行します。${waitTime / 1000}秒待機します...`);
          Utilities.sleep(waitTime);
          continue; // リトライループの次へ
        } else {
          // 最大リトライ回数を超過
          return { status: 'ERROR', message: `APIアクセス失敗: ${result.error.message}` };
        }
      } else {
        // その他のエラー (404 Not Found, 403 Permission Deniedなど) はリトライせず即時終了
        return { status: 'ERROR', message: `APIアクセス失敗: ${result.error.message || 'Unknown API Error'}` };
      }

    } catch (e) {
      // UrlFetchApp自体のエラー (例: ネットワーク接続の問題)
      return { status: 'FATAL_ERROR', message: `UrlFetch失敗: ${e.toString()}` };
    }
  }
  
  // ここには到達しないはず
  return { status: 'ERROR', message: 'Unknown error occurred during API calls.' };
}


// ====================================================================
// メイン関数: 全Script IDのデプロイメント状況を網羅的に確認
// ====================================================================

/**
 * Drive内の全Apps Scriptプロジェクトのデプロイメント状況を網羅的に確認するメイン関数。
 * 実行ログに出力され、最終結果の配列を返します。
 */
function getDeploymentStatusForAllScripts() {
  const allScriptFiles = getScriptIdsFromDrive();
  const allResults = [];
  
  console.log(`--- Google Drive内で ${allScriptFiles.length} 件のApps Scriptファイルが検出されました ---`);
  console.log('--- ドキュメントにバウンドされたスクリプトについては、スタンドアロン検索に含まれる場合のみ検出されます ---');

  // ★修正箇所: デバッグ用の件数制限を解除し、全件を処理対象とする
  const limitedScripts = allScriptFiles; // 制限解除
  const totalItems = allScriptFiles.length; // UIには総数を渡すため保持

  limitedScripts.forEach((file, index) => {
    // スクリプト名が長すぎる場合の表示調整
    const title = file.title.length > 50 ? file.title.substring(0, 47) + '...' : file.title;

    console.log(`\n[${index + 1}/${totalItems}] Script: ${title} (ID: ${file.id}) のデプロイメントを確認中...`);
    
    const deploymentData = getDeploymentsForScriptId(file.id);
    
    const resultEntry = {
      id: file.id,
      title: file.title, // 完全なタイトルを使用
      createdDate: file.createdDate,
      modifiedDate: file.modifiedDate,
      status: deploymentData.status,
      message: deploymentData.message || 'SUCCESS',
      webApps: deploymentData.deployments || []
    };
    
    allResults.push(resultEntry);

    // ログに出力
    if (resultEntry.status === 'SUCCESS') {
      if (resultEntry.webApps.length > 0) {
        console.log(`  ✅ デプロイ済みウェブアプリ数: ${resultEntry.webApps.length}`);
        resultEntry.webApps.forEach(app => 
          console.log(`    - [Version: ${app.version}] [Access: ${app.access}] / URL: ${app.url}`)
        );
      } else {
        console.log('  ➖ ウェブアプリのデプロイメントは見つかりませんでした。');
      }
    } else {
      console.error(`  ❌ 確認エラー: ${resultEntry.message}`);
    }
  });

  console.log('\n--- スクリプトの確認完了 ---');
  return allResults;
}


// ====================================================================
// テスト実行関数
// ====================================================================

/**
 * メイン関数を実行し、ログに結果を出力します。
 * 開発環境でのみ実行してください。
 */
function test_getDeploymentStatusForAllScripts() {
  // キャッシュをクリアして、Drive APIからのデータ取得を強制的に行いたい場合に、
  // 以下の行のコメントアウトを外して実行してください。
  // CacheService.getUserCache().remove(CACHE_KEY_SCRIPTS); 

  getDeploymentStatusForAllScripts();
}