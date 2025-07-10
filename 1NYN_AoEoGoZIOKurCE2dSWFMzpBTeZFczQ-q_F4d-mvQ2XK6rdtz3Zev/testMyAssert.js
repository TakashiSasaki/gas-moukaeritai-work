console.log("testMyAssert");
if(typeof assert === "undefined") require("myassert");

assert.isString("abc");
assert.isObject({});
assert.isStringArray(["ab", "cd"]);


