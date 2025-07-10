/**
 * @param {string} hexstring hexadecial representation of a UCS-4 character
 * @return {string} UTF-16 string for the given one UCS-4 character
 */
function ucs4HexToUtf16String(hexstring) {
  var m = hexstring.match(/[0-9A-F]+/g);
  if (m == null) return undefined;
  var s = "";
  for (var i = 0; i < m.length; ++i) {
    var l = parseInt(m[i], 16);
    var surrogate_pair = surrogatePair(l);
    for (var j = 0; j < surrogate_pair.length; ++j) {
      s += String.fromCharCode(surrogate_pair[j]);
    }
  }
  return s;
}

/**
 * @param {int} codepoint codepoint of a UCS-4 character
 * @return {string[]}
 */
function surrogatePair(codepoint) {
  //D800	<Non Private Use High Surrogate, First>
  //DB7F	<Non Private Use High Surrogate, Last>
  //DB80	<Private Use High Surrogate, First>
  //DBFF	<Private Use High Surrogate, Last>
  //DC00	<Low Surrogate, First>
  //DFFF	<Low Surrogate, Last>
  if (codepoint <= 0xffff) return [codepoint];
  var high = Math.floor((codepoint - 0x10000) / 1024) + 0xd800;
  var low = (codepoint - 0x10000) % 1024 + 0xdc00;
  return [high, low];
}
