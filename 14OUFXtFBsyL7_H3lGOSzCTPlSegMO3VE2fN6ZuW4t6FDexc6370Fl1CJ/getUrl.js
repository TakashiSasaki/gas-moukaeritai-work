/*
  @param {string} "exec" or "dev"
  @return {string}
*/
function getUrl(execOrDev) {
  if(execOrDev === "dev") {
    return "https://script.google.com/macros/s/AKfycbz2BbGaug7HXHvK3clmNrqntzvBG2xFm32O0KZDNHc/dev";
  }
  if(execOrDev === "exec") {
    return ScriptApp.getService().getUrl();
  }
  throw "getUrl: only exec or dev is allowed.";
}//getUrl
