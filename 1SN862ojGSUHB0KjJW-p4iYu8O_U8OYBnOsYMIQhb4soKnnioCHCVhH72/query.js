/**
  @param {String} queryString
  @param {Number} max
*/
function query(queryString, max){
  throw "query: use createGmailThreadTable first";
}//query

GmailThreadTable.prototype.query = function(queryString, max){
  if(queryString === undefined) {
    queryString = "is:important";
  }
  if(max === undefined){
    max = 10;
  }
  var gmailThreads = GmailApp.search(queryString, 0, max);
  for(var i in gmailThreads){
    var gmailThread = gmailThreads[i];
    var o =  cache(gmailThread);
    this.append(o);
  }//for
}//query
