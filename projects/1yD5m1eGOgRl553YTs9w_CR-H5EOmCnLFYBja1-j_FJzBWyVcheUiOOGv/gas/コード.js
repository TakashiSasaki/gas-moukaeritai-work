/**
 * スプレッドシートのセル内に画像を配置し、再度取得できるかをテストするスクリプト
 * * 使用方法:
 * 1. スプレッドシートの拡張機能 > Apps Script を開く
 * 2. このコードを貼り付けて保存する
 * 3. testCellImage関数を実行する
 * 4. 実行ログ（Ctrl+Enter または Cmd+Enter）を確認する
 */
function testCellImage() {
  // アクティブなスプレッドシートとシートを取得
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  
  // テストに使用するセル（A1）
  const range = sheet.getRange("A1");
  
  // テスト用の画像URL（例としてGoogleのロゴを使用）
  const testImageUrl = "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";
  const testAltText = "Test Google Logo";
  
  Logger.log("=== テスト開始 ===");
  
  // ==========================================
  // 1. セル内に画像を配置するテスト
  // ==========================================
  Logger.log("1. セル A1 に画像を配置します...");
  try {
    // CellImageBuilderを使用して画像を作成
    const imageBuilder = SpreadsheetApp.newCellImage()
      .setSourceUrl(testImageUrl)
      .setAltTextDescription(testAltText);
    
    const cellImage = imageBuilder.build();
    
    // セルに画像をセット
    range.setCellImage(cellImage);
    Logger.log("-> 画像の配置に成功しました。");
    
  } catch (e) {
    Logger.log("-> 画像の配置に失敗しました: " + e.message);
    return; // 配置に失敗した場合はここで終了
  }
  
  // 変更をスプレッドシートに確実にするため待機
  SpreadsheetApp.flush();
  
  // ==========================================
  // 2. セル内から画像を取得するテスト
  // ==========================================
  Logger.log("2. セル A1 から画像を再度取得します...");
  try {
    // セルからCellImageオブジェクトを取得
    const retrievedImage = range.getCellImage();
    
    if (retrievedImage) {
      Logger.log("-> セルからの画像オブジェクト取得に成功しました。");
      
      // 画像のプロパティ（URLと代替テキスト）を取得して確認
      const url = retrievedImage.getUrl();
      const altText = retrievedImage.getAltTextDescription();
      
      Logger.log("取得したURL: " + (url ? url : "null (取得不可)"));
      Logger.log("取得した代替テキスト: " + (altText ? altText : "null (取得不可)"));
      
      // 検証
      if (url === testImageUrl) {
        Logger.log("【結果】テスト成功: 配置した画像と同じURLが取得できました。");
      } else {
        Logger.log("【結果】テスト一部成功: 画像オブジェクトは取得できましたが、元のURLとは一致しません。");
        Logger.log("※GASの仕様上、外部URLから配置した画像の元のURLがそのまま取得できない場合があります。");
      }
      
    } else {
      Logger.log("【結果】テスト失敗: 画像オブジェクトが null または undefined です。");
    }
  } catch (e) {
    Logger.log("-> 画像の取得中にエラーが発生しました: " + e.message);
  }
  
  Logger.log("=== テスト終了 ===");
}