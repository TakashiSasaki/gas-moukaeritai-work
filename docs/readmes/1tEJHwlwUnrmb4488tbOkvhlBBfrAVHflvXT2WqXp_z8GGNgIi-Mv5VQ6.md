# Project: Google Cloud Natural Language API Sentiment Analyzer

This Google Apps Script project is a utility library designed to perform sentiment analysis on text using the Google Cloud Natural Language API. It integrates OAuth2 for secure authentication, leverages caching to store and retrieve sentiment results, and includes a helper function for MD5 hashing.

## Overview

The primary purpose of this library is to provide a convenient and efficient way to analyze the emotional tone of text within Google Apps Script environments. By utilizing the Google Cloud Natural Language API, it can determine the sentiment score and magnitude of a given text, with results being cached to optimize performance and reduce API calls.

## Functionality

The core functionality is implemented across `Code.js`, `Cache.js`, and `Digest.js`.

### Core Features

-   **Sentiment Analysis**: The `analyzeSentiment(text)` function is the main entry point for sentiment analysis. It first checks if the sentiment for the given text is already in the cache. If not, it calls the Google Cloud Natural Language API to analyze the text and then caches the result.
-   **OAuth2 Authentication**: Uses the `OAuth2` library to authenticate with the Google Cloud Natural Language API via a service account. The `getService_()` function sets up the OAuth2 service.
-   **API Integration**: The `callNaturalLanguageAPI_(text)` function makes a POST request to the `documents:analyzeSentiment` endpoint of the Google Cloud Natural Language API, sending the text for analysis.
-   **Caching**: The `Cache.js` file provides `loadSentiment(text)` and `saveSentiment(text, score, magnitude, language)` functions. These functions use `CacheService.getScriptCache()` to store sentiment analysis results, keyed by the MD5 hash of the input text, for 6 hours (21600 seconds).
-   **MD5 Hashing**: The `Digest.js` file contains `computeDigest_(message)`, which calculates the MD5 hash of a given string and returns it as a hexadecimal string. This hash is used as the cache key for sentiment results.

### Code Examples

#### `Code.js`

```javascript
function getService_() {
  // Load the service account key JSON
  var serviceAccountKey = JSON.parse(PropertiesService.getScriptProperties().getProperty('SERVICE_ACCOUNT_KEY'));
  var service = OAuth2.createService('NaturalLanguageAPI')
    .setTokenUrl('https://oauth2.googleapis.com/token')
    .setPrivateKey(serviceAccountKey.private_key)
    .setIssuer(serviceAccountKey.client_email)
    .setPropertyStore(PropertiesService.getUserProperties())
    .setScope('https://www.googleapis.com/auth/cloud-platform');
  console.log(service);
  return service;
}

function callNaturalLanguageAPI_(text) {
  var service = getService_();
  console.log(service.hasAccess());
  if (service.hasAccess()) {
    var apiEndpoint = 'https://language.googleapis.com/v1/documents:analyzeSentiment';
    var headers = {
      'Authorization': 'Bearer ' + service.getAccessToken(),
      'Content-Type': 'application/json'
    };
    var body = {
      'document': {
        'type': 'PLAIN_TEXT',
        'content': text
      }
    };
    var options = {
      'headers': headers,
      'method': 'post',
      'payload': JSON.stringify(body),
      'muteHttpExceptions': true
    };
    console.log("accessing to the API");
    var response = UrlFetchApp.fetch(apiEndpoint, options);
    var data = JSON.parse(response.getContentText());
    console.log(data);
    return data;
  } else {
    Logger.log(service.getLastError());
  }
}

function analyzeSentiment(text) {
  const saved_sentiment = loadSentiment(text);
  if (saved_sentiment !== null) {
    saveSentiment(saved_sentiment.digest,
      saved_sentiment.score, saved_sentiment.magnitude, saved_sentiment.language);
    return saved_sentiment;
  }
  const result = callNaturalLanguageAPI_(text);
  const score = result.documentSentiment.score;
  const magnitude = result.documentSentiment.magnitude;
  const language = result.language;
  console.log(score, magnitude, language);
  saveSentiment(text, score, magnitude, language);
  return loadSentiment(text);
}
```

#### `Cache.js`

```javascript
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
```

#### `Digest.js`

```javascript
function computeDigest_(message) {
  var bytes = Utilities.newBlob(message).getBytes();
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, bytes);
  console.log(digest.length);
  var digestStr = digest.map(function(byte) {
    if(byte < 0) byte += 256;
    var result = byte.toString(16);
    if (byte < 16) {
      result = "0" + result;
    }
    return result;
  }).join("");
  Logger.log(digestStr);
  return digestStr;
}
```

## Web Interface

This project does not include any `.html` files and therefore does not provide a web interface. It is designed to be used programmatically as a library within other Google Apps Script projects.

## Permissions

The `appsscript.json` file specifies no explicit OAuth scopes. As a library, it will inherit the permissions of the Google Apps Script project that uses it. However, its functionality requires:

-   **Google Cloud Platform API Access**: Specifically for the Natural Language API.
-   **`UrlFetchApp`**: For making HTTP requests to the Natural Language API endpoint.
-   **`CacheService`**: For caching sentiment results.
-   **`PropertiesService`**: For storing the `SERVICE_ACCOUNT_KEY`.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **Dependencies**: Depends on the `OAuth2` library (Script ID: `1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF`).
-   **`SERVICE_ACCOUNT_KEY`**: A JSON string representing the Google Cloud service account key must be stored as a script property (`PropertiesService.getScriptProperties()`) for authentication with the Natural Language API.

## Deployments

This project is intended to be deployed as a Google Apps Script library, to be included and used by other projects. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.
