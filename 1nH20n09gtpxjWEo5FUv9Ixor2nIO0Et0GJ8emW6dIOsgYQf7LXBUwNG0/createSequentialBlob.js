/*
  @param {Number} start
  @param {Number} end
  @return {Blob}
*/
function createNumberSequenceBlob(start, end){
  if(start === undefined) start = -128;
  if(end === undefined) end = 127;
  var array = [];
  for(var i=start; i<=end; ++i){
    array.push(i);
  }//for
  var blob = Utilities.newBlob(array);
  return blob;
}

createNumberSequenceBlob.test = function(){
  var blob = createNumberSequenceBlob();
  //blob = Utilities.newBlob(data)
  var bytes = blob.getBytes();
  var max = Random.max(bytes);
  var min = Random.min(bytes);
  Logger.log("createNumberSequenceBlob.test : " + {max: max, min: min});
}
