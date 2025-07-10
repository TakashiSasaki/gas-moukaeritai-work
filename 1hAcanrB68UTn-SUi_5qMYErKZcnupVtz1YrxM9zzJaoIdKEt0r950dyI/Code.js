function doGet(e) {
  try {
    const format = e.parameter.format;
    switch (format) {
      case "svg":
      case "SVG":
        const svgContent = ContentService.createTextOutput(createXmlText());
        svgContent.setMimeType(ContentService.MimeType.XML);
        return svgContent;
      default:
        const htmlTemplate = HtmlService.createTemplateFromFile("index");
        htmlTemplate.e = e;
        const htmlOutput = htmlTemplate.evaluate();
        console.log(htmlOutput.getContent());
        return htmlOutput;
    }
  } catch (e) {
    const htmlTemplate = HtmlService.createTemplateFromFile("index");
    htmlTemplate.e = e;
    const htmlOutput = htmlTemplate.evaluate();
    console.log(htmlOutput.getContent());
    return htmlOutput;
  }
}//doGet

//https://script.google.com/macros/s/AKfycbx-VSmL2tjiKQgAUSBSsBQoSjl0xfZBxMtp5VQbdFWyGvQu3Zo/exec
//https://script.google.com/macros/s/AKfycbwdJ92698TcK9c2q9gV5xrI-JVdQ2vUbHyQVrSiJTc/dev
//パラメータとして ?a=b&a=cと書くとbもcも渡される。
//parametersには文字列のリストとして渡される。
//parameterには最初のパラメータbだけが渡される。
//{"contentLength":-1,"parameters":{"a":["b","c"]},"parameter":{"a":"b"},"queryString":"a=b&a=c","contextPath":""}
//devの後に/a/bを付け加えるとpathInfoとして a/b が渡される。
//{"contentLength":-1,"parameter":{},"contextPath":"","parameters":{},"queryString":"","pathInfo":"a/b"}

function getDataUrl() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile("redDot");
  //console.log(htmlOutput.getContent());
  const xml = XmlService.parse(htmlOutput.getContent());
  const src = xml.getRootElement().getAttribute("src").getValue();
  //data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==
  //console.log(src);
  //const base64 = src.replace(/[ \r\n\t]*/, "").split(",")[1];
  //console.log(base64);
  //const binaryString = Utilities.base64Decode(base64);
  return src;
}//getDataUrl
