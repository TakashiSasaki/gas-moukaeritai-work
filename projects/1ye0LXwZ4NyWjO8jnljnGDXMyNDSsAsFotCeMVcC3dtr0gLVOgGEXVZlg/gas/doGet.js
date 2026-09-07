function doGet(e) {
  const htmlTemplate = HtmlService.createTemplateFromFile("index");
  if(!e.pathInfo) {
    htmlTemplate.clearNamespace = "defaultNamespace";
    htmlTemplate.hashedNamespace = calculateMD5(pepper + htmlTemplate.clearNamespace + pepper);
  } else {
    htmlTemplate.clearNamespace = e.pathInfo.split("/")[0];
    htmlTemplate.hashedNamespace = calculateMD5(pepper + htmlTemplate.clearNamespace + pepper);
  }
  const htmlOutput = htmlTemplate.evaluate();
  return htmlOutput;
}
