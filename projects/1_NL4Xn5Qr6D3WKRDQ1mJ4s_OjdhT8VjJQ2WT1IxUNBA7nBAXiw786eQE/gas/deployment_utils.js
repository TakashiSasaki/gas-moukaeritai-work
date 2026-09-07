/**
 * @file deployment_utils.js
 * @fileoverview
 * Google Apps Script プロジェクトの スクリプトID および デプロイメントID を
 * 取得するためのユーティリティ関数を提供します。
 *
 * このスクリプトは、Webアプリとしてデプロイされた環境で実行されることを前提としています。
 */

/**
 * 現在実行中のWebアプリの完全なURLを取得します。
 * (例: https://script.google.com/macros/s/AKfy.../exec または .../dev)
 *
 * @returns {string} WebアプリのURL。
 */
function getDeploymentUrl() {
  return ScriptApp.getService().getUrl();
}

/**
 * このGASプロジェクトのスクリプトIDを取得します。
 * (例: 1_NL4Xn5Qr6D3WKRDQ1mJ4s_OjdhT8VjJQ2WT1IxUNBA7nBAXiw786eQE)
 *
 * @returns {string} スクリプトID。
 */
function getScriptId() {
  return ScriptApp.getScriptId();
}

/**
 * 現在実行中のWebアプリのデプロイメントID (AKfy...) をURLから抽出して取得します。
 *
 * @returns {string | null} 抽出されたデプロイメントID。失敗した場合は null。
 */
function getDeploymentId() {
  const url = getDeploymentUrl();
  
  // URL (https://script.google.com/macros/s/AKfy.../exec) からID部分を抽出
  const match = url.match(/\/s\/(.*?)\/(exec|dev)/);
  
  if (match && match[1]) {
    return match[1]; // グループ1 (AKfy... の部分)
  }
  
  Logger.log('デプロイメントIDの抽出に失敗しました。URL: ' + url);
  return null;
}

/**
 * 各ID取得関数の動作確認を行うためのテスト関数です。
 * GASエディタでこの関数を選択し、「実行」または「デバッグ」してください。
 *
 * ※注意: getDeploymentUrl() と getDeploymentId() は、
 * スクリプトが「ウェブアプリ」として一度デプロイされていないと
 * 実行時エラー (Service not available) になります。
 * （デバッグ実行（Test deployments）もデプロイの一種とみなされます）
 */
function runIdTests() {
  try {
    Logger.log('--- ID取得テスト開始 ---');
    
    // スクリプトID (常に取得可能)
    const scriptId = getScriptId();
    Logger.log(`Script ID: ${scriptId}`);

    // デプロイメントURL (要デプロイ)
    const deployUrl = getDeploymentUrl();
    Logger.log(`Deployment URL: ${deployUrl}`);

    // デプロイメントID (要デプロイ)
    const deployId = getDeploymentId();
    Logger.log(`Deployment ID: ${deployId}`);
    
    Logger.log('--- ID取得テスト完了 ---');

  } catch (e) {
    Logger.log(`エラー: ${e.message}`);
    Logger.log('テストを実行するには、[デプロイ] > [テスト デプロイ] を選択して、開発版のデプロイメントIDを発行する必要があります。');
  }
}