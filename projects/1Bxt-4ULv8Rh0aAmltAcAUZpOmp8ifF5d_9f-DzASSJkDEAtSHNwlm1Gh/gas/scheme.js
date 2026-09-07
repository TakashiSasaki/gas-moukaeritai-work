/**
  scheme returns the scheme part of the URI.
  It does not change the case.
  @return {string} scheme part of the URI
*/
function scheme() {
  return uri.scheme();
}

function testScheme(){
  parse("pRoToCoL://host/path");
  console.log(scheme());
}
