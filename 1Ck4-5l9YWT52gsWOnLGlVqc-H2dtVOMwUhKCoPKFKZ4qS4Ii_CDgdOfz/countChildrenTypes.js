function countChildrenTypes(element, result) {
  result.nInlineImage = 0;
  result.nTable = 0;
  result.nListItem = 0;
  result.nInlineDrawing = 0;
  result.nText = 0;
  result.nOther = 0;
  result.nChildren = element.getNumChildren();
  for (var i = 0; i < result.nChildren; ++i) {
    const child = element.getChild(i);
    switch (child.getType().toString()) {
      case DocumentApp.ElementType.INLINE_IMAGE.toString():
        result.nInlineImage += 1;
        break;
      case DocumentApp.ElementType.TABLE.toString():
        result.nTable += 1;
        break;
      case DocumentApp.ElementType.LIST_ITEM.toString():
        result.nListItem += 1;
        break;
      case DocumentApp.ElementType.INLINE_DRAWING.toString():
        result.nInlineDrawing += 1;
        break;
      case DocumentApp.ElementType.TEXT.toString():
        result.nText += 1;
        break;
      default:
        result.nOther += 1;
        break;
    }//switch
  }//for
}//countChildrenTypes
