/**
 * 最新のメールからパッケージデータを取得するコア機能。
 * @param {string} email - 検索対象のユーザーのメールアドレス
 * @return {Object} 抽出結果。{modelName, androidId, packageList}の形式。
 */
function getLatestPackageData(email) {
  // 引数で受け取ったメールアドレスを使って、動的に検索クエリを生成
  const searchQuery = `to:${email} from:${email} subject:'Android package list'`;
  
  try {
    const threads = GmailApp.search(searchQuery, 0, 1);

    if (threads.length === 0) {
      return {
        modelName: 'データなし',
        androidId: `対象のメールが見つかりませんでした。(from: ${email})`,
        packageList: []
      };
    }

    const targetThread = threads[0];
    const latestMessage = targetThread.getMessages()[targetThread.getMessageCount() - 1];
    const body = latestMessage.getPlainBody();
    
    try {
      const parsedJson = JSON.parse(body);
      
      latestMessage.markRead();
      
      return {
        modelName: parsedJson[0] || '不明なモデル',
        androidId: parsedJson[1] || '不明なID',
        packageList: parsedJson[2] || []
      };

    } catch (jsonError) {
      Logger.log(`JSON Parse Error: ${jsonError.message}`);
      return {
        modelName: 'データエラー',
        androidId: 'メール本文のJSON形式が正しくありません。',
        packageList: []
      };
    }

  } catch (gasError) {
    Logger.log(`GAS Execution Error: ${gasError.message}`);
    return {
      modelName: 'スクリプトエラー',
      androidId: gasError.message,
      packageList: []
    };
  }
}