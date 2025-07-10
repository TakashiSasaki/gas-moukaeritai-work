/**
  @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
*/
function decodeXWwwFormUrlencoded(formEncodedString) {
  var strings = formEncodedString.split("&");
  var result = {};
  for(var i in strings){
    var kv = strings[i].split("=");
    var k = decodeURIComponent(kv[0]);
    var v = decodeURIComponent(kv[1]);
    result[k] = v;
  }
  return result;
}

/**
  @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
*/
function encodeToXWwwFormUrlencoded(object){
  var resultArray = [];
  for(var i in object) {
    var k = encodeURIComponent(i).replace(/%20/g,"+")
      .replace(/%20/g,"+")
      .replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16)
      });
    var v = encodeURIComponent(object[i])
      .replace(/%20/g,"+")
      .replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16)
      });
    var kv = k + "=" + v;
    resultArray.push(kv);
  }
  var result = resultArray.join("&");
  return result;
}

function testFormEncodedString(){
  var o = {
    a : 123,
    b : "1 2 3",
    c : "hello",
    d : "こんにちは",
    e : "1+2+3",
  };
  var formEncodedString = encodeToXWwwFormUrlencoded(o);
  Logger.log(formEncodedString);
  var o2 = decodeXWwwFormUrlencoded(formEncodedString);
  Logger.log(JSON.stringify(o2));
  Logger.log(decodeURIComponent("a+b"));
  Logger.log(decodeXWwwFormUrlencoded("access_token=742fd18ac73fbb86bb972501af501df9930cdc0d&scope=repo&token_type=bearer"));
}
