/**
 * このスクリプトは GAS プロジェクト内の 'Code.gs' ファイルに保存されることを想定しています。
 * doGet.gs と index.html と組み合わせて Web アプリとしてデプロイされます。
 * * !!!【重要】!!!
 * このスクリプトを実行する前に、GASエディタの「サービス」メニューから
 * 「Drive API」(v3) を有効（追加）にしてください。
 */

// グローバル定数
const SPREADSHEET_ID_KEY = 'DOC_LIST_SPREADSHEET_ID'; // UserProperties のキー
const PAGE_SIZE = 500; // 1回の Drive.Files.list 呼び出しで取得する最大ファイル数
const MAX_RETRIES = 5; // API呼び出しの最大リトライ回数

/**
 * 処理の第1ステップ (クライアントから呼び出される)
 * スプレッドシートとシートを準備し、ページネーション処理のメタデータを返す。
 * @returns {Object} 処理状況 (status, message, metaData)
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

    // ステップ 4: 処理メタデータの作成
    const metaData = {
      spreadsheetId: ss.getId(),
      sheetName: sheetName,
      query: query,
      nextPageToken: null, // 最初のページは null
      totalFiles: 0,       // 処理した総ファイル数
      processedCount: 0  // 書き込んだ総ファイル数
    };

    // 最初のページの処理を要求する
    return {
      status: "processing",
      message: `スプレッドシート「${sheetName}」の準備完了。ファイル検索を開始します...`,
      metaData: metaData,
    };

  } catch (e) {
    Logger.log(`startProcessing エラー: ${e.message} (スタック: ${e.stack})`);
    return { status: "error", message: `処理開始エラー: ${e.message}` };
  }
}

/**
 * 処理の第2ステップ (クライアントから再帰的に呼び出される)
 * Drive API v3 を使用してファイルリストの次のページを取得し、シートに書き込む。
 * @param {Object} metaData 処理メタデータ (spreadsheetId, sheetName, query, nextPageToken, processedCount)
 * @returns {Object} 処理状況 (status, message, metaData)
 */
function processNextPage(metaData) {
  try {
    // ステップ 1: スプレッドシートを開く
    const ss = SpreadsheetApp.openById(metaData.spreadsheetId);
    const sheet = ss.getSheetByName(metaData.sheetName);
    if (!sheet) {
      throw new Error(`シート "${metaData.sheetName}" が見つかりません。`);
    }

    // ステップ 2: Drive API (v3) を呼び出すためのオプション設定
    const options = {
      q: metaData.query,
      pageSize: PAGE_SIZE,
      fields: "nextPageToken, files(id, name, mimeType, webViewLink, modifiedTime, lastModifyingUser(displayName, emailAddress))", // 取得するフィールドを指定
      pageToken: metaData.nextPageToken || null,
      corpora: "user", // 検索対象を 'user' (マイドライブと共有アイテム) に限定
      orderBy: "modifiedTime desc" //（任意）更新日の降順で取得
    };

    // ステップ 3: Drive API の呼び出し (自動リトライ処理付き)
    // -------------------------------------------------------------
    let retries = 0;
    let response = null;
    let operationSucceeded = false;

    while (retries < MAX_RETRIES) {
      try {
        Logger.log(`Drive.Files.list 呼び出し (Attempt ${retries + 1}/${MAX_RETRIES}, PageToken: ${options.pageToken ? options.pageToken.substring(0, 10) + '...' : 'null'})`);
        response = Drive.Files.list(options);
        // API呼び出しが成功したらループを抜ける
        operationSucceeded = true;
        break; 
        
      } catch (e) {
        retries++;
        const errorMessage = e.message;
        Logger.log(`Drive.Files.list エラー (Attempt ${retries}/${MAX_RETRIES}): ${errorMessage}`);

        // 一時的なエラー (Internal Error や レート制限) かどうかを判定
        const isTemporaryError = errorMessage.includes("Internal Error") || 
                                 errorMessage.includes("limit") || 
                                 errorMessage.includes("User Rate Limit Exceeded") ||
                                 errorMessage.includes("Service invoked too many times");

        if (isTemporaryError) {
          if (retries >= MAX_RETRIES) {
            Logger.log("リトライ回数が上限に達しました。処理を停止します。");
            throw new Error(`Drive API の呼び出しに失敗しました (リトライ上限超過): ${errorMessage}`);
          }
          // Exponential Backoff: 2^retries 秒 + ランダムなミリ秒
          const waitTime = Math.pow(2, retries) * 1000 + Math.floor(Math.random() * 1000); 
          Logger.log(`${waitTime / 1000} 秒待機して再試行します...`);
          Utilities.sleep(waitTime);
        } else {
          // 一時的でないエラー (クエリ構文エラーなど) はすぐにスローする
          throw e;
        }
      }
    }
    
    if (!operationSucceeded || !response) {
      // (通常はリトライロジック内で throw されるが、念のため)
      throw new Error("API呼び出しに失敗しましたが、リトライロジックで捕捉されませんでした。");
    }
    // -------------------------------------------------------------
    // (ステップ 3 終了)


    // ステップ 4: 取得したファイルリストの処理とフィルタリング
    const files = response.files;
    let fileListChunk = [];
    if (files && files.length > 0) {
      fileListChunk = filterAndFormatFiles(files, ss.getSpreadsheetTimeZone());
    }
    
    // ステップ 5: フィルタリング後のデータをシートに追記
    if (fileListChunk.length > 0) {
      const startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, fileListChunk.length, fileListChunk[0].length).setValues(fileListChunk);
      metaData.processedCount += fileListChunk.length;
      Logger.log(`${fileListChunk.length} 件をシートに書き込みました (計 ${metaData.processedCount} 件)`);
    }

    // ステップ 6: 次のページトークンをメタデータに保存
    metaData.nextPageToken = response.nextPageToken;

    // ステップ 7: 処理を続行するか判断
    if (metaData.nextPageToken) {
      // 次のページあり
      return {
        status: "processing",
        message: `${metaData.processedCount} 件書き込み完了... (次のページを検索中)`,
        metaData: metaData,
      };
    } else {
      // すべてのページを処理完了
      Logger.log(`全ページの処理が完了しました。合計 ${metaData.processedCount} 件。`);
      return finalizeProcessing(metaData);
    }

  } catch (e) {
    Logger.log(`processNextPage エラー: ${e.message} (スタック: ${e.stack})`);
    return { status: "error", message: `処理エラー: ${e.message}` };
  }
}

/**
 * 処理の最終ステップ (processNextPage から呼び出される)
 * シートの並び替え、最終メッセージの生成を行う。
 * @param {Object} metaData 処理メタデータ
 * @returns {Object} 最終結果 (status, message)
 */
function finalizeProcessing(metaData) {
  try {
    // スプレッドシートを開く
    const ss = SpreadsheetApp.openById(metaData.spreadsheetId);
    
    // シートを日付の降順で並び替える
    sortSheetsByDateDescending(ss);

    // データがない場合のメッセージ
    if (metaData.processedCount === 0) {
      const sheet = ss.getSheetByName(metaData.sheetName);
      if (sheet) {
        sheet.getRange(2, 1).setValue("対象のファイルは見つかりませんでした。");
      }
    }
    
    Logger.log(`処理完了。 (SessionID: ${metaData.spreadsheetId})`);

    return {
      status: "success",
      message: `処理が正常に完了しました。全 ${metaData.processedCount} 件のファイルがシート「${metaData.sheetName}」に書き込まれました。`,
      metaData: metaData
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
    // .txt と .md は MIME Type (text/plain) が広すぎるため、
    // Drive API のクエリでは含めず、後処理でフィルタリングする
  ];
}

/**
 * Drive API (v3) 用の検索クエリ文字列を構築する
 * @returns {string} 検索クエリ
 */
function buildSearchQuery() {
  const mimeTypes = getSearchableMimeTypes();
  const mimeQuery = mimeTypes.map(type => `mimeType = '${type}'`).join(' or ');

  // Drive API v3 では、 'contains' よりも 'name contains' の方が明示的
  const extensionQuery = [
    `name contains '.txt'`,
    `name contains '.md'`
  ].join(' or ');

  // trashed = false (ゴミ箱は除外) はデフォルトで適用されることが多いが、明示する
  return `(${mimeQuery}) or (${extensionQuery}) and trashed = false`;
}

/**
 * Drive.Files.list の結果をフィルタリングし、シート書き込み用にフォーマットする
 * @param {Array<Object>} files Drive API から返された File リソースの配列
 * @param {string} timezone スプレッドシートのタイムゾーン
 * @returns {Array<Array<string>>} シート書き込み用の2次元配列
 */
function filterAndFormatFiles(files, timezone) {
  const output = [];
  const mimeTypes = getSearchableMimeTypes();
  const strictExtensions = ['.txt', '.md'];

  files.forEach(file => {
    // ファイル名がない場合はスキップ (まれにあり得る)
    if (!file.name) {
      return;
    }
    
    const fileName = file.name;
    const fileMimeType = file.mimeType;
    
    // 1. MIMEタイプが一致するか確認
    const isMimeMatch = mimeTypes.includes(fileMimeType);
    
    // 2. MIMEタイプが一致しない場合、拡張子を厳密にチェック
    let isExtensionMatch = false;
    if (!isMimeMatch) {
      const lowerFileName = fileName.toLowerCase();
      for (const ext of strictExtensions) {
        if (lowerFileName.endsWith(ext)) {
          isExtensionMatch = true;
          break;
        }
      }
    }

    // 3. どちらかが一致した場合のみリストに追加
    if (isMimeMatch || isExtensionMatch) {
      // Drive API (v3) の日付形式 (ISO 8601) を Utilities.formatDate でフォーマット
      const lastUpdated = Utilities.formatDate(new Date(file.modifiedTime), timezone, "yyyy-MM-dd HH:mm:ss");
      
      output.push([
        fileName,
        file.webViewLink, // DriveApp.getUrl() と同等
        file.id,
        lastUpdated
      ]);
    }
  });
  return output;
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
    // Webアプリコンテキストでは UI は使えないため、エラーをスローする
    throw new Error(`スプレッドシートの新規作成に失敗しました: ${e.message}`);
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
    // スプレッドシートを開くより、Drive API でファイル情報を取得する方が効率的
    // DriveApp を使う（Drive API v3 が有効でも DriveApp は使える）
    const file = DriveApp.getFileById(spreadsheetId);
    const ss = SpreadsheetApp.openById(spreadsheetId); // タイムゾーン取得のために開く
    const timezone = ss.getSpreadsheetTimeZone();
    
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
    // ID が無効（ファイル削除など）の可能性
    userProps.deleteProperty(SPREADSHEET_ID_KEY);
    Logger.log("無効なIDのため、UserPropertiesからIDを削除しました。");
    return null;
  }
}