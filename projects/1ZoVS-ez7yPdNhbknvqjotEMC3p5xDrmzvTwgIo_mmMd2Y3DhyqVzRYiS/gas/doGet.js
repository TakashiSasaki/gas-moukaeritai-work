function doGet(e) {
  if (e.parameter.voting) {
    const htmlOutput = HtmlService.createTemplateFromFile("voting").evaluate();
    htmlOutput.addMetaTag("viewport", "width=device-width, initial-scale=1.0");
    return htmlOutput;
  } if (e.parameter.debug) {
    const htmlOutput = HtmlService.createTemplateFromFile("debug").evaluate();
    htmlOutput.addMetaTag("viewport", "width=device-width, initial-scale=1.0");
    return htmlOutput;
  } else {
    const htmlOutput = HtmlService.createTemplateFromFile("setting").evaluate();
    htmlOutput.addMetaTag("viewport", "width=device-width, initial-scale=1.0");
    return htmlOutput;
  }
}//doGet
