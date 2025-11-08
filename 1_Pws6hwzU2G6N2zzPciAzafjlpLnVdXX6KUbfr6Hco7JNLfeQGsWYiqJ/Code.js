/**
 * このスクリプトは GAS プロジェクト内の 'Code.gs' ファイルに保存されることを想定しています。
 * doGet.gs と index.html と組み合わせて Web アプリとしてデプロイされます。
 */

// グローバル定数
const SPREADSHEET_ID_KEY = 'DOC_LIST_SPREADSHEET_ID'; // UserProperties のキー
const CACHE_KEY_PREFIX = 'DOC_LIST_CACHE_'; // CacheService のキープレフィックス
const PAGE_SIZE = 100; // 1回の処理で DriveApp.searchFiles から取得する最大ファイル数
const CACHE_EXPIRATION_SECONDS = 21600; // 6 hours

/**
 * 処理の第1ステップ (クライアントから呼び出される)
 * 検索クエリを定義し、最初のファイルページを取得してキャッシュに保存する。
 * @returns {Object} 処理状況 (totalFiles, continuationToken, processedCount, done)
 */
function startProcessing() {
  try {
    // ステップ 1: スプレッドシートを取得または新規作成
    const ss = getOrCreateSpreadsheet();
    if (!ss) {
      throw new Error("スプレッドシートを取得または作成できませんでした。");
    }
    const timezone = ss.getSpreadsheetTimeZone();
    const sheetName = Utilities.formatDate(new Date(), timezone, "yyyy-MM-dd");

    // ステップ 2: 該当の日付のシートを取得または新規作成
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName, 1);
    }
    sheet.clear();
    const headers = ["ファイル名", "URL", "ID", "最終更新日"];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");

    // ステップ 3: 検索クエリの定義
    const query = buildSearchQuery();
    Logger.log(`実行クエリ: ${query}`);

    // ステップ 4: DriveApp でファイルを検索 (イテレータを取得)
    // Drive.Files.list を使うとページネーションが容易だが、Drive API の有効化が必要。
    // DriveApp.searchFiles を使うため、厳密なページネーションの代わりにイテレータの続きを模倣する
    // ...が、searchFilesのイテレータはシリアライズできないため、毎回 searchFiles を呼ぶ必要がある。
    // 代わりに、Drive API (Advanced Service) を使うのが本筋だが、セットアップが不要な DriveApp で完結させるため、
    // ここでは「全件検索」を行い、結果をキャッシュに分けて保存するアプローチを取る。
    
    Logger.log("ファイル検索を開始します...(全件取得)");
    const files = DriveApp.searchFiles(query);
    const fileList = [];
    const mimeTypes = getSearchableMimeTypes();
    const strictExtensions = ['.txt', '.md'];

    // ステップ 5: 全件検索とフィルタリング
    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();
      const fileMimeType = file.getMimeType();
      const isMimeMatch = mimeTypes.includes(fileMimeType);
      
      let isExtensionMatch = false;
      if (!isMimeMatch) {
        for (const ext of strictExtensions) {
          if (fileName.toLowerCase().endsWith(ext)) {
            isExtensionMatch = true;
            break;
          }
        }
      }

      if (isMimeMatch || isExtensionMatch) {
        fileList.push([
          fileName,
          file.getUrl(),
          file.getId(),
          file.getLastUpdated()
        ]);
      }
    }
    Logger.log(`${fileList.length} 件のファイルが見つかりました。`);

    // ステップ 6: 全ファイルリストをキャッシュに保存
    // GASのCacheServiceは最大100KB。大きなリストは分割する必要がある。
    // ここではJSON文字列化して保存する。
    const cache = CacheService.getUserCache();
    const sessionId = Utilities.getUuid(); // この処理セッションのID
    
    // 100KBの制限を考慮し、fileList を PAGE_SIZE ごとに分割してキャッシュに保存
    let page = 1;
    let totalPages = 0;
    for (let i = 0; i < fileList.length; i += PAGE_SIZE) {
      const chunk = fileList.slice(i, i + PAGE_SIZE);
      const chunkKey = `${CACHE_KEY_PREFIX}${sessionId}_page_${page}`;
      try {
        cache.put(chunkKey, JSON.stringify(chunk), CACHE_EXPIRATION_SECONDS);
        page++;
      } catch (e) {
        Logger.log(`キャッシュ保存エラー (キー: ${chunkKey}, サイズ: ${JSON.stringify(chunk).length} bytes): ${e.message}`);
        throw new Error(`キャッシュの保存に失敗しました。ファイル数が多すぎる可能性があります。`);
      }
    }
    totalPages = page - 1;

    // 処理全体のメタデータをキャッシュ
    const metaDataKey = `${CACHE_KEY_PREFIX}${sessionId}_meta`;
    const metaData = {
      sessionId: sessionId,
      spreadsheetId: ss.getId(),
      sheetName: sheetName,
      totalFiles: fileList.length,
      totalPages: totalPages,
      currentPage: 0 // これから1ページ目を処理する
    };
    cache.put(metaDataKey, JSON.stringify(metaData), CACHE_EXPIRATION_SECONDS);
    Logger.log(`キャッシュ準備完了。SessionID: ${sessionId}, TotalPages: ${totalPages}`);

    // 最初のページの処理を要求する
    return {
      status: "processing",
      message: `全 ${fileList.length} 件のファイルが見つかりました。書き込み処理を開始します...`,
      metaDataKey: metaDataKey,
      totalFiles: fileList.length,
    };

  } catch (e) {
    Logger.log(`startProcessing エラー: ${e.message} (スタック: ${e.stack})`);
    return { status: "error", message: `処理開始エラー: ${e.message}` };
  }
}

/**
 * 処理の第2ステップ (クライアントから再帰的に呼び出される)
 * キャッシュから次のページのファイルリストを取得し、スプレッドシートに書き込む。
 * @param {string} metaDataKey 処理メタデータが保存されているキャッシュキー
 * @returns {Object} 処理状況 (processedCount, totalFiles, done, metaDataKey)
 */
function processNextPage(metaDataKey) {
  const cache = CacheService.getUserCache();
  
  // メタデータを取得
  const metaDataStr = cache.get(metaDataKey);
  if (!metaDataStr) {
    return { status: "error", message: "処理セッションが無効です（タイムアウトした可能性があります）。" };
  }
  const metaData = JSON.parse(metaDataStr);
  
  metaData.currentPage += 1;
  const currentPage = metaData.currentPage;
  const totalPages = metaData.totalPages;
  
  if (currentPage > totalPages) {
    // すべてのページを処理完了
    Logger.log(`全 ${totalPages} ページの書き込みが完了しました。`);
    // 最終処理を呼び出す
    return finalizeProcessing(metaDataKey);
  }

  Logger.log(`ページ ${currentPage}/${totalPages} の処理を開始...`);

  try {
    // スプレッドシートを開く
    const ss = SpreadsheetApp.openById(metaData.spreadsheetId);
    const sheet = ss.getSheetByName(metaData.sheetName);
    if (!sheet) {
      throw new Error(`シート "${metaData.sheetName}" が見つかりません。`);
    }

    // 書き込むべきページのデータをキャッシュから取得
    const chunkKey = `${CACHE_KEY_PREFIX}${metaData.sessionId}_page_${currentPage}`;
    const chunkDataStr = cache.get(chunkKey);
    if (!chunkDataStr) {
      throw new Error(`キャッシュデータ (ページ ${currentPage}) が見つかりません。`);
    }
    const fileListChunk = JSON.parse(chunkDataStr);

    // データをシートに追記
    if (fileListChunk.length > 0) {
      const startRow = sheet.getLastRow() + 1; // ヘッダーの次から追記
      sheet.getRange(startRow, 1, fileListChunk.length, fileListChunk[0].length).setValues(fileListChunk);
      Logger.log(`${fileListChunk.length} 件をシートに書き込みました (計 ${startRow - 1 + fileListChunk.length - 1} 件)`);
    }

    // メタデータを更新（次のページに進む準備）
    cache.put(metaDataKey, JSON.stringify(metaData), CACHE_EXPIRATION_SECONDS);
    
    const processedCount = (currentPage - 1) * PAGE_SIZE + fileListChunk.length;

    return {
      status: "processing",
      message: `ページ ${currentPage}/${totalPages} を処理中... (${processedCount}/${metaData.totalFiles} 件書き込み完了)`,
      metaDataKey: metaDataKey,
      totalFiles: metaData.totalFiles,
      processedCount: processedCount
    };

  } catch (e) {
    Logger.log(`processNextPage エラー (ページ ${currentPage}): ${e.message} (スタック: ${e.stack})`);
    return { status: "error", message: `処理エラー (ページ ${currentPage}): ${e.message}` };
  }
}

/**
 * 処理の最終ステップ (processNextPage から呼び出される)
 * シートの並び替え、キャッシュのクリアを行う。
 * @param {string} metaDataKey 処理メタデータが保存されているキャッシュキー
 * @returns {Object} 最終結果 (status, message)
 */
function finalizeProcessing(metaDataKey) {
  const cache = CacheService.getUserCache();
  
  const metaDataStr = cache.get(metaDataKey);
  if (!metaDataStr) {
    return { status: "error", message: "最終処理セッションが無効です。" };
  }
  const metaData = JSON.parse(metaDataStr);

  try {
    // スプレッドシートを開く
    const ss = SpreadsheetApp.openById(metaData.spreadsheetId);
    
    // シートを日付の降順で並び替える
    sortSheetsByDateDescending(ss);

    // データがない場合のメッセージ
    if (metaData.totalFiles === 0) {
      const sheet = ss.getSheetByName(metaData.sheetName);
      if (sheet) {
        sheet.getRange(2, 1).setValue("対象のファイルは見つかりませんでした。");
      }
    }

    // キャッシュをクリーンアップ
    for (let i = 1; i <= metaData.totalPages; i++) {
      cache.remove(`${CACHE_KEY_PREFIX}${metaData.sessionId}_page_${i}`);
    }
    cache.remove(metaDataKey);
    
    Logger.log(`処理完了。キャッシュをクリアしました (SessionID: ${metaData.sessionId})`);

    return {
      status: "success",
      message: `処理が正常に完了しました。全 ${metaData.totalFiles} 件のファイルがシート「${metaData.sheetName}」に書き込まれました。`,
      processedCount: metaData.totalFiles,
      totalFiles: metaData.totalFiles
    };

  } catch (e) {
    Logger.log(`finalizeProcessing エラー: ${e.message} (スタック: ${e.stack})`);
    return { status: "error", message: `最終処理エラー: ${e.message}` };
  }
}


// --- 検索クエリとMIMEタイプのヘルパー関数 ---

/**
 * 検索対象のMIMEタイプリストを返す
 * @returns {string[]} MIMEタイプの配列
 */
function getSearchableMimeTypes() {
  return [
    MimeType.GOOGLE_DOCS,
    MimeType.GOOGLE_SLIDES,
    MimeType.PDF,
    MimeType.MICROSOFT_WORD, // .docx
    MimeType.MICROSOFT_WORD_LEGACY, // .doc
    MimeType.MICROSOFT_POWERPOINT, // .pptx
    MimeType.MICROSOFT_POWERPOINT_LEGACY, // .ppt
  ];
}

/**
 * DriveApp.searchFiles 用の検索クエリ文字列を構築する
 * @returns {string} 検索クエリ
 */
function buildSearchQuery() {
  const mimeTypes = getSearchableMimeTypes();
  const mimeQuery = mimeTypes.map(type => `mimeType = '${type}'`).join(' or ');

  const extensionQuery = [
    `title contains '.txt'`,
    `title contains '.md'`
  ].join(' or ');

  return `(${mimeQuery}) or (${extensionQuery}) and trashed = false`;
}


// --- 既存のヘルパー関数 (getOrCreateSpreadsheet, sortSheetsByDateDescending, getSpreadsheetInfo) ---

/**
 * ユーザープロパティに保存されたIDを使用してスプレッドシートを取得する。
 * 存在しない、または無効な場合は新規に作成し、IDを保存する。
 * @returns {Spreadsheet|null} Spreadsheet オブジェクト、または失敗時に null
 */
function getOrCreateSpreadsheet() {
  const userProps = PropertiesService.getUserProperties();
  let spreadsheetId = userProps.getProperty(SPREADSHEET_ID_KEY);
  let ss = null;

  if (spreadsheetId) {
    try {
      ss = SpreadsheetApp.openById(spreadsheetId);
      Logger.log(`既存のスプレッドシート (ID: ${spreadsheetId}) を開きました。`);
      return ss;
    } catch (e) {
      Logger.log(`保存されたID (${spreadsheetId}) でのスプレッドシートが開けませんでした: ${e.message}`);
      userProps.deleteProperty(SPREADSHEET_ID_KEY);
      spreadsheetId = null;
    }
  }

  try {
    const defaultName = "Googleドキュメント一覧（自動生成）";
    ss = SpreadsheetApp.create(defaultName);
    spreadsheetId = ss.getId();
    userProps.setProperty(SPREADSHEET_ID_KEY, spreadsheetId);
    Logger.log(`スプレッドシート "${defaultName}" (ID: ${spreadsheetId}) を新規作成し、IDを保存しました。`);
    return ss;
  } catch (e) {
    Logger.log(`スプレッドシートの新規作成に失敗しました: ${e.message}`);
    return null;
  }
}

/**
 * スプレッドシート内のシートを日付 (yyyy-MM-dd) の降順（新しいものが先頭）に並び替える。
 * @param {Spreadsheet} ss 対象のスプレッドシートオブジェクト
 */
function sortSheetsByDateDescending(ss) {
  try {
    Logger.log("シートの並び替えを開始します...");
    const sheets = ss.getSheets();
    const dateSheets = [];
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    sheets.forEach(sheet => {
      const name = sheet.getName();
      if (dateRegex.test(name)) {
        dateSheets.push(name);
      }
    });

    // 日付文字列を降順（新しい順）にソート
    dateSheets.sort((a, b) => b.localeCompare(a));

    // ソート順に従ってシートのインデックスを設定
    dateSheets.forEach((sheetName, index) => {
      ss.getSheetByName(sheetName).setIndex(index + 1); // 1-based index
    });
    
    Logger.log("シートの並び替えが完了しました。");

  } catch (e) {
    Logger.log(`シートの並び替え中にエラーが発生しました: ${e.message}`);
  }
}

/**
 * Webアプリ読み込み時に、既存のスプレッドシート情報を取得して返す。
 * @returns {Object|null} スプレッドシート情報 (name, url, created, updated, owner, size) または null。
 */
function getSpreadsheetInfo() {
  const userProps = PropertiesService.getUserProperties();
  const spreadsheetId = userProps.getProperty(SPREADSHEET_ID_KEY);

  if (!spreadsheetId) {
    Logger.log("スプレッドシートIDはまだ保存されていません。");
    return null;
  }

  try {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const timezone = ss.getSpreadsheetTimeZone();
    const file = DriveApp.getFileById(spreadsheetId);
    
    const info = {
      name: file.getName(),
      url: file.getUrl(),
      created: Utilities.formatDate(file.getDateCreated(), timezone, "yyyy-MM-dd HH:mm:ss"),
      updated: Utilities.formatDate(file.getLastUpdated(), timezone, "yyyy-MM-dd HH:mm:ss"),
      owner: file.getOwner().getName() || file.getOwner().getEmail(),
      size: file.getSize()
    };
    
    Logger.log(`既存のスプレッドシート情報を取得しました: ${info.name}`);
    return info;

  } catch (e) {
    Logger.log(`ID (${spreadsheetId}) のファイル情報取得に失敗しました: ${e.message}`);
    userProps.deleteProperty(SPREADSHEET_ID_KEY);
    Logger.log("無効なIDのため、UserPropertiesからIDを削除しました。");
    return null;
  }
}