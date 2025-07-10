function onInstall() {
  reloadAddonMenu();
}

function onOpen() {
  reloadAddonMenu();
}

function reloadAddonMenu() {
  const ui = DocumentApp.getUi();
  ui.createAddonMenu()
    .addItem("reloadAddonMenu", "reloadAddonMenu")
    .addItem("showChildren", "showChildren")
    .addItem("showGroups", "showGroups")
    .addToUi();
}

function showChildren() {
  const htmlOutput = HtmlService.createTemplateFromFile("showChildren").evaluate();
  htmlOutput.setTitle("Docs Headings Addon");
  const ui = DocumentApp.getUi();
  ui.showSidebar(htmlOutput);
}//showChildren

function showGroups(){
  const htmlOutput = HtmlService.createTemplateFromFile("showGroups").evaluate();
  htmlOutput.setTitle("Docs Headings Addon");
  const ui = DocumentApp.getUi();
  ui.showSidebar(htmlOutput);
}//showGroups

function scanBodyChildren() {
  //var headings = getHeadings();
  bodyChildren = getBodyChildren();
  groupByHeading(bodyChildren);
  groupByHeadingOrBlank(bodyChildren);
  extractNumbers(bodyChildren);
  return bodyChildren;
}//scanBodyChildren


function getHeadings() {
  const document = DocumentApp.getActiveDocument();
  const paragraphs = document.getBody().getParagraphs();
  const headings = [];
  for (var i = 0; i < paragraphs.length; ++i) {
    const paragraph = paragraphs[i];
    const heading = {
      index: i,
      text: paragraph.getText()
    };
    countChildrenTypes(paragraph, heading);
    switch (paragraph.getHeading().toString()) {
      case DocumentApp.ParagraphHeading.HEADING1.toString():
        heading.level = 1;
        heading.leader = ">"
        break;
      case DocumentApp.ParagraphHeading.HEADING2.toString():
        heading.level = 2;
        heading.leader = ">>";
        break;
      case DocumentApp.ParagraphHeading.HEADING3.toString():
        heading.level = 3;
        heading.leader = ">>>";
        break;
      case DocumentApp.ParagraphHeading.HEADING4.toString():
        heading.level = 4;
        heading.leader = ">>>>";
        break;
      case DocumentApp.ParagraphHeading.HEADING5.toString():
        heading.level = 5;
        heading.leader = ">>>>>";
        break;
      case DocumentApp.ParagraphHeading.HEADING6.toString():
        heading.level = 6;
        heading.leader = ">>>>>>";
        break;
      case DocumentApp.ParagraphHeading.TITLE.toString():
        heading.level = 0;
        break;
      case DocumentApp.ParagraphHeading.SUBTITLE.toString():
        heading.level = 0.5;
        break;
      case DocumentApp.ParagraphHeading.NORMAL.toString():
        heading.level = -1;
        break;
      default:
        heading.level = -2;
        break;
    }//switch
    headings.push(heading);
  }//for

  return headings;
}//getHeadings

