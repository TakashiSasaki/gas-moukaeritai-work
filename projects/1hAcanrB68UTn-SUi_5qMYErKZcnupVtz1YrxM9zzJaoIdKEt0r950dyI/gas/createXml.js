
function createXmlDocument() {
  const xmlDocument = XmlService.createDocument();
  const svgElement = XmlService.createElement("svg");
  const namespace = XmlService.getNamespace("http://www.w3.org/2000/svg");
  svgElement.setNamespace(namespace);
  svgElement.setAttribute("version", "1.1");
  svgElement.setAttribute("width", "200px");
  svgElement.setAttribute("viewBox", "0 0 400 400");
  const imageElement = XmlService.createElement("image");
  imageElement.setNamespace(namespace);
  imageElement.setAttribute("href", getDataUrl());
  imageElement.setAttribute("width", "50");
  imageElement.setAttribute("height", "50");
  svgElement.addContent(imageElement);
  xmlDocument.addContent(svgElement);
  return xmlDocument;
}//createXmlDocument

function createXmlText(){
  const xmlDocument = createXmlDocument();
  const format = XmlService.getRawFormat();
  const text = format.format(xmlDocument);
  console.log(text);
  return text;
}//createXmlText