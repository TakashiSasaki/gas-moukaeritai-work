function groupByHeadingOrBlank(children) {
  for (var i = 0; i < children.length; ++i) {
    if (children[i].level === undefined) continue;
    children[i].groupByHeadingOrBlank = i;
    var j = i + 1;
    for (; j < children.length; ++j) {
      if (children[j].type === DocumentApp.ElementType.PARAGRAPH.toString()) {
        if (children[j].nChildren === 0 || children[j].level !== undefined) {
          i = j - 1;
          break;
        }//if
      }//if
      children[j].groupByHeadingOrBlank = i;
      continue;
    }//for j
  }//for i
}//groupByHeadingOrBlank


function groupByHeading(children) {
  for (var i = 0; i < children.length; ++i) {
    if (children[i].level === undefined) continue;
    children[i].groupByHeading = i;
    var j = i + 1;
    for (; j < children.length; ++j) {
      if (children[j].level !== undefined) {
        i = j - 1;
        break;
      }//if
      children[j].groupByHeading = i;
    }//for j
  }//for i
}//groupByHeading



