function GmailThreadTable(){
  var parentConstructor = Table.getConstructor();
  parentConstructor.call(this, [
      "id", 
      "isImportant", "isInInbox", "isInPriorityInbox", 
      "firstMessageSubject", "lastMessageDate", "firstMessageBody", 
      "lastMessageBody", "addresses"
  ]);
}//GmailThreadTable


// GmailThreadTable inherits Table
GmailThreadTable.prototype = Object.create(Table.getConstructor().prototype,
  {
    constructor: {
      value: GmailThreadTable,
      enumerable: false,
      writable: true,
      configurable: true
    }//constructor
  });
