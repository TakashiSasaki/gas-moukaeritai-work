function DOCS(callbackFunctionName){
  return buttonElement_('DOCS', callbackFunctionName);
}

function DOCS_IMAGES(callbackFunctionName){
  return buttonElement_('DOCS_IMAGES', callbackFunctionName);
}

function DOCS_IMAGES_AND_VIDEOS(callbackFunctionName){
  return buttonElement_('DOCS_IMAGES_AND_VIDEOS', callbackFunctionName);
}

function DOCS_VIDEOS(callbackFunctionName){
  return buttonElement_('DOCS_VIDEOS', callbackFunctionName);
}

function DOCUMENTS(callbackFunctionName){
  return buttonElement_('DOCUMENTS', callbackFunctionName);
}

function DRAWINGS(callbackFunctionName){
  return buttonElement_('DRAWINGS', callbackFunctionName);
}

function FOLDERS(callbackFunctionName){
  return buttonElement_('FOLDERS', callbackFunctionName);
}

function FORMS(callbackFunctionName){
  return buttonElement_('FORMS', callbackFunctionName);
}

function IMAGE_SEARCH(callbackFunctionName){
  return buttonElement_('IMAGE_SEARCH', callbackFunctionName);
}

function PDFS(callbackFunctionName){
  return buttonElement_('PDFS', callbackFunctionName);
}

function PHOTO_ALBUMS(callbackFunctionName){
  return buttonElement_('PHOTO_ALBUMS', callbackFunctionName);
}

function PHOTO_UPLOAD(callbackFunctionName){
  return buttonElement_('PHOTO_UPLOAD', callbackFunctionName);
}

function PHOTOS(callbackFunctionName){
  return buttonElement_('PHOTOS', callbackFunctionName);
}

function PRESENTATIONS(callbackFunctionName){
  return buttonElement_('PRESENTATIONS', callbackFunctionName);
}

function RECENTLY_PICKED(callbackFunctionName){
  return buttonElement_('RECENTLY_PICKED', callbackFunctionName);
}

function SPREADSHEETS(callbackFunctionName){
  return buttonElement_('SPREADSHEETS', callbackFunctionName);
}

function VIDEO_SEARCH(callbackFunctionName){
  return buttonElement_('VIDEO_SEARCH', callbackFunctionName);
}

function WEBCAM(callbackFunctionName){
  return buttonElement_('WEBCAM', callbackFunctionName);
}

function YOUTUBE(callbackFunctionName){
  return buttonElement_('YOUTUBE', callbackFunctionName);
}

function buttonElement_(viewName, callbackFunctionName) {
  var button = '<button onclick="(new FilePicker()).'+ viewName +'(' + callbackFunctionName + ');">pick ' + viewName + '</button>';
  return button;
}
