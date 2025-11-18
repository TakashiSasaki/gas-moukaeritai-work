// filename: Code.gs

/**
 * WebアプリとしてアクセスされたときにHTMLを返すメイン関数。
 * URLパラメータに応じて表示するページを切り替える。
 * @param {Object} e - イベントオブジェクト
 */
function doGet(e) {
  // URLパラメータ 'page' の値を確認
  if (e.parameter.page === 'readme-ja') {
    return HtmlService.createHtmlOutputFromFile('readme-ja.html')
      .setTitle('Package Viewer アプリの使い方');
  }
  
  if (e.parameter.page === 'readme-en') {
    return HtmlService.createHtmlOutputFromFile('readme-en.html')
      .setTitle('How to use Package Viewer App');
  }

  // 'page'パラメータがない場合は、メインのWebアプリを表示
  const userEmail = Session.getActiveUser().getEmail();
  const template = HtmlService.createTemplateFromFile('Index');
  template.userEmail = userEmail;
  
  const faviconUrl = "https://raw.githubusercontent.com/TakashiSasaki/gas-moukaeritai-work/9890c2e25e742e4554e1a4da0fdc25c9d8a11b74/107QMAgKGFZ6dXRCrA7mpN9aSapN0fZlXw57ipPZREt5zSQ0UNSTLEH50/image.png";
  
  // ▼▼▼ ここから変更 ▼▼▼
  // faviconUrlをテンプレートに渡す
  template.faviconUrl = faviconUrl;
  // ▲▲▲ ここまで変更 ▲▲▲

  const htmlOutput = template.evaluate()
    .setTitle('Android Package List Viewer')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setFaviconUrl(faviconUrl); // この行でfaviconを指定
    
  return htmlOutput;
}

/**
 * HTML側から非同期で呼び出され、クライアントサイドにデータを渡すためのラッパー関数。
 * @return {Array<Object>} デバイス情報の配列
 */
function getDeviceDataForHtml() {
  const userEmail = Session.getActiveUser().getEmail();
  return getLatestPackageData(userEmail);
}


/**
 * 複数のメールからパッケージデータを集約し、モデル名ごとにマージして返す。
 * Gmailの検索結果をキャッシュし、API呼び出しを削減する。
 * @param {string} email - 検索対象のユーザーのメールアドレス
 * @return {Array<Object>} デバイス情報の配列。例: [{modelName, androidId, packageList}, ...]
 */
function getLatestPackageData(email) {
  const cache = CacheService.getUserCache();
  const cacheKey = 'aggregated_package_data';
  const CACHE_EXPIRATION_SECONDS = 21600; // 6時間

  try {
    const cachedResult = cache.get(cacheKey);
    if (cachedResult != null) {
      Logger.log('Cache hit. Returning data from cache.');
      return JSON.parse(cachedResult);
    }
  } catch (e) {
    Logger.log('Could not read from cache: ' + e.message);
  }

  Logger.log('Cache miss. Fetching data from Gmail.');
  const searchQuery = `to:${email} from:${email} subject:'Android package list'`;
  const aggregatedData = {};

  try {
    const threads = GmailApp.search(searchQuery, 0, 5);

    threads.forEach(thread => {
      const messages = thread.getMessages();
      messages.forEach(message => {
        try {
          const body = message.getPlainBody();
          const parsedJson = JSON.parse(body);
          
          const [modelName, androidId, packageList] = parsedJson;

          if (modelName && Array.isArray(packageList)) {
            if (!aggregatedData[modelName]) {
              aggregatedData[modelName] = {
                androidId: androidId,
                packages: new Set(packageList)
              };
            } else {
              packageList.forEach(pkg => aggregatedData[modelName].packages.add(pkg));
            }
            message.markRead();
          }
        } catch (e) {
          // JSONパースエラーは無視
        }
      });
    });

    const results = Object.keys(aggregatedData).map(modelName => {
      const deviceData = aggregatedData[modelName];
      const sortedPackages = Array.from(deviceData.packages).sort();
      
      return {
        modelName: modelName,
        androidId: deviceData.androidId,
        packageList: sortedPackages
      };
    });

    try {
      const dataToCache = JSON.stringify(results);
      if (dataToCache.length < 100 * 1024) {
        cache.put(cacheKey, dataToCache, CACHE_EXPIRATION_SECONDS);
        Logger.log('Successfully stored results in cache.');
      } else {
        Logger.log('Data size exceeds 100KB cache limit. Skipping cache store.');
      }
    } catch (e) {
      Logger.log('Could not write to cache: ' + e.message);
    }

    return results;

  } catch (gasError) {
    Logger.log(`GAS Execution Error: ${gasError.message}`);
    return [];
  }
}
