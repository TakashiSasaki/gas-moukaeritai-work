function myFunction() {
  const url = "https://www.jbrc-sys.com/brsp/a2A/@!a2pr_getpage";
  const options = {
    method : "POST",
    contentType: "application/x-www-form-urlencoded",
    followRedirects: true,
    payload: {
      a2PagingCommand :"next",
      a2PagingOffset : 15,
      a2PagingProperty : "SEARCH_RESULT",
      a2PagingContinueFg:false
    }
  };
  const result = UrlFetchApp.fetch(url, options);
}

