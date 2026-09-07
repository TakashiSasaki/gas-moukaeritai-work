function test(){
  var x = new GmailThreadTable();
  x.query();
  Logger.log(x.asTable());
}
