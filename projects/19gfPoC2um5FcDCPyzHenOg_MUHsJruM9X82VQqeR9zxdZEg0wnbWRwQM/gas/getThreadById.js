function getThreadById(threadId){
  var json = CacheService.getUserCache().get(threadId);
  if(typeof json === "string") {
    var object = JSON.parse(json);
    return object;
  } else {
    var thread = Gmail.Users.Threads.get(Session.getActiveUser().getEmail(), threadId);
    if(thread.messages.length >= 3) {
      thread.messages = [thread.messages[0], thread.messages[thread.messages.length-1]];
    }
    for(var i=0; i<thread.messages.length; ++i) {
      thread.messages[i].raw = null;
      thread.messages[i].payload.parts = null;
      thread.messages[i].payload.body = null;
      for(var j=0; j<thread.messages[i].payload.headers.length; ++j){
        var header = thread.messages[i].payload.headers[j];
        if(header.name==="Received") header.value = null;
        if(header.name==="DKIM-Signature") header.value = null;
        if(header.name==="ARC-Seal") header.value = null;
        if(header.name==="Authentication-Results") header.value = null;
        if(header.name==="Received-SPF") header.value = null;
        if(header.name.match(/^[xX]-.*$/)) header.value = null;
        if(header.name.match(/^ARC-.*$/)) header.value = null;
        if(header.name.match(/.*[Mm]icrosoft.*$/)) header.value = null;
      }//for j
    }//for i
    var json = JSON.stringify(thread);
    var jsonLength = json.length;
    try {
      CacheService.getUserCache().put(threadId, json, 21600);
    } catch(e){
      CacheService.getUserCache().remove(threadId);
    }
    return thread;
  }
}//getThreadById
