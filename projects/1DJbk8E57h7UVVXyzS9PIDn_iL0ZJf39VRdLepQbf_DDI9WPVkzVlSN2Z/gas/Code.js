/**
 * Webアプリケーションとしてアクセスされた際にHTMLページを表示します。
 * テンプレートを評価して、CSSとJSをインクルードします。
 * @param {Object} e - イベントオブジェクト。
 * @returns {HtmlOutput} HTMLサービスのアウトプット。
 */
function doGet(e) {
  // createTemplateFromFileを使用してテンプレートを評価（evaluate）する
  return HtmlService.createTemplateFromFile('index.html')
    .evaluate() 
    .setTitle('File Triage')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/**
 * HTMLテンプレート内で他のHTMLファイル（CSSやJS）をインクルードするためのヘルパー関数。
 * @param {string} filename - インクルードするファイルの名前（拡張子なし）。
 * @returns {string} ファイルのコンテンツ。
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * 指定されたフォルダIDをユーザープロパティに保存します。
 * @param {string} folderId - 保存するGoogle DriveのフォルダID。
 * @returns {Object} 保存されたフォルダのIDと名前を含むオブジェクト。
 * @throws {Error} フォルダIDが無効またはアクセス不能な場合にエラーをスローします。
 */
function saveFolderId(folderId) {
  if (!folderId) {
    throw new Error('フォルダIDが指定されていません。');
  }
  try {
    const folder = DriveApp.getFolderById(folderId); // IDの妥当性を検証
    const userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('incomingFolderId', folderId);
    
    return { 
      id: folderId, 
      name: folder.getName() 
    };
  } catch (error) {
    throw new Error(`無効なフォルダID、またはそのフォルダへのアクセス権がありません: ${folderId}`);
  }
}

/**
 * ユーザープロパティに保存されているフォルダの情報を取得します。
 * @returns {Object|null} 保存されているフォルダのIDと名前を含むオブジェクト。保存されていない場合はnull。
 */
function getSavedFolderInfo() {
  const userProperties = PropertiesService.getUserProperties();
  const folderId = userProperties.getProperty('incomingFolderId');
  
  if (folderId) {
    try {
      const folder = DriveApp.getFolderById(folderId);
      return { 
        id: folderId, 
        name: folder.getName() 
      };
    } catch (e) {
      // 保存されているIDが削除されたフォルダ等の場合
      return null;
    }
  }
  return null;
}

/**
 * ユーザーのGoogle Driveのルート直下にあるフォルダ一覧を取得します。
 * @returns {Array<Object>} フォルダの{id, name}の配列。
 */
function listRootFolders() {
  const root = DriveApp.getRootFolder();
  const folders = root.getFolders();
  const folderList = [];
  while (folders.hasNext()) {
    const folder = folders.next();
    folderList.push({
      id: folder.getId(),
      name: folder.getName()
    });
  }
  Logger.log(folderList.length);
  return folderList;
}

/**
 * 起点フォルダ内のサブフォルダと【すべての対象ファイル】の一覧を取得します。
 * ファイルはPDFとGoogleドキュメントのみを対象とします。
 * @returns {Object} サブフォルダとファイルのリストを含むオブジェクト。
 */
function getFolderContents() {
  const userProperties = PropertiesService.getUserProperties();
  const folderId = userProperties.getProperty('incomingFolderId');

  if (!folderId) {
    throw new Error('起点となるフォルダが設定されていません。');
  }

  try {
    const parentFolder = DriveApp.getFolderById(folderId);
    const subfoldersList = [];

    // サブフォルダ一覧を取得
    const subfolders = parentFolder.getFolders();
    while (subfolders.hasNext()) {
      const folder = subfolders.next();
      subfoldersList.push({
        id: folder.getId(),
        name: folder.getName()
      });
    }

    // 初回表示用に全ファイルを取得
    const allFiles = getAllFilesFromFolder(parentFolder);
    
    return {
      subfolders: subfoldersList,
      files: allFiles
    };

  } catch (e) {
    throw new Error('起点フォルダへのアクセスに失敗しました。削除されたか、権限が変更された可能性があります。');
  }
}

/**
 * 指定されたフォルダ内の対象ファイル（PDF, Google Doc）をすべて取得するヘルパー関数
 * @param {Folder} folder - 対象のフォルダオブジェクト
 * @return {Array<Object>} ファイル情報の配列
 */
function getAllFilesFromFolder(folder) {
  const filesList = [];
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const mimeType = file.getMimeType();
    let fileType = '';

    if (mimeType === MimeType.PDF) {
      fileType = 'PDF';
    } else if (mimeType === MimeType.GOOGLE_DOCS) {
      fileType = 'Google Doc';
    } else {
      continue;
    }
    filesList.push({ id: file.getId(), name: file.getName(), type: fileType });
  }
  return filesList;
}

/**
 * 起点フォルダ内で、指定されたクエリテキストを含むファイルを検索します。
 * @param {string} queryText - 検索する文字列。サブフォルダ名を想定。
 * "__ALL__" が渡された場合は全ファイルを返す。
 * @returns {Array<Object>} 検索結果のファイルリスト。
 */
function searchFiles(queryText) {
  const userProperties = PropertiesService.getUserProperties();
  const folderId = userProperties.getProperty('incomingFolderId');
  if (!folderId) {
    throw new Error('起点となるフォルダが設定されていません。');
  }

  try {
    const parentFolder = DriveApp.getFolderById(folderId);
    
    // "__ALL__" が指定された場合は、全ファイルを検索して返す
    if (queryText === "__ALL__") {
      return getAllFilesFromFolder(parentFolder);
    }

    // 検索クエリを組み立てる
    const searchQuery = `(fullText contains '${queryText}' or title contains '${queryText}') and (mimeType = '${MimeType.PDF}' or mimeType = '${MimeType.GOOGLE_DOCS}')`;
    
    const filesList = [];
    const files = parentFolder.searchFiles(searchQuery);

    while (files.hasNext()) {
      const file = files.next();
      let fileType = '';
      const mimeType = file.getMimeType();
      if (mimeType === MimeType.PDF) {
        fileType = 'PDF';
      } else if (mimeType === MimeType.GOOGLE_DOCS) {
        fileType = 'Google Doc';
      }
      filesList.push({
        id: file.getId(),
        name: file.getName(),
        type: fileType
      });
    }
    return filesList;

  } catch (e) {
    console.error(e);
    throw new Error('ファイルの検索中にエラーが発生しました。');
  }
}

/**
 * 起点フォルダ内に新しいサブフォルダを作成します。
 * @param {string} newFolderName - 作成する新しいフォルダの名前。
 * @returns {Array<Object>} 更新されたサブフォルダのリスト。
 */
function createSubfolder(newFolderName) {
  if (!newFolderName || newFolderName.trim() === '') {
    throw new Error('フォルダ名が空です。');
  }

  const userProperties = PropertiesService.getUserProperties();
  const folderId = userProperties.getProperty('incomingFolderId');
  if (!folderId) {
    throw new Error('起点となるフォルダが設定されていません。');
  }

  try {
    const parentFolder = DriveApp.getFolderById(folderId);
    
    // 新しいフォルダを作成
    parentFolder.createFolder(newFolderName.trim());

    // UI更新のため、全サブフォルダのリストを再取得して返す
    const subfoldersList = [];
    const subfolders = parentFolder.getFolders();
    while (subfolders.hasNext()) {
      const folder = subfolders.next();
      subfoldersList.push({
        id: folder.getId(),
        name: folder.getName()
      });
    }
    return subfoldersList;

  } catch (e) {
    console.error(e);
    throw new Error('サブフォルダの作成中にエラーが発生しました。');
  }
}

/**
 * 指定されたファイルを指定されたサブフォルダに移動します。
 * @param {Array<string>} fileIds - 移動するファイルのIDの配列。
 * @param {string} destinationFolderName - 移動先のサブフォルダ名。
 * @param {string} currentFilterName - UIを更新するための現在のフィルタ名。
 * @returns {Array<Object>} 移動後の、起点フォルダに残っているファイルのリスト。
 */
function moveFilesToSubfolder(fileIds, destinationFolderName, currentFilterName) {
  if (!fileIds || fileIds.length === 0) {
    throw new Error('移動対象のファイルが指定されていません。');
  }
  if (!destinationFolderName || destinationFolderName === '__ALL__') {
    throw new Error('移動先のフォルダが指定されていません。');
  }

  const userProperties = PropertiesService.getUserProperties();
  const folderId = userProperties.getProperty('incomingFolderId');
  if (!folderId) {
    throw new Error('起点となるフォルダが設定されていません。');
  }

  try {
    const parentFolder = DriveApp.getFolderById(folderId);
    
    // 移動先フォルダを取得
    const folderIterator = parentFolder.getFoldersByName(destinationFolderName);
    if (!folderIterator.hasNext()) {
      throw new Error(`移動先フォルダ「${destinationFolderName}」が見つかりません。`);
    }
    const destinationFolder = folderIterator.next();

    // ファイルを一つずつ移動
    for (const fileId of fileIds) {
      const file = DriveApp.getFileById(fileId);
      file.moveTo(destinationFolder);
    }

    // UI更新のため、現在のフィルタ条件でファイルリストを再検索して返す
    return searchFiles(currentFilterName);

  } catch (e) {
    console.error(e);
    throw new Error('ファイルの移動中にエラーが発生しました。');
  }
}