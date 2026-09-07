function getThreadIdsByLabelId(labelId, nMaxThreads){
  if(labelId === undefined) labelId = "INBOX";
  if(nMaxThreads === undefined) nMaxThreads = 10;
  var email = Session.getActiveUser().getEmail();
  var threads = Gmail.Users.Threads.list(email, {labelIds:[labelId], maxResults:nMaxThreads}).threads;
  var threadIds = threads.reduce(function(acc, cur){
    return acc.concat([cur.id]);
  }, []);
  return threadIds;
}// getThreadIdsByLabelId
