function getThreadsByLabelId(labelId, nMaxThreads){
  if(labelId === undefined) labelId = "INBOX";
  if(nMaxThreads === undefined) nMaxThreads = 10;
  var email = Session.getActiveUser().getEmail();
  var threads = Gmail.Users.Threads.list(email, {labelIds:[labelId], maxResults:nMaxThreads}).threads;
  var result = threads.reduce(function(rows, thread){
    // thread = threads[0];
    //var firstMessage = thread.messages[0];
    //var firstMessageSubject = firstMessage.payload.headers["Subject"];
    //var firstMessageDate = firstMessage.payload.headers["Date"];
    //var firstMessageInternalDate = firstMessage.internalDate;
    //var lastMessage = thread.messages[thread.messages.length-1];
    //var lastMessageSubject = lastMessage.payload.headers["Subject"];
    //var lastMessageDate = lastMessage.payload.headers["Date"];
    //var lastMessageInternalDate = lastMessage.internalDate;
    var row = [];
    row.push(thread.id);
    row.push(thread.snippet);
    //row.push(firstMessageSubject);
    //row.push(lastMessageDate);
    rows.push(row);
    return rows;
  }, [["threadId", "snippet"]]);
  return result;
}//getThreadsByLabelId
