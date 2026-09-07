function test(){
  Assert.equal(1.23, 1.23);
  Assert.equal(resolve("g" , "http://a/b/c/d;p?q"), "http://a/b/c/g");
  Assert.equal(resolve("./g" , "http://a/b/c/d;p?q"), "http://a/b/c/g");
  Assert.equal(resolve("g/" , "http://a/b/c/d;p?q"), "http://a/b/c/g/");
  Assert.equal(resolve("/g" , "http://a/b/c/d;p?q"), "http://a/g");
  //Assert.equal((new URI("//g" , "http://a/b/c/d;p?q"), "http://g");
  Logger.log((new URI("//g" , "http://a/b/c/d;p?q")).toString());
  Assert.equal(resolve("?y" , "http://a/b/c/d;p?q"), "http://a/b/c/d;p?y");
  Assert.equal(resolve("g?y" , "http://a/b/c/d;p?q"), "http://a/b/c/g?y");
  Assert.equal(resolve("#s" , "http://a/b/c/d;p?q"), "http://a/b/c/d;p?q#s");
  Assert.equal(resolve("g#s" , "http://a/b/c/d;p?q"), "http://a/b/c/g#s");
  Assert.equal(resolve("g?y#s" , "http://a/b/c/d;p?q"), "http://a/b/c/g?y#s");
  Assert.equal(resolve(";x" , "http://a/b/c/d;p?q"), "http://a/b/c/;x");
  Assert.equal(resolve("g;x" , "http://a/b/c/d;p?q"), "http://a/b/c/g;x");
  Assert.equal(resolve("g;x?y#s" , "http://a/b/c/d;p?q"), "http://a/b/c/g;x?y#s");
  Assert.equal(resolve("" , "http://a/b/c/d;p?q"), "http://a/b/c/d;p?q");
  Assert.equal(resolve("." , "http://a/b/c/d;p?q"), "http://a/b/c/");
  Assert.equal(resolve("./" , "http://a/b/c/d;p?q"), "http://a/b/c/");
  Assert.equal(resolve(".." , "http://a/b/c/d;p?q"), "http://a/b/");
  Assert.equal(resolve("../" , "http://a/b/c/d;p?q"), "http://a/b/");
  Assert.equal(resolve("../g" , "http://a/b/c/d;p?q"), "http://a/b/g");
  Assert.equal(resolve("../.." , "http://a/b/c/d;p?q"), "http://a/");
  Assert.equal(resolve("../../" , "http://a/b/c/d;p?q"), "http://a/");
  Assert.equal(resolve("../../g" , "http://a/b/c/d;p?q"), "http://a/g");
}//test

var uri;
