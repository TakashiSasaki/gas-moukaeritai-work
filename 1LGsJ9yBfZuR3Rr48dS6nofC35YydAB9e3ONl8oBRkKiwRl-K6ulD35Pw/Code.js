/**
 * WebアプリのUI（HTML）を提供します。
 */
function doGet(e) {
  // 'index.html' という名前のHTMLファイルを作成して使用します
  return HtmlService.createTemplateFromFile('index').evaluate()
    .setTitle('Markdown抽出ツール')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/**
 * HTMLのクライアントサイドJSから呼び出すためのラッパー関数。
 *
 * @param {string} fileId 処理対象のファイルのID。
 * @return {string} 抽出されたプレーンテキスト。
 */
function callExtractMarkdown(fileId) {
  // メインの関数を呼び出す
  return extractMarkdownFromFile(fileId);
}

// ----------------------------------------------------
// メインロジック
// ----------------------------------------------------

/**
 * Googleドライブ上のファイルからプレーンテキストを抽出します。
 * Googleドキュメント、Googleスライド、PDF に対応します。
 *
 * @param {string} fileId 処理対象のファイルのID。
 * @return {string} 抽出されたプレーンテキスト。エラーが発生した場合はエラーメッセージを返します。
 */
function extractMarkdownFromFile(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    const mimeType = file.getMimeType();

    switch (mimeType) {
      case MimeType.GOOGLE_DOCS:
        Logger.log(`処理中: Googleドキュメント (${fileId})`);
        return processGoogleDoc(fileId);

      case MimeType.GOOGLE_SLIDES:
        Logger.log(`処理中: Googleスライド (${fileId})`);
        return processGoogleSlides(fileId);

      case MimeType.PDF:
        Logger.log(`処理中: PDF (${fileId})`);
        return processPdf(fileId);

      default:
        Logger.log(`エラー: サポートされていないファイルタイプ (${mimeType})`);
        return `エラー: サポートされていないファイルタイプです (${mimeType})`;
    }
  } catch (error) {
    Logger.log(`エラーが発生しました (fileId: ${fileId}): ${error.message}\n${error.stack}`);
    return `エラーが発生しました: ${error.message}`;
  }
}

// =======================================================================
// 1. Googleドキュメント処理 (v11 - プレーンテキスト版)
// =======================================================================

/**
 * Googleドキュメントからプレーンテキストを抽出します。
 * 高速ですが、見出し、リスト、太字などの書式はすべて失われます。
 * 表 (Table) の中のテキストも抽出対象となります。
 *
 * @param {string} docId ドキュメントのID。
 * @return {string} 抽出されたプレーンテキスト。
 */
function processGoogleDoc(docId) {
  try {
    const doc = DocumentApp.openById(docId);
    // .getBody().getText() を使うことで、表を含むすべてのテキストを高速に取得
    return doc.getBody().getText();
  } catch (e) {
    Logger.log(`processGoogleDoc (プレーンテキスト) エラー: ${e.message}`);
    return `ドキュメントのテキスト取得エラー: ${e.message}`;
  }
}

// =======================================================================
// 2. Googleスライド処理 (v11 - プレーンテキスト版)
// =======================================================================

/**
 * Googleスライドからプレーンテキストを抽出します。
 * 高速ですが、書式（太字、斜体など）は失われます。
 *
 * @param {string} slidesId プレゼンテーションのID。
 * @return {string} 抽出されたプレーンテキスト。
 */
function processGoogleSlides(slidesId) {
  let textOutput = ""; // 抽出するテキスト
  try {
    const presentation = SlidesApp.openById(slidesId);
    const slides = presentation.getSlides();

    slides.forEach((slide, i) => {
      textOutput += `## スライド ${i + 1}\n\n`;
      const shapes = slide.getShapes();
      
      for (const shape of shapes) {
        if (shape.getType() === SlidesApp.ShapeType.TEXT) {
          // .getText() で TextRange を取得し、.asString() でプレーンテキストを取得
          const textValue = shape.getText().asString();
          if (textValue.trim().length > 0) {
            textOutput += textValue + "\n\n"; // テキストボックスごとに改行
          }
        }
      }
      textOutput += "\n---\n\n"; // スライド間の区切り線
    });
  } catch (e) {
    Logger.log(`processGoogleSlides (プレーンテキスト) エラー: ${e.message}`);
    return `スライドのテキスト取得エラー: ${e.message}`;
  }
  return textOutput;
}

// =======================================================================
// 3. PDF処理 (v11改 - Drive API v2 修正版)
// =======================================================================

/**
 * PDFファイルからプレーンテキストを抽出します。
 * Drive API (v2) アドバンストサービスを使用します。
 *
 * (v11 で発生した 'OCR is not supported' エラーを修正するため、
 * resource オブジェクトから mimeType: GOOGLE_DOCS を削除しました)
 *
 * @param {string} fileId PDFファイルのID。
 * @return {string} 抽出されたプレーンテキスト。
 */
function processPdf(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    const blob = file.getBlob();
    
    // PDFを一時的なGoogleドキュメントに変換してテキストを抽出 (OCR)
    const resource = {
      title: `[temp_ocr] ${file.getName()}`
      // mimeType: MimeType.GOOGLE_DOCS <-- 削除 (v11 でのエラー原因)
    };
    
    // Drive アドバンストサービス (v2) を使用
    // ocr: true を指定すると、blob (PDF) が自動的に Google Doc に変換される
    const tempDoc = Drive.Files.insert(resource, blob, { ocr: true });
    
    let text = "";
    if (tempDoc.id) {
      // 変換されたドキュメントを開いてテキストを取得
      const doc = DocumentApp.openById(tempDoc.id);
      text = doc.getBody().getText();
      
      // 一時ファイルをゴミ箱に移動
      Drive.Files.trash(tempDoc.id);
    } else {
      throw new Error("PDFからGoogleドキュメントへの変換に失敗しました。");
    }

    return "--- PDFからのプレーンテキスト ---\n\n" + text;

  } catch (e) {
    if (e.message.includes("Drive.Files.insert is not a function") || 
        e.message.includes("Drive.Files.trash is not a function")) {
      return "エラー: PDF処理には「Drive API (v2)」アドバンストサービスの有効化が必要です。(v3と競合していないか確認してください)";
    }
    // "Invalid argument" もここでキャッチされる
    Logger.log(`PDF処理エラー: ${e.message}`);
    return `PDF処理エラー: ${e.message}`;
  }
}


// =======================================================================
// 4. ファイルピッカー (キャッシュ機能なし)
// =======================================================================

/**
 * 指定されたフォルダIDの中身（サブフォルダと許可されたファイル）を取得します。
 * (注: キャッシュサイズ制限 (100KB) のため、キャッシュ機能は削除されています。)
 *
 * @param {string | null} folderId 取得対象のフォルダID。
 * @return {Object} { folders: Array, files: Array, currentFolder: Object, parentFolder: Object | null }
 */
function getFolderContents(folderId) {
  try {
    // folderId が null または 'root' の場合はルートフォルダを取得
    const folder = (folderId === null || folderId === 'root') ? 
                   DriveApp.getRootFolder() : 
                   DriveApp.getFolderById(folderId);

    const folders = [];
    const files = [];

    // 抽出対象のMIMEタイプ
    const allowedMimeTypes = [
      MimeType.GOOGLE_DOCS,
      MimeType.GOOGLE_SLIDES,
      MimeType.PDF
    ];

    // 1. サブフォルダを取得
    const subFolders = folder.getFolders();
    while (subFolders.hasNext()) {
      const subFolder = subFolders.next();
      folders.push({ id: subFolder.getId(), name: subFolder.getName() });
    }
    // フォルダ名をソート
    folders.sort((a, b) => a.name.localeCompare(b.name));

    // 2. ファイルを取得
    const fileIterator = folder.getFiles();
    while (fileIterator.hasNext()) {
      const file = fileIterator.next();
      const mimeType = file.getMimeType();
      
      // 許可されたMIMEタイプのみリストに追加
      if (allowedMimeTypes.includes(mimeType)) {
        files.push({ 
          id: file.getId(), 
          name: file.getName(),
          mimeType: mimeType 
        });
      }
    }
    // ファイル名をソート
    files.sort((a, b) => a.name.localeCompare(b.name));

    // 3. 親フォルダの情報を取得 (「上へ」ボタン用)
    let parent = null;
    const isRoot = (folder.getId() === DriveApp.getRootFolder().getId());
    
    if (!isRoot) {
      try {
        const parents = folder.getParents();
        if (parents.hasNext()) {
          // 複数の親を持つ場合があるが、最初の親を取得する
          const parentFolder = parents.next();
          parent = { id: parentFolder.getId(), name: parentFolder.getName() };
        }
      } catch (e) {
        Logger.log("親フォルダの取得に失敗: " + e.message);
        // "共有アイテム"など、親が追えない場合がある
      }
    }

    // 4. 結果オブジェクトを作成
    const result = {
      folders: folders,
      files: files,
      currentFolder: { id: folder.getId(), name: folder.getName() },
      parentFolder: parent
    };
    
    return result;

  } catch (e) {
    Logger.log(`getFolderContents エラー: ${e.message}`);
    return { 
      error: `フォルダの取得に失敗しました: ${e.message}`,
      folders: [], files: [], 
      currentFolder: {id: 'error', name: 'エラー'}, 
      parentFolder: null 
    };
  }
}