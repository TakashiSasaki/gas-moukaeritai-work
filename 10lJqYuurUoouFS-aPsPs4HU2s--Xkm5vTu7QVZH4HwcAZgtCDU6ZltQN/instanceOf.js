global = this;
/**
  @param {Object} obj
  @param {Function} constructor
  @return {Assert}
*/
function instanceOf(obj, constructor){
  isObject(obj);
  if(typeof constructor !== "function"){
    throw "instanceOf: not a function";
  }//if
  if(obj instanceof constructor) return global;
  throw "instanceOf: the object is not an instance of " + constructor.name;
}//instanceOf

instanceOf.test = function(){
  function MyClass(){return this;};
  var myClass = new MyClass();
  instanceOf(myClass, MyClass).instanceOf(myClass, MyClass);
}

function instanceOfTest(){
  instanceOf.test();
}
