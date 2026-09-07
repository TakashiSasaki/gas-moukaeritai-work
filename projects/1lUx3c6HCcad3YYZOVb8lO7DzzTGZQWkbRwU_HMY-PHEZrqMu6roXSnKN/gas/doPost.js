function doPost(e) {
  const cache = CacheService.getScriptCache();
  const parameters = e.parameter; // リクエストの全パラメータを取得
  const key = parameters.key;

  // パラメータがkeyのみであること、およびkeyの長さが32文字以上であることを検証
  if (Object.keys(parameters).length !== 1 || !key || key.length < 32) {
    throw new Error("Invalid request: only 'key' parameter is allowed and it must be at least 32 characters long.");
  }

  if(!e.postData.type){
    throw new Error('Unacceptable content type.');
  }

  const cacheValue = e.postData.type + String.fromCharCode(0) + e.postData.contents;
  console.log(e.postData.type);
  const oldCacheValue = cache.get(key);
  cache.put(key, cacheValue, 21600); // 6 hours

  if (oldCacheValue) {
    const [type, content] = splitZero(oldCacheValue);
    const textOutput = ContentService.createTextOutput(content);
    // MIMEタイプに基づいた応答の設定
    return setMimeType(textOutput, type);
  }//if
  // oldValueがない場合の処理が必要かもしれません。
}//doPost

function putContent(key, type, content){
  if(key === undefined) key='0123456789ABCDEF0123456789ABCDEF';
  if(type === undefined) type='unknown/unknown';
  if(content === undefined) content='HELLO';
  const cache = CacheService.getScriptCache();
  const cacheValue = type + String.fromCharCode(0) + content;
  const oldCacheValue = cache.get(key);
  cache.put(key, cacheValue, 21600); // 6 hours
  if(oldCacheValue) {
    return splitZero(oldCacheValue);
  } else {
    return [null, null];
  }//if
}//putContent

function getContent(key){
  if(key === undefined) key='0123456789ABCDEF0123456789ABCDEF';
  const cache = CacheService.getScriptCache();
  const oldCacheValue = cache.get(key);
  if(oldCacheValue){
    return splitZero(oldCacheValue);
  } else {
    return [null, null];
  }//if
}//getContent

function setMimeType(x, type) {
  switch (type) {
    case "text/csv":
      x.setMimeType(ContentService.MimeType.CSV);
      break;
    case "text/calendar":
      x.setMimeType(ContentService.MimeType.ICAL);
      break;
    case "application/javascript":
    case "text/javascript":
      x.setMimeType(ContentService.MimeType.JAVASCRIPT);
      break;
    case "application/json":
      x.setMimeType(ContentService.MimeType.JSON);
      break;
    case "text/vcard":
    case "text/directory":
      x.setMimeType(ContentService.MimeType.VCARD);
      break;
    default:
      x.setMimeType(ContentService.MimeType.TEXT);
  }
  return x;
}//setMimeType

function splitZero(s) {
  const position = s.indexOf(String.fromCharCode(0));
  if (position < 0) {
    throw new Error("No null character.");
  }
  if (position === 0) {
    throw new Error("Null character should not at the leftmost.")
  }
  const before = s.substring(0, position);
  const after = s.substring(position + 1);
  return [before, after];
}//splitZero
