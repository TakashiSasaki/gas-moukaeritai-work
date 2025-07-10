/**
  @return {Blob}
*/
function createKonnnichiwaBlob() {
  var blob = Utilities.newBlob("");
  blob.setDataFromString("こんにちは", "UTF-8");
  return blob;
}//createKonnnichiwaBlob

createKonnnichiwaBlob.test = function(){
  var blob = createKonnnichiwaBlob();
  //blob = Utilities.newBlob(data);
  var s = blob.getDataAsString();
  assertEqual(s, "こんにちは");
}
