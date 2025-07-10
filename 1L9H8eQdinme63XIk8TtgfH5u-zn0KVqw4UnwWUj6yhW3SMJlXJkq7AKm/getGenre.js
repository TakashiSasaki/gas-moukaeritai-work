function getGenre(page_name) {
  if(arguments.length === 0) {
    page_name = "fashion_category.htm";
    return getGenre(page_name);
  }
  var cached_result = CacheService.getScriptCache().get(page_name);
  if(cached_result) {
    var result = JSON.parse(cached_result);
    return result;
  }
  var url = "http://kakaku.com/" + page_name;
  var s = fetch(url);
  var result = [];

  var matches = s.match(/class="genre".+href="http:\/\/kakaku.com\/([^"\/]+)\/([^"\/]+)\/" title="([^"\/]+)"/g);
  if(matches){
    for(var i=0; i<matches.length; ++i) {
      var match = matches[i].match(/class="genre".+href="http:\/\/kakaku.com\/([^"\/]+)\/([^"\/]+)\/" title="([^"\/]+)"/);
      result.push([match[1], match[2], null, match[3]]);
    }
  }
  
  var matches = s.match(/class="genre".+href="http:\/\/kakaku.com\/([^"\/]+)\/([^"\/]+)\/([^"\/]+)\/" title="([^"\/]+)"/g);
  if(matches) {
    for(var i=0; i<matches.length; ++i) {
      var match = matches[i].match(/class="genre".+href="http:\/\/kakaku.com\/([^"\/]+)\/([^"\/]+)\/([^"\/]+)\/" title="([^"\/]+)"/);
      result.push([match[1], match[2], match[3], match[4]]);
    }
  }
  
  CacheService.getScriptCache().put(page_name, JSON.stringify(result), 21600);
  return result;
}
