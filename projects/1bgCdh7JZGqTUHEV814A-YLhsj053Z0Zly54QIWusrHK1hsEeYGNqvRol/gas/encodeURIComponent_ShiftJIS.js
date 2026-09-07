function encodeURIComponent_Shift_JIS(x) {
  var blob = Utilities.newBlob("", "text/plain");
  blob.setDataFromString(x, "Shift_JIS");
  Logger.log(blob.getBytes().length);
  var s = "";
  for(var i=0; i<blob.getBytes().length; ++i){
    var b = blob.getBytes()[i];
    var n = new Number(b);
    if(n<0) n+=256;
    Logger.log(n);
    var high = Math.floor(n/16);
    var low = Math.floor(n % 16);
    Logger.log(high);
    Logger.log(low);
    s += "%" + "0123456789ABCDEF".slice(high,high+1);
    s += "0123456789ABCDEF".slice(low,low+1);
  }
  Logger.log(s);
  return s;
}
