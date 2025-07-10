function addText(form){
  if(form === undefined) form = getForm_();
  var textItem = form.addTextItem();
  var textItemId = textItem.getId();
  Logger.log(textItemId);
}

function getResponses(form){
  if(form === undefined) form = FormApp.getActiveForm();
  if(form === null) form = getForm_();
  var responses = form.getResponses();
  for(var i in responses) {
    var response = responses[i];
    var itemResponses = response.getItemResponses();
    for(var j in itemResponses) {
      var itemResponse = itemResponses[j];
      var responseText = itemResponse.getResponse();
      Logger.log(responseText);
      
    }
  }
}
