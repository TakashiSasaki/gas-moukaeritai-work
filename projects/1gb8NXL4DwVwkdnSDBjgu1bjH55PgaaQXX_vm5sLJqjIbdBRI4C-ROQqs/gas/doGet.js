function doGet(e) {
  // e.pathInfo でデプロイURLの末尾以降のパスを取得します。
  // 例： .../exec/settings というURLでアクセスされた場合、e.pathInfo は "settings" という文字列になります。
  if (e.pathInfo === 'settings') {
    // パスが 'settings' と一致する場合、settings.html を読み込んで返します。
    return HtmlService.createTemplateFromFile('settings')
      .evaluate()
      .setTitle('Settings'); // 必要に応じてタイトルを変更してください。
  }

  // ルートURL (.../exec/) へのアクセスや、上記条件に一致しないパスの場合は、
  // デフォルトで index.html を読み込んで返します。
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Spreadsheet Viewer');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}
