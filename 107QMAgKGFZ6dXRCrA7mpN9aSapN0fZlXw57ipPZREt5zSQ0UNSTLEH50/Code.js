/**
 * 複数のメールからパッケージデータを集約し、モデル名ごとにマージして返す。
 * @param {string} email - 検索対象のユーザーのメールアドレス
 * @return {Array<Object>} デバイス情報の配列。例: [{modelName, androidId, packageList}, ...]
 */
function getLatestPackageData(email) {
  const searchQuery = `to:${email} from:${email} subject:'Android package list'`;
  const aggregatedData = {}; // { "モデル名": { androidId: "...", packages: Set(...) } }

  try {
    // 1. 最大で5件のスレッドを取得
    const threads = GmailApp.search(searchQuery, 0, 5);

    // 2. 全てのスレッドとメッセージをループ
    threads.forEach(thread => {
      const messages = thread.getMessages();
      messages.forEach(message => {
        try {
          // 3. JSONデコードを試みる
          const body = message.getPlainBody();
          const parsedJson = JSON.parse(body);
          
          const [modelName, androidId, packageList] = parsedJson;

          // 必須データ（モデル名とパッケージリスト）が存在することを確認
          if (modelName && Array.isArray(packageList)) {
            // 4. モデル名をキーにデータを集約（マージ）
            if (!aggregatedData[modelName]) {
              // 初めて見るモデル名の場合、新しいエントリを作成
              aggregatedData[modelName] = {
                androidId: androidId, // 最初に取得したIDを保持
                packages: new Set(packageList)
              };
            } else {
              // 既存のモデル名の場合、パッケージリストをマージ（Setが自動で重複を除去）
              packageList.forEach(pkg => aggregatedData[modelName].packages.add(pkg));
            }
            // 処理したメールは既読にする
            message.markRead();
          }
        } catch (e) {
          // 5. JSONのデコードに失敗した場合は、そのメールを無視する
          // Logger.log(`Skipping a message due to parse error: ${e.message}`);
        }
      });
    });

    // 6. 集約したデータを最終的な戻り値の形式（オブジェクトの配列）に変換
    const results = Object.keys(aggregatedData).map(modelName => {
      const deviceData = aggregatedData[modelName];
      // Setを配列に変換し、アルファベット順にソート
      const sortedPackages = Array.from(deviceData.packages).sort();
      
      return {
        modelName: modelName,
        androidId: deviceData.androidId,
        packageList: sortedPackages
      };
    });

    return results;

  } catch (gasError) {
    Logger.log(`GAS Execution Error: ${gasError.message}`);
    // エラーが発生した場合は空の配列を返す
    return [];
  }
}