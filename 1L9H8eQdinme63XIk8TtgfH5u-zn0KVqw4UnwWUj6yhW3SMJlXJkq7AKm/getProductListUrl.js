function getProductListUrl(product_name, category1, category2) {
  if(arguments.length===0){
    product_name="パソコン";
    var product_url = getProductUrl(product_name);
    Logger.log(product_url);
    return product_url;
  }
  var search_string = StringUtilityLibrary.encodeURIComponent_Shift_JIS(product_name);
  if(!category1 && !category2){
    var product_url = "http://kakaku.com/search_results/" + search_string;
    return product_url;
  } else if(!category2) {
    var product_url = "http://kakaku.com/search_results/" + search_string + "/?category="+ ("000"+category1).slice(-4);
    return product_url;
  } else {
    var product_url = "http://kakaku.com/search_results/" + search_string + "/?category="+("000"+category1).slice(-4) + "," + ("000"+category2).slice(-4);
    return product_url;
  }
}
