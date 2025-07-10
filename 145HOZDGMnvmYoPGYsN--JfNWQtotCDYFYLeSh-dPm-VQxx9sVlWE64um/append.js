Table_.prototype.append = function(o){
  if(Object.prototype.toString.call(o) === '[object Array]'){
    this.table.push(o);
    return this;
  } else if(typeof o === "object"){
    this.objects.push(o);
    return this;
  }//if
  throw "append: expects an instance of Array or Object";
}//append

/**
  @param {Array|Object} o
  @return {Table}
*/
function append(o){
  throw "append: to be called with an instance of Table";
}//append
