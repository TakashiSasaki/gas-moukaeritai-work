function doPost(e) {
  const htmlTemplate = HtmlService.createTemplateFromFile("index");
  if(!e.pathInfo) {
    htmlTempalte.hashedNamespace = calculateMD5("defaultNamespace");
  } else {
    htmlTemplate.hashedNamespace = calculateMD5(e.pathInfo.split("/")[0]);
  }
  const htmlOutput = htmlTemplate.evaluate();
  return htmlOutput;
}