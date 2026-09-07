function getBodyChildren() {
  const body = DocumentApp.getActiveDocument().getBody();
  const a = [];
  for (var i = 0; i < body.getNumChildren(); ++i) {
    const child = body.getChild(i);
    const o = {
      index: i,
      type: child.getType().toString()
    }
    //special care for List, Table and Paragraph type children
    switch (child.getType().toString()) {
      case DocumentApp.ElementType.LIST_ITEM.toString():
        o.text = child.asListItem().getText();
        countChildrenTypes(child.asListItem(), o);
        break;
      case DocumentApp.ElementType.TABLE.toString():
        o.text = child.asTable().getText();
        countChildrenTypes(child.asTable(), o);
        break;
      case DocumentApp.ElementType.PARAGRAPH.toString():
        o.text = child.asParagraph().getText();
        countChildrenTypes(child.asParagraph(), o);
        inspectHeading(child.asParagraph(), o);
        break;
    }//switch
    a.push(o);
  }//for
  return a;
}//getBodyChildren
