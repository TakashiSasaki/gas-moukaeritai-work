/**
  Test BASE64 encoding (RFC 4648)
  @param {String} base64String
  @param {Boolean} websafe, default is false
  @param {Boolean} nopad, default is false
  @return {Boolean}
*/
function base64(base64String, websafe, nopad) {
  if(websafe === undefined) websafe = false;
  if(nopad === undefined) nopad = false;
  if(typeof base64String !== "string") throw "isBase64: base64String should be a string.";
  //var regex = /[^-A-Za-z0-9+\/=]|=[^=]|={3,}$/;
  if(websafe) {
    if(nopad){
      return null !== base64String.match(/^[A-Za-z0-9+_-]*$/);
    } else {
      return null !== base64String.match(/^[A-Za-z0-9+_-]*={0,2}$/);
    }
  } else {
    if(nopad){
      return null !== base64String.match(/^[A-Za-z0-9+\/]*$/);
    } else {
      return null !== base64String.match(/^[A-Za-z0-9+\/]*={0,2}$/);
    }
  }
}//base64

base64.test = function(){
  var case1 = "ejJlQUVFSFpCcUpjVDNlWW5WcEd0QQ==";
  var result1 = base64(case1);
  if(result1 === false) throw "isBase64: false negative in case1.";
  var case2 = "a@exmpale.com";
  var result2 = base64(case2);
  if(result2 === true) throw "isBase64: false positive in case2.";
}//base64.test

function base64Test(){
  base64.test();

}//base64Test
