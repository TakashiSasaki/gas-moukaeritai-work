function doGet(e) {
    var key = e.pathInfo;
    var cache = CacheService.getScriptCache();

    if (key) {
        // クエリ文字列が提供されている場合はキャッシュに保存
        if (e.queryString) {
            cache.put(key, e.queryString);
            return ContentService.createTextOutput("クエリが保存されました: " + key);
        } else {
            // クエリ文字列がない場合はキャッシュから値を取得して返す
            var cachedValue = cache.get(key);
            if (cachedValue) {
                return ContentService.createTextOutput("キャッシュからの値: " + cachedValue);
            } else {
                return ContentService.createTextOutput("キャッシュに値が見つかりませんでした。");
            }
        }
    } else {
        // pathInfoが提供されていない場合はindex.htmlを返す
        var htmlTemplate = HtmlService.createTemplateFromFile("index");
        var htmlOutput = htmlTemplate.evaluate();
        return htmlOutput;
    }
}
