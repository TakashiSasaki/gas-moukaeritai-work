function computeBase64Length(bits){
  var bytes = Math.ceil(bits/8);
  var tripleBytes = Math.ceil(bytes/3);
  var base64Length = tripleBytes * 4;
  return base64Length;
}

computeBase64Length.test = function(){
  var base64Length = computeBase64Length(256);
  Assert.equalNumbers(base64Length, 44);
}//computeBase64Length.test

function computeBase64LengthTest(){
  computeBase64Length.test();
}
