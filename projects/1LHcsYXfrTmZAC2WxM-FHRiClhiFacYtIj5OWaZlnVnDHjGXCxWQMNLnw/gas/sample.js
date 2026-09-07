const SAMPLE1 = (function (){
  const bytes = Utilities.base64Decode(
  'JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwog' +
  'IC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAv' +
  'TWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0K' +
  'Pj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAg' +
  'L1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+' +
  'PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9u' +
  'dAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2Jq' +
  'Cgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJU' +
  'CjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVu' +
  'ZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4g' +
  'CjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAw' +
  'MDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9v' +
  'dCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G');
  if(bytes.length != 678) throw new Error("failed to get sample PDF data.");
  const uint8Array = Uint8Array.from(bytes);
  return uint8Array;
})();

function fetch(url){
  const cache = CacheService.getScriptCache();
  const cachedString = cache.get(url);
  if(typeof cachedString === "string"){
    Logger.log("cache hit");
    const listOfInteger = JSON.parse(cachedString);
    const uint8Array = Uint8Array.from(listOfInteger);
    return uint8Array;
  } else {
    Logger.log("cahe miss");
    const httpResponse = UrlFetchApp.fetch(url);
    const listOfInteger = httpResponse.getContent();
    cache.put(url, JSON.stringify(listOfInteger));
    const uint8Array = Uint8Array.from(listOfInteger);
    return uint8Array;
  }
}

const SAMPLE2 = (function(){
  const url = "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf";
  const uint8Array = fetch(url);
  if(uint8Array.length != 678) throw new Error("The size of helloworld.pdf should be 678 bytes.");
  return uint8Array;
})();

const SAMPLE3 = (function(){
  const url = "http://www.xmlpdf.com/manualfiles/hello-world.pdf";
  const uint8Array = fetch(url);
  return uint8Array;
})();

const SAMPLE4 = (function(){
  const url = "http://www.africau.edu/images/default/sample.pdf";
  const uint8Array = fetch(url);
  return uint8Array;
})();
