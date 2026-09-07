/**
  asertEqual compares two values deeply and returns boolean;
  
  @param {any} x
  @param {any} y
  @param {boolean} throwIfNotEqual throws exception if it is set to true.
  @return {boolean}
*/

function isEqual(x,y, throwIfNotEqual){
  if(typeof x !== typeof y) 
    if(throwIfNotEqual) {
      throw typeof x + " !== " + typeof y;
    } else {
      return false;
    }
  switch(typeof x){
    case "boolean":
    case "number":
    case "string":
      if(x !== y) {
        if(throwIfNotEqual) {
          throw "" + x + " !== " + y;
        } else {
          return false;
        }  
      }
      break;
    case "object":
      if(x === null && y === null) return;
      if(x instanceof Array && !(y instanceof Array)) {
        if(throwIfNotEqual) {
          throw "Array != Object";
        } else {
          return false;
        }//if
      }//if
      if(!(x instanceof Array) && y instanceof Array) {
        if(throwIfNotEqual) {
          throw "Object != Array";
        } else {
          return false;
        }//if
      }//if
      var kx = Object.keys(x);
      var ky = Object.keys(y);
      kx.sort();
      ky.sort();
      var jkx = JSON.stringify(kx);
      var jky = JSON.stringify(ky);
      if(jkx !== jky) {
        if(throwIfNotEqual) {
          throw jkx + " !== " + jky;
        } else {
          return false;
        }//if
      }//if
      for(i in x){
        var b = isEqual(x[i], y[i], throwIfNotEqual);
        if(b === false) return false;
      }//for
  }//switch
  return true;
}//isEqual

/**
  isEqual compares two values deeply and throws exception if they differ.
  @param {any} x
  @param {any} y
*/
function assertEqual(x,y){
  isEqual(x,y,true);
}//assertEqual

function testAssertEqual1_(){
  assertEqual(1, 1);
  assertEqual(null, null);
  assertEqual([], []);
  assertEqual({}, {});
  assertEqual([1,2,3],[1.0,2.0,3.0]);
  assertEqual({"[]":[1,2,3]},{"[]":[1,2,3]});
  assertEqual([1,[2,3]],[1,[2,3]]);
  try{
    assertEqual([],{});
    throw "testAssertEqual: should not be in here.";
  } catch(e){
    Logger.log(e);
  }//catch
  try{
    assertEqual({},[]);
    throw "testAssertEqual: should not be in here.";
  } catch(e){
    Logger.log(e);
  }//catch
  
  assertEqual({a:1,b:1},{b:1,a:1});
  assertEqual([1,2,3],[1,2,3]);
  assertEqual(true, isEqual([1,2,3],[1,2,3]));
}//testAssertEqual

function testAssertEqualAll(){
  for(var i in this){
    if(typeof this[i] === "function") {
      if(this[i].name.match(/^testAssertEqual.*_/)){
        this[i].apply({});
      }//if
    }//if
  }//for
}//testAssertEqualAll
