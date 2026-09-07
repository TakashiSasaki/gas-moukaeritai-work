function test() {

	var hello = require("hello");  
	Logger.log("typeof hello = " + typeof hello);
	hello.hello();

	var goodbye = require("goodbye");
	Logger.log("typeof goodbye = " + typeof goodbye);
	goodbye.goodbye();

	var assert = require("myassert");
	assert.isString("abc");

}//test

