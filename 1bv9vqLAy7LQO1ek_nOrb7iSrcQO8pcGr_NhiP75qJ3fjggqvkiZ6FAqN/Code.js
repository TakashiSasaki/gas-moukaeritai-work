// Code.gs - サーバサイドコード
// ・ファイル一覧の取得はユーザーキャッシュを利用して高速応答（10分間キャッシュ）。
// ・processFiles では、各ファイルについてテキストと byteCount をキャッシュし、キャッシュがあればそれを利用して行・タブ行のカウントを行う。
// ・出力ファイルは UTF-16、dictionary.txt は UTF-8 としてデコードします。
// ・各処理では LockService により多重呼び出しを防止しています。

function doGet() {
  // HTMLテンプレートをそのまま返す（ファイル一覧は非同期で取得）
  var template = HtmlService.createTemplateFromFile('index');
  const htmlOutput = template.evaluate().setTitle('Aggregate IME dictionaries in Google Drive');
  Logger.log(htmlOutput.getContent());
  return htmlOutput;
}

/**
 * getFileList - Google Drive から以下のファイルを検索する：
 *   1. "PersonalDictionary.zip" という名前のファイル
 *   2. "output<number>.txt"（正の整数）の形式のファイル
 *
 * 各ファイルについて、作成日（YYYY-MM-DD）、親フォルダ名、サイズのメタデータを取得する。
 * ※個々のファイルは extractMetadata 内で個別にキャッシュ（キー："metadata_＜ファイルID＞_＜最終更新時刻＞"）し、
 *    また全体のファイル一覧は "fileList" キーで 10 分間キャッシュする。
 *
 * @return {Array} 見つかったファイルのオブジェクト配列
 */
function getFileList() {
  var overallCache = CacheService.getUserCache();
  var cached = overallCache.get("fileList");
  if (cached) {
    return JSON.parse(cached);
  }
  
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(0)) {
    throw new Error('Server is busy, please try again later.');
  }
  try {
    var files = [];
    var timeZone = Session.getScriptTimeZone();
    
    // 各ファイルのメタデータを取得し、個別にキャッシュする
    function extractMetadata(file) {
      var cache = CacheService.getUserCache();
      // キャッシュキー：ファイルID と 最終更新時刻を利用
      var key = "metadata_" + file.getId() + "_" + file.getLastUpdated().getTime();
      var cachedMetadata = cache.get(key);
      if (cachedMetadata) {
        return JSON.parse(cachedMetadata);
      }
      
      var createdDateFormatted = Utilities.formatDate(file.getDateCreated(), timeZone, "yyyy-MM-dd");
      var parentName = '';
      var parents = file.getParents();
      if (parents.hasNext()) {
        parentName = parents.next().getName();
      }
      var metadata = {
        name: file.getName(),
        id: file.getId(),
        url: file.getUrl(),
        createdDate: createdDateFormatted,
        parentFolder: parentName,
        size: file.getSize()
      };
      // 10分間（600秒）キャッシュ
      cache.put(key, JSON.stringify(metadata), 600);
      return metadata;
    }
    
    // "PersonalDictionary.zip" を検索
    var pdFiles = DriveApp.getFilesByName("PersonalDictionary.zip");
    while (pdFiles.hasNext()) {
      files.push(extractMetadata(pdFiles.next()));
    }
    
    // "output<number>.txt" 形式のファイルを検索
    var textFiles = DriveApp.getFilesByType(MimeType.PLAIN_TEXT);
    while (textFiles.hasNext()) {
      var file = textFiles.next();
      if (/^output\d+\.txt$/.test(file.getName())) {
        files.push(extractMetadata(file));
      }
    }
    
    // 全体の結果を "fileList" キーで10分間キャッシュ
    overallCache.put("fileList", JSON.stringify(files), 600);
    return files;
  } finally {
    lock.releaseLock();
  }
}



/**
 * processFiles - 各ファイルのテキストを読み込み、以下の統計を算出する：
 *   - Byte count, Line count, Tab-Containing Line Count（ハードタブを含む行の数）
 *
 * PersonalDictionary.zip については、zipを展開して "dictionary.txt" を UTF-8 として読み出す。
 * output ファイルについては、UTF-16 としてデコードする。
 *
 * 各ファイルごとに、テキストと byteCount をユーザーキャッシュに保存し、次回以降はキャッシュを利用する。
 *
 * キャッシュキー例：
 *   - PersonalDictionary.zip: "process_pd_" + fileId + "_" + lastUpdatedTime
 *   - output ファイル: "process_output_" + fileId + "_" + lastUpdatedTime
 *
 * @return {Array} 各ファイルの処理結果オブジェクト配列
 */
function processFiles() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(0)) {
    throw new Error('Server is busy, please try again later.');
  }
  try {
    var files = getFileList();
    var results = [];
    var cache = CacheService.getUserCache();
    
    for (var i = 0; i < files.length; i++) {
      var fileMeta = files[i];
      // PersonalDictionary.zip の場合
      if (fileMeta.name === "PersonalDictionary.zip") {
        try {
          var zipFile = DriveApp.getFileById(fileMeta.id);
          var lastUpdated = zipFile.getLastUpdated().getTime();
          var cacheKey = "process_pd_" + fileMeta.id + "_" + lastUpdated;
          var cachedData = cache.get(cacheKey);
          var data;
          if (cachedData) {
            data = JSON.parse(cachedData);
          } else {
            var blob = zipFile.getBlob();
            var blobs = Utilities.unzip(blob);
            var dictBlob = null;
            for (var j = 0; j < blobs.length; j++) {
              if (blobs[j].getName && blobs[j].getName() === "dictionary.txt") {
                dictBlob = blobs[j];
                break;
              }
            }
            if (dictBlob === null) {
              results.push({
                source: fileMeta.name,
                processedFile: "dictionary.txt",
                error: "dictionary.txt not found in zip file",
                fileId: fileMeta.id
              });
              continue;
            }
            var text = dictBlob.getDataAsString(); // UTF-8
            var byteCount = dictBlob.getBytes().length;
            // キャッシュへ保存
            data = { text: text, byteCount: byteCount };
            cache.put(cacheKey, JSON.stringify(data), 600);
          }
          // テキストから行数・タブを含む行数を計算
          var lines = data.text.split(/\r?\n/);
          var lineCount = lines.length;
          var tabLineCount = 0;
          for (var j = 0; j < lines.length; j++) {
            if (lines[j].indexOf('\t') !== -1) {
              tabLineCount++;
            }
          }
          results.push({
            source: fileMeta.name,
            processedFile: "dictionary.txt",
            byteCount: data.byteCount,
            lineCount: lineCount,
            tabLineCount: tabLineCount,
            fileId: fileMeta.id
          });
        } catch (e) {
          results.push({
            source: fileMeta.name,
            processedFile: "dictionary.txt",
            error: e.message,
            fileId: fileMeta.id
          });
        }
      }
      // output ファイルの場合（UTF-16）
      else if (/^output\d+\.txt$/.test(fileMeta.name)) {
        try {
          var outputFile = DriveApp.getFileById(fileMeta.id);
          var lastUpdated = outputFile.getLastUpdated().getTime();
          var cacheKey = "process_output_" + fileMeta.id + "_" + lastUpdated;
          var cachedData = cache.get(cacheKey);
          var data;
          if (cachedData) {
            data = JSON.parse(cachedData);
          } else {
            var blob = outputFile.getBlob();
            var text = blob.getDataAsString("UTF-16"); // UTF-16 でデコード
            var byteCount = blob.getBytes().length;
            data = { text: text, byteCount: byteCount };
            cache.put(cacheKey, JSON.stringify(data), 600);
          }
          var lines = data.text.split(/\r?\n/);
          var lineCount = lines.length;
          var tabLineCount = 0;
          for (var j = 0; j < lines.length; j++) {
            if (lines[j].indexOf('\t') !== -1) {
              tabLineCount++;
            }
          }
          results.push({
            source: fileMeta.name,
            processedFile: fileMeta.name,
            byteCount: data.byteCount,
            lineCount: lineCount,
            tabLineCount: tabLineCount,
            fileId: fileMeta.id
          });
        } catch (e) {
          results.push({
            source: fileMeta.name,
            processedFile: fileMeta.name,
            error: e.message,
            fileId: fileMeta.id
          });
        }
      }
    }
    return results;
  } finally {
    lock.releaseLock();
  }
}


