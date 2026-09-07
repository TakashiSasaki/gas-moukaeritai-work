function StringEx_(x){
  if(x === undefined) {
    this.string = "";
  } else {
    this.string = x;
  }
}//StringEx

StringEx_.prototype.toString = function (){
  return this.string;
}//toString

/**
  @return {string}
*/
function toString(){
  throw "toString: create an instance first.";
}

/**
  @param {stirng?}
  @return {StringEx}
*/
function create(s){
  return new StringEx_(s);
}//create

/**
  @param {Number} beginCodepoint
  @param {Number} endCodepoint
  @return {StringEx}
*/
function createSequence(beginCodepoint, endCodepoint){
  var s = "";
  for(var i=beginCodepoint; i<=endCodepoint; ++i){
    s+=String.prototype.fromCharCode(i);
  }//for
  return create(s);
}//createSequence

function testStringEx(){
  var string = new String("123");
  Logger.log(string);
  var stringEx = new StringEx_("abc");
  Logger.log(stringEx);
  Logger.log(stringEx.toString());
}