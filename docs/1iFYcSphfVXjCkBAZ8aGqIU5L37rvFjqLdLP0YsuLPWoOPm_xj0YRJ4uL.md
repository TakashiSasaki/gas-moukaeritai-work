# Twitter Unblock and Mute

## Overview

The "Twitter Unblock and Mute" project is a Google Apps Script web application designed to provide a user interface for interacting with the Twitter API. Its primary functions include managing user blocks and mutes, fetching user profiles, and sending direct messages. The application leverages the OAuth1 library for secure Twitter authentication and presents a web interface built with HTML and JavaScript for user interaction. It also incorporates features for managing time-driven triggers.

## Functionality

The project offers a comprehensive set of features for Twitter account management:

### Core Features

-   **OAuth1 Authorization:** Handles the OAuth 1.0a authentication flow with Twitter, allowing the application to securely access user data and perform actions on their behalf. It uses `PropertiesService` to store API keys and `CacheService` for caching.
-   **User Profile Fetching:** Retrieves and displays the authenticated user's Twitter profile information.
-   **Blocked Users Management:** Fetches a list of users blocked by the authenticated user.
-   **Muted Users Management:** Fetches a list of users muted by the authenticated user.
-   **Blocking/Unblocking Users:** Provides functionality to block and unblock Twitter users.
-   **Muting/Unmuting Users:** Provides functionality to mute and unmute Twitter users.
-   **Direct Messaging:** Enables sending direct messages to specified Twitter users.
-   **Trigger Management:** Includes functions to install and delete time-driven triggers, likely for automated tasks.
-   **Web Interface (`doGet`):** Serves an HTML-based user interface (`Index.html`) that allows users to initiate authorization, view their profile, manage blocked/muted users, and perform other actions.

### Code Examples

#### `Authorization.js`

```javascript
// OAuth1ライブラリを使用してOAuthサービスを設定
function getOAuth1Service() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const API_KEY = scriptProperties.getProperty('API_KEY');
  const API_KEY_SECRET = scriptProperties.getProperty('API_KEY_SECRET');

  if (!API_KEY || !API_KEY_SECRET) {
    throw new Error('API_KEY or API_KEY_SECRET is not set in Script Properties.');
  }

  const lock = LockService.getUserLock();
  if (!lock.tryLock(10000)) {
    throw new Error('Could not acquire lock.');
  }

  // OAuth1サービスの設定
  const service = OAuth1.createService('twitter')
    .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
    .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
    .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')
    .setConsumerKey(API_KEY)
    .setConsumerSecret(API_KEY_SECRET)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties())

  lock.releaseLock();

  return service;
}

// OAuth 1.0a認証シーケンスを開始するための関数
function startAuthorization() {
  const service = getOAuth1Service();
  if (!service.hasAccess()) {
    const authorizationUrl = service.authorize();
    Logger.log('Authorization URL: ' + authorizationUrl); // 認可URLのログ
    return authorizationUrl;  // このURLをウェブUIで表示
  } else {
    return 'Already authorized.';
  }
}
```

#### `doGet.js`

```javascript
function doGet() {
  return HtmlService.createTemplateFromFile("Index").evaluate().setTitle("Twitter Unblock and Mute");
}
```

#### `mute.js`

```javascript
function mute(userId){
  var service = getTwitterService();
  var http_response = service.fetch("https://api.twitter.com/1.1/mutes/users/create.json?user_id=" + userId, {"method": "POST"});
  var content_text = http_response.getContentText();
  setMuteState(userId, true);
  return content_text;
}
```

#### `unblock.js`

```javascript
function unblock(userId){
  var service = getTwitterService();
  var http_response = service.fetch("https://api.twitter.com/1.1/blocks/destroy.json?user_id=" + userId, {"method":"POST"});
  var content_text = http_response.getContentText();
  setBlockState(userId, false);
  return content_text;
}
```

#### `directMessage.js`

```javascript
function sendDirectMessage(message){
  var screen_name = getScreenName();
  var service = getTwitterService();
  var http_response = service.fetch("https://api.twitter.com/1.1/direct_messages/new.json?screen_name=" + screen_name + "&text=" + encodeURIComponent(message), {"method":"POST", "muteHttpExceptions": true});
  var content_text = http_response.getContentText();
  return content_text;  
}
```

## Permissions

The `appsscript.json` file specifies the necessary library dependencies for OAuth1 and OAuth2, and configures the project as a web application that executes as the user accessing it and is accessible by anyone.

```json
{
  "timeZone": "Asia/Tokyo",
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "dependencies": {
    "libraries": [
      {
        "userSymbol": "OAuth1",
        "libraryId": "1CXDCY5sqT9ph64fFwSzVtXnbjpSfWdRymafDrtIZ7Z_hwysTY7IIhi7s",
        "version": "18"
      },
      {
        "userSymbol": "OAuth2",
        "libraryId": "1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF",
        "version": "43"
      }
    ]
  },
  "webapp": {
    "executeAs": "USER_ACCESSING",
    "access": "ANYONE"
  }
}
```

## Deployments

The project has numerous deployments, indicating active development and various versions. The HEAD deployment is:

-   **ID (HEAD):** `AKfycbxJIAlB2-dPFDUj72ERAIbiFeuVb4BejW7Aule-7APa`
    -   **URL:** `https://script.google.com/macros/s/AKfycbxJIAlB2-dPFDUj72ERAIbiFeuVb4BejW7Aule-7APa/exec`

Other notable deployments include:

-   **ID (Version 17 - web app meta-version):** `AKfycbxi306E_MlRQzwg3vGxIaiSNkLB9UFDAi7okuBjRIq353xJg-Qw`
    -   **URL:** `https://script.google.com/macros/s/AKfycbxi306E_MlRQzwg3vGxIaiSNkLB9UFDAi7okuBjRIq353xJg-Qw/exec`
