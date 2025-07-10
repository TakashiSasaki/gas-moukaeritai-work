function calculateMD5(string) {
  // 文字列をUTF-8のバイト配列に変換
  var bytes = Utilities.newBlob(string).getBytes();

  // MD5ハッシュを計算
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, bytes);

  // ハッシュ値を16進数の文字列に変換
  var hash = digest.reduce(function(str, chr) {
    var byte = (chr < 0 ? chr + 256 : chr).toString(16);
    return str + (byte.length == 1 ? '0' : '') + byte;
  }, '');
  return hash;
}