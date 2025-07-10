/**
  @param {GmailThread}
  @return {Object}
*/
function cache(gmailThread){
  // gmailThread = GmailApp.getThreadById(id);
  var id = gmailThread.getId();
  var mutableJsonString = CacheService.getScriptCache().get(id+"-mutable");
  var immutableJsonString = CacheService.getScriptCache().get(id+"-immutable");
  
  if(typeof mutableJsonString === "string" && typeof immutableJsonString === "string"){
    var mutable = JSON.parse(mutableJsonString);
    var immutable = JSON.parse(immutableJsonString);
    for(var i in mutable){
      immutable[i] = mutable[i];
    }//for
    return immutable;
  }//if
  
  var immutable = {
    "id" : gmailThread.getId(),
    "firstMessageSubject": gmailThread.getFirstMessageSubject(),
    "lastMessageDate": gmailThread.getLastMessageDate(),
    "firstMessageBody": gmailThread.getMessages()[0].getBody().substr(0,10000),
    "lastMessageBody":gmailThread.getMessages()[gmailThread.getMessageCount()-1].getBody().substr(0,10000),
    "addresses": getAddresses(gmailThread)
  };
  var mutable = {
    "isImportant": gmailThread.isImportant(),
    "isInInbox": gmailThread.isInInbox(),
    "isInPriorityInbox": gmailThread.isInPriorityInbox()
  };
  CacheService.getScriptCache().put(id+"-immutable", JSON.stringify(immutable), 60);
  CacheService.getScriptCache().put(id+"-mutable", JSON.stringify(mutable), 60);
  
  for(var i in mutable){
    immutable[i] = mutable[i];
  }//for
  return immutable;
}//cache
