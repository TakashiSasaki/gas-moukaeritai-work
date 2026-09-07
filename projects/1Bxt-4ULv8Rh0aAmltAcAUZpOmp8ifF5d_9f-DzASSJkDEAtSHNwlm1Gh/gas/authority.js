function authority() {
  return uri.authority();
}

function testAuthority(){
  parse("http://user:pass@example.org:88/foo/hello.html");
  Assert.equal(authority(), "user:pass@example.org:88");
  parse("urn:example:animal:ferret:nose");
  Logger.log(uri.toString());
  Logger.log(uri.path());
}
