# Understanding Third Party Cookie

## Overview

The "Understanding Third Party Cookie" project is a Google Apps Script web application. Its primary purpose seems to be to demonstrate or explore concepts related to third-party cookies, possibly by serving different content types (HTML or SVG) based on request parameters. The application can display request parameters in an HTML format or generate an SVG image that includes a base64 encoded red dot.

## Functionality

The project's core functionality revolves around its `doGet` web app entry point, which dynamically serves content based on the request.

### Core Features

-   **`doGet(e)`:** This function acts as the main request handler for the web application.
    -   If the `format` parameter in the URL is "svg" (case-insensitive), it generates and returns an SVG image containing a red dot.
    -   For any other request, it serves an HTML page (`index.html`) that displays the incoming request parameters (`e` object) in a readable JSON format.
-   **`createXmlDocument()`:** Constructs an XML document representing an SVG image. It embeds a base64 encoded red dot image within the SVG.
-   **`createXmlText()`:** Converts the SVG XML document created by `createXmlDocument()` into a formatted XML string.
-   **`getDataUrl()`:** Extracts the base64 encoded image data URL from `redDot.html`.

### Code Examples

#### `Code.js`

```javascript
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
```

#### `createXml.js`

```javascript
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
```

#### `redDot.html`

```html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==" alt="Red dot"/>
```

## Permissions

The `appsscript.json` file indicates that this project runs as a web application, executing as the user who deployed it, and is accessible by anyone anonymously.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {},
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Deployments

The project has three deployments:

-   **ID (HEAD):** `AKfycbwdJ92698TcK9c2q9gV5xrI-JVdQ2vUbHyQVrSiJTc`
    -   **URL:** `https://script.google.com/macros/s/AKfycbwdJ92698TcK9c2q9gV5xrI-JVdQ2vUbHyQVrSiJTc/exec`
-   **ID (Version 1 - web app meta-version):** `AKfycbx-VSmL2tjiKQgAUSBSsBQoSjl0xfZBxMtp5VQbdFWyGvQu3Zo`
    -   **URL:** `https://script.google.com/macros/s/AKfycbx-VSmL2tjiKQgAUSBSsBQoSjl0xfZBxMtp5VQbdFWyGvQu3Zo/exec`
-   **ID (Version 2 - 認証なしで):** `AKfycbyMoLCtO1fY2gbX1sFdWQcOJCqIvQqggtsUP9stSvZxIRBREx4DemFnvGy8eEynCBgy`
    -   **URL:** `https://script.google.com/macros/s/AKfycbyMoLCtO1fY2gbX1sFdWQcOJCqIvQqggtsUP9stSvZxIRBREx4DemFnvGy8eEynCBgy/exec`
