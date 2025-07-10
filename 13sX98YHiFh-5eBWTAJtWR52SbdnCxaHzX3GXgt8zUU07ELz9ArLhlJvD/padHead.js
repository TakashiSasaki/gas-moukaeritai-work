/**
  @param {String} s a string to be pad
  @param {String} pad a pad character
  @param {Number} totalLength expecting length of padded string
  @return {String}
*/
function padHead(s, pad, totalLength) {
  Assert.isString(s);
  Assert.isString(pad).length(pad, 1);
  Assert.isNumber(totalLength);
  if(totalLength < s.length) {
    throw "padHead: too long.";
  }//if
  var pads = repeat(pad, totalLength);
  var concat = pads + s;
  var truncated = concat.slice(-1 * totalLength);
  return truncated;
}//padHead

padHead.test = function(){
  var num = 5;
  var s = padHead(num.toFixed(0), "0", 3);
  Assert.equalStrings(s, "005");
}

function padHeadTest(){
  padHead.test();
}