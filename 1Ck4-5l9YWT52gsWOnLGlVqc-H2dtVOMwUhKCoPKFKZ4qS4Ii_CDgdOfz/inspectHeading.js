/**
  @param {Paragraph} paragraph
  @param {Object} result
*/
function inspectHeading(paragraph, result){
    if(paragraph.getType().toString() !== DocumentApp.ElementType.PARAGRAPH.toString()) 
      throw ("inspectHeading expects a paragraph.");
    switch (paragraph.getHeading().toString()) {
      case DocumentApp.ParagraphHeading.HEADING1.toString():
        result.level = 1;
        result.leader = ">"
        break;
      case DocumentApp.ParagraphHeading.HEADING2.toString():
        result.level = 2;
        result.leader = ">>";
        break;
      case DocumentApp.ParagraphHeading.HEADING3.toString():
        result.level = 3;
        result.leader = ">>>";
        break;
      case DocumentApp.ParagraphHeading.HEADING4.toString():
        result.level = 4;
        result.leader = ">>>>";
        break;
      case DocumentApp.ParagraphHeading.HEADING5.toString():
        result.level = 5;
        result.leader = ">>>>>";
        break;
      case DocumentApp.ParagraphHeading.HEADING6.toString():
        result.level = 6;
        result.leader = ">>>>>>";
        break;
    }//switch
}//inspectHeading
