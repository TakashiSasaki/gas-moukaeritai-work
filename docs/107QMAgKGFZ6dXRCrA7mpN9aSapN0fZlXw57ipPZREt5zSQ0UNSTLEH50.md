# Project: Android package list

This Google Apps Script project functions as a web application designed to display a user's Android package lists. It retrieves package data from specially formatted emails sent to the user's Gmail account, aggregates this data by device, and presents it in an interactive web interface.

## Overview

The application allows users to view package lists from multiple Android devices. Data is sourced from Gmail messages, parsed, and then displayed in a sortable table within a web interface. It supports caching of retrieved data to improve performance and reduce API calls.

## Functionality

The core functionality is implemented across `Code.js` and `doGet.js`, with `index.html` providing the user interface.

-   **`doGet(e)` (Web App Entry Point)**: This function is executed when the web app is accessed. It retrieves the active user's email, calls `getLatestPackageData` to fetch the aggregated device and package information, and then renders `index.html` using `HtmlService.createTemplateFromFile`. The `userEmail` and `deviceData` are passed to the HTML template.
-   **`getDeviceDataForHtml()`**: A server-side function exposed to the client-side HTML. It acts as a wrapper to call `getLatestPackageData` and return the device data to the web page.
-   **`getLatestPackageData(email)`**: This is the central data processing function:
    -   **Caching**: It first attempts to retrieve aggregated package data from the `CacheService` (user cache) using a key `aggregated_package_data`. Data is cached for 6 hours (21600 seconds).
    -   **Gmail Search**: If no cached data is found, it searches the user's Gmail for messages with the subject "Android package list" sent from and to the user's email address. It retrieves up to 5 threads.
    -   **Data Parsing and Aggregation**: It iterates through the messages, parses JSON content from their plain body, expecting an array `[modelName, androidId, packageList]`. It then aggregates package lists by `modelName`, ensuring unique packages are stored using a `Set`.
    -   **Result Formatting**: The aggregated data is converted into an array of objects, each containing `modelName`, `androidId`, and a sorted `packageList`.
    -   **Cache Storage**: The processed data is then stored back into the `CacheService` if its size is within the 100KB limit.

```javascript
// Excerpt from Code.js
function getLatestPackageData(email) {
  const cache = CacheService.getUserCache();
  const cacheKey = 'aggregated_package_data';
  const CACHE_EXPIRATION_SECONDS = 21600; // 6時間

  try {
    const cachedResult = cache.get(cacheKey);
    if (cachedResult != null) {
      Logger.log('Cache hit. Returning data from cache.');
      return JSON.parse(cachedResult);
    }
  } catch (e) {
    Logger.log('Could not read from cache: ' + e.message);
  }

  Logger.log('Cache miss. Fetching data from Gmail.');
  const searchQuery = `to:${email} from:${email} subject:'Android package list'`;
  const aggregatedData = {}; // { "モデル名": { androidId: "...", packages: Set(...) } }

  try {
    const threads = GmailApp.search(searchQuery, 0, 5);

    threads.forEach(thread => {
      const messages = thread.getMessages();
      messages.forEach(message => {
        try {
          const body = message.getPlainBody();
          const parsedJson = JSON.parse(body);
          
          const [modelName, androidId, packageList] = parsedJson;

          if (modelName && Array.isArray(packageList)) {
            if (!aggregatedData[modelName]) {
              aggregatedData[modelName] = {
                androidId: androidId,
                packages: new Set(packageList)
              };
            } else {
              packageList.forEach(pkg => aggregatedData[modelName].packages.add(pkg));
            }
            message.markRead();
          }
        } catch (e) {
          // JSON parse errors are ignored
        }
      });
    });

    const results = Object.keys(aggregatedData).map(modelName => {
      const deviceData = aggregatedData[modelName];
      const sortedPackages = Array.from(deviceData.packages).sort();
      
      return {
        modelName: modelName,
        androidId: deviceData.androidId,
        packageList: sortedPackages
      };
    });

    try {
      const dataToCache = JSON.stringify(results);
      if (dataToCache.length < 100 * 1024) { // Cache limit check
        cache.put(cacheKey, dataToCache, CACHE_EXPIRATION_SECONDS);
        Logger.log('Successfully stored results in cache.');
      } else {
        Logger.log('Data size exceeds 100KB cache limit. Skipping cache store.');
      }
    } catch (e) {
      Logger.log('Could not write to cache: ' + e.message);
    }

    return results;

  } catch (gasError) {
    Logger.log(`GAS Execution Error: ${gasError.message}`);
    return [];
  }
}
```

## Web Interface (`index.html`)

The `index.html` file provides a responsive user interface for viewing the package lists:

-   **Google Charts Integration**: Uses the Google Charts library to render package lists in an interactive, sortable table.
-   **Device Selector**: A dropdown menu allows the user to select different Android devices (identified by `modelName`) for which package data has been collected.
-   **Android ID Display**: Shows the Android ID of the currently selected device.
-   **Package List Display**: Displays the list of packages for the selected device, along with the total count. Each package name is rendered as a clickable link (though currently linking to `example.com`).
-   **Loading States**: Includes an initial loader overlay and a table-specific loader for better user experience during data fetching and rendering.
-   **Automate Integration**: Features a footer with instructions and a link to the "Automate" Android app, suggesting that this app is used to send the package list data to the Google Apps Script. A community flow for Automate is linked for sending data.

## Permissions

The web application requires the following permissions:

-   **Execution**: `USER_ACCESSING` (the script runs with the identity and permissions of the user who accesses the web app).
-   **Access**: `ANYONE` (the web app is accessible to anyone, including anonymous users).
-   **Google Services**: Requires access to `GmailApp` (to search and read emails) and `CacheService` (to store and retrieve cached data).

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **Advanced Services**: No advanced services are explicitly listed in `appsscript.json`, but the script implicitly uses `GmailApp` and `CacheService`.

## Deployments

The project has two deployments:

-   **Deployment 1**:
    -   **ID**: `AKfycbyPnFuvxjOVBuHtapNumQ4PwYKpP3SVOJdAxLBR64Q`
    -   **Target**: `@HEAD`
    -   **Description**: _(none)_
    -   **Published URL**: [Link](https://script.google.com/macros/s/AKfycbyPnFuvxjOVBuHtapNumQ4PwYKpP3SVOJdAxLBR64Q/exec)
-   **Deployment 2 (Public v3)**:
    -   **ID**: `AKfycbyEi5YGu-xDJWIgdUgY54DwZaBG2gCCbxUgmPSxIDtG5W5uVVG91vyp2M8S54shI2Ng`
    -   **Target**: `3` (version 3)
    -   **Description**: `公開用 v3` (Public v3)
    -   **Published URL**: [Link](https://script.google.com/macros/s/AKfycbxRtaUHkV8L2S7TsZ0dm97mojhzLcAtmI5zknc1UX8/exec)
