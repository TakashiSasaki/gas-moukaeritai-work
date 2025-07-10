async function parse(uint8Array) {
  if (typeof uint8Array === "undefined") uint8Array = SAMPLE4;
  const md5 = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, uint8Array));
  console.log(md5);
  const cache = CacheService.getUserCache();
  
  const pdfDocumentProxy = await pdfjsLib.getDocument({
    data: uint8Array, 
    nativeImageDecoderSupport:"none", 
    disableNativeImageDecoder:true
  }).promise;
  
  const metadata = await pdfDocumentProxy.getMetadata();
  const pdfFormatVersion = metadata.info.PDFFormatVersion;
  put_(md5, undefined, "pdfFormatVersion", JSON.stringify(pdfFormatVersion));

  const stats = await pdfDocumentProxy.getStats();
  put_(md5, undefined, "stats", JSON.stringify(stats));
 
  const numPages = pdfDocumentProxy.numPages;
  put_(md5, undefined, "numPages", JSON.stringify(numPages));

  const fingerprint = pdfDocumentProxy.fingerprint;
  put_(md5, undefined, "fingerprint", JSON.stringify(fingerprint));

  const pageLayout = await pdfDocumentProxy.getPageLayout();
  put_(md5, undefined, "pageLayout", JSON.stringify(pageLayout));
  
  const pageLabels = await pdfDocumentProxy.getPageLabels();
  put_(md5, undefined, "pageLabels", JSON.stringify(pageLabels));
  
  const pageMode = pdfDocumentProxy.getPageMode();
  put_(md5, undefined, "pageMode", JSON.stringify(pageMode));
  
  const viewerPreferences = pdfDocumentProxy.getViewerPreferences();
  put_(md5, undefined, "viewerPreferences", JSON.stringify(viewerPreferences));
  
  for(let i=1; i<=numPages; ++i){
    const page = await pdfDocumentProxy.getPage(i);

    const viewport = page.getViewport();
    put_(md5, i, "viewport", JSON.stringify(viewport));
    
    const annotations = await page.getAnnotations();
    put_(md5, i, "annotations", JSON.stringify(annotations));
    
    const textContent = await page.getTextContent();
    put_(md5, i, "textContent", JSON.stringify(textContent));
    
    const pageNumber = page.pageNumber;
    put_(md5, i, "pageNumber", JSON.stringify(pageNumber));
    
    const rotate = page.rotate;
    put_(md5, i, "rotate", JSON.stringify(rotate));
    
    const ref = page.ref;
    put_(md5, i, "ref", JSON.stringify(ref));
    
    const userUnit = page.userUnit;
    put_(md5, i, "userUnit", JSON.stringify(userUnit));
    
    const view = page.view;
    put_(md5, i, "view", JSON.stringify(view));
    
    const stats = page.stats;
    put_(md5, i, "stats", JSON.stringify(stats));
  }//for
}
