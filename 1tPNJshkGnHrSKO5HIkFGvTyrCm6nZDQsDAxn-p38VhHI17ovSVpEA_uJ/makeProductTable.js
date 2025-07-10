productTable = undefined;

function makeProductTable() {
  if(productTable !== undefined){
    return productTable;
  }
  if(CacheService.getScriptCache().get("productTable")!== null){
    return JSON.parse(CacheService.getScriptCache().get("productTable"));
  }
  for(var first=0; first<16; ++first) {
    for(var second=0; second<16; ++second) {
      var firstHex = intToHexTable[first];
      var secondHex = intToHexTable[second];
      // [[a11,a21],[a12,a22]]
      var a11 = first & 8 ? 1 : 0;
      var a12 = first & 4 ? 1 : 0;
      var a21 = first & 2 ? 1 : 0;
      var a22 = first & 1 ? 1 : 0;
      var b11 = second & 8 ? 1 : 0;
      var b12 = second & 4 ? 1 : 0;
      var b21 = second & 2 ? 1 : 0;
      var b22 = second & 1 ? 1 : 0;
      var a = [[a11,a12],[a21,a22]];
      var b = [[b11,b12],[b21,b22]];
      var c11 = (a11 & b11) ^ (a12 & b21);
      var c12 = (a11 & b12) ^ (a12 & b22);
      var c21 = (a21 & b11) ^ (a22 & b21);
      var c22 = (a21 & b12) ^ (a22 & b22);
      var c = [[c11, c12], [c21, c22]];
      var c4bit = c11 << 3 | c12 << 2 | c21 << 1 | c22;
      var cHex = intToHexTable[c4bit];
      if(productTable === undefined) {
        productTable = {};
      }
      if(productTable[firstHex] === undefined) {
        productTable[firstHex] = {};
      }
      if(productTable[firstHex.toUpperCase()] === undefined) {
        productTable[firstHex.toUpperCase()] = {};
      }
      productTable[firstHex][secondHex] = cHex;
      productTable[firstHex.toUpperCase()][secondHex] = cHex;
      productTable[firstHex][secondHex.toUpperCase()] = cHex;
      productTable[firstHex.toUpperCase()][secondHex.toUpperCase()] = cHex;
    }
  }
  CacheService.getScriptCache().put("productTable", JSON.stringify(productTable));
  return productTable;
}
