function getConversationsList() {
  const httpResponse = UrlFetchApp.fetch("https://slack.com/api/conversations.list",
  {
    "method" : "GET",
    "contentType":'application/json',
    "headers": {
      "Authorization" : "Bearer " + CacheService.getUserCache().get("access_token")
    }
  });
  return httpResponse.getContentText();
}
