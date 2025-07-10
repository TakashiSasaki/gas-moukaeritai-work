/**
  @param {Date} d a Date object
  @return {void}
*/
function dateObject(d) {
  if(typeof d !== "object") {
    throw "dateObject: not a Date object.";
  }//if
  if(Object.prototype.toString.call(d) !== "[object Date]") {
    throw "dateObject: not a Date object.";    
  }//if
}//dateObject

dateObject.test = function(){
  var d = new Date();
  dateObject(d);
}

function dateObjectTest(){
  dateObject.test();
}
