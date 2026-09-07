function getCategoryPageNames(){
  var response_string = fetch("http://kakaku.com/allcategory.htm");
  var matches = response_string.match(/class="category"><h2><a href="http:\/\/kakaku.com\/[^"]+" title="[^"]+"/g);
  Logger.log(matches);
  var result = [["category_name", "category_page"]];
  for(var i=0; i<matches.length; ++i) {
    var match = matches[i].match(/http:\/\/kakaku.com\/([^"]+)" title="([^"]+)"/);
    result.push([match[2], match[1]]);
  }
  Logger.log(result);
  return result;
}
