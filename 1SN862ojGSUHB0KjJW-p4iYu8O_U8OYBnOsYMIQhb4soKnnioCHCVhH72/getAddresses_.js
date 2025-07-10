/**
  @param {GmailThread} thread
  @return {Array} email addresses in the header of the thread
*/
function getAddresses(thread){
  var addresses = {};
  // thread = GmailApp.getThreadById(id)
  for(var i=0; i<thread.getMessageCount(); ++i){
    var message = thread.getMessages()[i];
    addresses[message.getBcc()] = null;
    addresses[message.getCc()] = null;
    addresses[message.getFrom()] = null;
    addresses[message.getTo()] = null;
  }//for
  return Object.keys(addresses);
}//getAddresses

function testGetAddresses(){
  var gmailThreads = GmailApp.getInboxThreads();
  var gmailThread = gmailThreads[0];
  var addresses = getAddresses_(gmailThread);
  Logger.log(addresses);
}