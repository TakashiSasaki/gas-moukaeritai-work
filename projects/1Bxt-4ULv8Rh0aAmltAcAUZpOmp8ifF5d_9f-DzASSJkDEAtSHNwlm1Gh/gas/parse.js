/**
  @param {string} uriString URI reference string
  @return {URI} URI object
*/
function parse(uriString){
  uri = new URI(uriString);
  return uri;
}//parse
