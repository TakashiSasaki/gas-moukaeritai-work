/**
  @param {string} uriReference URI reference string
  @param {string} baseUri Base URI string
  @return {string} Resolved URI string
*/
function resolve(uriReference, baseUri){
  uri = new URI(uriReference, baseUri);
  return uri.toString();
}//resolve
