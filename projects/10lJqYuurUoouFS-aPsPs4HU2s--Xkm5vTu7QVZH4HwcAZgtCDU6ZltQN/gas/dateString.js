/**
  @param {String} dateString
  @return {void}
*/
function dateString(dateString){
  if(typeof dateString !== "string") {
    throw "dateString: not a string";
  }//if
  var dateRegEx = /^\d{4}([-](\d{2})([-]\d{2})?)?$/;
  if(dateString.match(dateRegEx) === null) {
    throw "dateString: not a date string";
  }//if
}//dateString