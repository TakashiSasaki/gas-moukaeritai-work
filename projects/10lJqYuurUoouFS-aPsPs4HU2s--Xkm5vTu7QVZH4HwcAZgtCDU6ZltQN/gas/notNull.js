global = this;
/**
  @param {Any} any
  @return {Assert}
*/
function notNull(o) {
  if(o === null) {
    throw "notNull: null object.";
  }//if
  return global;
}//notNull

notNull.test = function(){
  notNull({}).notNull(new Array()).notNull(new Date());
}//notNull.test

function notNullTest(){
  notNull.test();
}
