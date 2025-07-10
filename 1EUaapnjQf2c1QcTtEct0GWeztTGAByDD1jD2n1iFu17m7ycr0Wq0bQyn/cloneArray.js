function cloneArray(array, itemToBePushed){
  if(!(array instanceof Array)) {
    throw "clonePush: not an instance of Array is given.";
  }//if
  var clonedArray = JSON.parse(JSON.stringify(array));
  if(itemToBePushed !== undefined){
    clonedArray.push(itemToBePushed);
  }
  return clonedArray;
}//cloneArray