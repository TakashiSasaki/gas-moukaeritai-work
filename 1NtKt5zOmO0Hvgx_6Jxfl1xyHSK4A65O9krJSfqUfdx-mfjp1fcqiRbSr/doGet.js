"use strict";

function doGet(e) {
  if(typeof e.parameter.test !== "undefined"){
    return ContentService.createTextOutput(test());
  }//if
  var htmlTemplate = HtmlService.createTemplateFromFile("index");
  var htmlOutput = htmlTemplate.evaluate().setTitle("Random");
  return htmlOutput;
}//doGet
