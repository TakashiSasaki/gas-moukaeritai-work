function loadSentiment(text) {
  console.log("loadSentiment")
  const digest = computeDigest_(text);
  if (digest.length !== 32) return null;
  console.log("get");
  const json = CacheService.getScriptCache().get(digest);
  if (json === null) return null;
  const o = JSON.parse(json);
  o.cached = true;
  o.digest = digest;
  return o;
}

function saveSentiment(text, score, magnitude, language) {
  const digest = computeDigest_(text);
  const json = JSON.stringify({
    score: score,
    magnitude: magnitude,
    language: language,
  });
  console.log("put");
  CacheService.getScriptCache().put(digest, json, 21600);
}
