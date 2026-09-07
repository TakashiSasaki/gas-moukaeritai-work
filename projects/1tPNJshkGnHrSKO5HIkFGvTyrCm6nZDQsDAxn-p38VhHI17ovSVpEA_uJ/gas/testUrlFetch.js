function testUrlFetch() {
  var hex1   = "5ddc3cbc731f121cde6a41aedd90ddae40ae6a0e";
  var xor12  = "bdbc1e0100de20909b84e6c5152ab03182580552";
  var hex2   = "e06022bd73c1328c45eea76bc8ba6d9fc2f66f5c";
  var zero40 = "0000000000000000000000000000000000000000";

  var url = ScriptApp.getService().getUrl();
  var httpResponse = UrlFetchApp.fetch(url + "?hex=" + hex1 + "&" + "hex=" + hex2);
  if(httpResponse.getContentText() !== xor12) {
    throw "hex1 xor hex2 should be equal to xor12";
  }
  var httpResponse = UrlFetchApp.fetch(url + "?hex=" + hex1 + "&" + "hex=" + hex1);
  if(httpResponse.getContentText() !== zero40) {
    throw "hex1 xor hex1 should be equal to zero40";
  }
}
