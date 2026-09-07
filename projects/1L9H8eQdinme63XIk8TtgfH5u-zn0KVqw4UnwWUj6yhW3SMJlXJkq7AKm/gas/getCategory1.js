function getCategory1() {
  var response_string = fetch("http://kakaku.com/allcategory.htm");
  var matches = response_string.match(/"http:\/\/kakaku.com\/allcategory.htm#([^"]+)" title="([^"]+)"/g);
  var result = [];
  for(var i=1; i<matches.length; ++i) {
　　 var match =  matches[i].match(/"http:\/\/kakaku.com\/allcategory.htm#([^"]+)" title="([^"]+)"/);
    result.push([match[2], match[1]]);
  }
  Logger.log(result);
  return result;
}
