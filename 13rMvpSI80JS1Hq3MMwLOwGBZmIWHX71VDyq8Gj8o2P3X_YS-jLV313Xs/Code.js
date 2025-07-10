function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem("Extract Checkboxes", "extractCheckboxes")
      .addItem('About', 'about')
      .addItem('Debug', 'extract')
      .addToUi();
}//onOpen

function showSidebar() {
  var ui = DocumentApp.getUi();
  var htmlTemplate = HtmlService.createTemplateFromFile("sidebar");
  var htmlOutput = htmlTemplate.evaluate();
  ui.showSidebar(htmlOutput);
}//showSidebar

function saveTasks(){
  try{
    var existingItems = [];
    var title = CacheService.getDocumentCache().get("title");
    var taskList = Tasks.Tasklists.get(title);
    if(taskList !== null) {
    }
  } catch(e){
  }
}

function extract(){
  var template = HtmlService.createTemplateFromFile("extract");
  template.log = [];
  var document = DocumentApp.getActiveDocument();
  var name = document.getName();
  template.name = name;
  var body = document.getBody();
  var bodyNumChildren = body.getNumChildren();
  for(var i=0; i<bodyNumChildren; ++i){
    var child = body.getChild(i);
    if(child.getType() === DocumentApp.ElementType.PARAGRAPH) {
      var paragraph = child.asParagraph();
      template.log.push(paragraph.getType() + " " + paragraph.getText());
      for(var j=0; j<paragraph.getNumChildren(); ++j){
        var paragraphChild = paragraph.getChild(j);
        template.log.push(">" + paragraphChild.getType());
      }
    } else if (child.getType() === DocumentApp.ElementType.LIST_ITEM) {
      var listItem = child.asListItem();
      template.log.push(listItem.getType());
      for(var k=0; k<listItem.getNumChildren(); ++k){
        var listItemChild = listItem.getChild(k);
        if(listItemChild.getType() === DocumentApp.ElementType.TEXT) {
          template.log.push(">" + listItemChild.getType() + " " + listItemChild.asText().isStrikethrough() + " " + listItemChild.asText().getText());
        } else {
          template.log.push(">" + listItemChild.getType());
        }
      }
    } else {
      template.log.push(child.getType());
    }
  }
  var htmlOutput = template.evaluate();
  DocumentApp.getUi().showSidebar(htmlOutput);
}

function about(){
  var template = HtmlService.createTemplateFromFile("about");
  var output = template.evaluate();
  output.setTitle("About this add-on");
  DocumentApp.getUi().showSidebar(output);
}
