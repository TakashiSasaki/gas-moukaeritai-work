/**
 * File: Code.gs
 * Description: Backend script for Markdown2Docs web app.
 */

/**
 * Serves the HTML page to the client.
 */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Markdown2Docs')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setSandboxMode(HtmlService.SandboxMode.NATIVE)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}


/**
 * Receives markdown text and a document title from the web form, creates a new document,
 * converts Markdown content, and returns the document URL.
 */
function convertMarkdownAndCreateDoc(markdown, title) {
  var doc = DocumentApp.create(title);
  convertMarkdownToGoogleDocExtended(markdown, doc);
  return doc.getUrl();
}
