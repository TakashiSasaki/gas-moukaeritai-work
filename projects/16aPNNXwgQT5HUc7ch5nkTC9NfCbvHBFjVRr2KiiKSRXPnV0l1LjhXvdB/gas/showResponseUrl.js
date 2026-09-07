function showResponseUrl() {
  var responseUrl = getResponseUrl();
  var ui = FormApp.getUi();
  ui.alert("response url", responseUrl, ui.ButtonSet.OK);
}

function getResponseUrl(form){
  if(form === undefined) form = FormApp.getActiveForm();
  if(form === null) form = getForm_();
  var publishedUrl = form.getPublishedUrl();
  var responseUrl = publishedUrl.replace("viewform","formResponse");
  return responseUrl;
}