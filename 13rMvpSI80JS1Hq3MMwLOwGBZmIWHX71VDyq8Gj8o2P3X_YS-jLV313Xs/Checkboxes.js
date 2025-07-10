function extractCheckboxes(){
  var template = HtmlService.createTemplateFromFile("tasks");
  template.uncheckedTasks = [];
  template.checkedTasks = [];
  template.title = DocumentApp.getActiveDocument().getName();
  var body = DocumentApp.getActiveDocument().getBody();
  for(var i=0; i<body.getNumChildren(); ++i){
    if(body.getChild(i).getType() === DocumentApp.ElementType.LIST_ITEM){
      var listItem = body.getChild(i).asListItem();
      var text = listItem.getChild(0).asText();
      if(text.isStrikethrough() === true){
        template.checkedTasks.push(text.getText());
      } else {
        template.uncheckedTasks.push(text.getText());
      }//if
    }//if
  }//for
  CacheService.getDocumentCache().put("title", template.title);
  CacheService.getDocumentCache().put("checkedTasks", JSON.stringify(template.checkedTasks));
  CacheService.getDocumentCache().put("uncheckedTasks", JSON.stringify(template.uncheckedTasks));
  DocumentApp.getUi().showSidebar(template.evaluate().setTitle("Extracted tasks"));
}//extractCheckboxes