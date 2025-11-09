# Kakaku Library

## Overview

The "Kakaku Library" project is a Google Apps Script web application designed to scrape product information from `kakaku.com`, a popular Japanese price comparison website. Its primary functions include retrieving product image URLs, generating product list URLs based on search queries and categories, and extracting category and genre information. The project leverages `UrlFetchApp` to fetch web content and utilizes `CacheService` to store scraped data for 6 hours, optimizing performance and reducing repeated requests to the external website.

## Functionality

The project provides a web-based interface and a set of server-side functions for interacting with `kakaku.com`.

### Core Features

-   **`doGet(e)`:** The entry point for the web application.
    -   If a `url` parameter is provided in the request, it attempts to extract and return the first product image URL found on that page as plain text.
    -   Otherwise, it serves `index.html`, which provides usage instructions and an example URL.
-   **`fetch(url)`:** A utility function that fetches content from a given URL. It uses `UrlFetchApp` and caches the response in `ScriptCache` for 6 hours (21600 seconds) to prevent redundant fetches. It also handles Shift_JIS encoding.
-   **`getProductImageUrl(url)`:** Scrapes a given `kakaku.com` product page URL to find and return the URL of the main product image. Results are cached.
-   **`getProductListUrl(product_name, category1, category2)`:** Constructs a search results URL on `kakaku.com` based on a product name and optional category codes. It uses `StringUtilityLibrary.encodeURIComponent_Shift_JIS` for proper encoding.
-   **`getCategoryCode(cat1, cat2)`:** Extracts category codes from `kakaku.com` based on category names. Results are cached.
-   **`getCategoryPageNames()`:** Scrapes `kakaku.com/allcategory.htm` to get a list of all category names and their corresponding page URLs.
-   **`getGenre(page_name)`:** Scrapes a category page on `kakaku.com` to extract genre information (subcategories). Results are cached.

### Code Examples

#### `doGet.js`

```javascript
function doGet(e) {
  if(e.parameter.url) {
    var product_image_url = getProductImage(e.parameter.url);
    var text_output = ContentService.createTextOutput(product_image_url);
    text_output.setMimeType(ContentService.MimeType.TEXT);
    return text_output;
  } else {
    var html_template = HtmlService.createTemplateFromFile("index");
    var html_output = html_template.evaluate();
    return html_output;
  }
}
```

#### `fetch.js`

```javascript
function fetch(url) {
  LockService.getScriptLock().waitLock(20000);
  if(arguments.length===0) {
    url = "http://kakaku.com/pc_category.htm";
  }
  var cache = CacheService.getScriptCache();
  var cached_string = cache.get(url);
  if(cached_string) {
    return cached_string;
  }
  var response = UrlFetchApp.fetch(url);
  var response_string = response.getContentText("Shift_JIS");  
  try {
    cache.put(url, response_string);
  } catch(e) {
    cache.remove(url);
  }
  return response_string;
}
```

#### `getProductImageUrl.js`

```javascript
function getProductImageUrl(url) {
  var cache = CacheService.getScriptCache();
  if(arguments.length === 0) {
    url = "http://kakaku.com/pc/";
    cache.remove(url);
    var image_url = getProductImageUrl(url);
    Logger.log(image_url);
    return image_url;
  }
  var image_url = cache.get(url);
  if(!image_url) {
    var response = UrlFetchApp.fetch(url);
    var xml_string = response.getContentText("Shift_JIS");
    var match = xml_string.match(/http:\/\/img.kakaku.com\/images\/productimage\/[A-Za-z0-9\/]+\.jpg/);
    if(match) {
      image_url = match[0];
      cache.put(url, image_url, 21600);
    }
  } else {
    Logger.log(image_url);
  }
  return image_url;
}
```

## Permissions

The `appsscript.json` file specifies a dependency on the `StringUtilityLibrary` and configures the project as a web application that executes as the user who deployed it and is accessible only by that user.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
    "libraries": [{
      "userSymbol": "StringUtilityLibrary",
      "libraryId": "1toCTzwoHcWb0VQGQ3aYO9QZpRY9P5f4g3Hn4K9FCWFIth7OJjW4jssP5",
      "version": "15",
      "developmentMode": true
    }]
  },
  "webapp": {
    "access": "MYSELF",
    "executeAs": "USER_DEPLOYING"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Deployments

The project has two deployments:

-   **ID (HEAD):** `AKfycbwfkl54qpmtTETas1aWuadE5soa8PNxrFjjB7BsBbxg`
    -   **URL:** `https://script.google.com/macros/s/AKfycbwfkl54qpmtTETas1aWuadE5soa8PNxrFjjB7BsBbxg/exec`
-   **ID (Version 4 - web app meta-version):** `AKfycbwjcS0vNrNYhC5Y9E1kqR4x7lmmgVB78nyyie9gaY6myZ9Bl0sN`
    -   **URL:** `https://script.google.com/macros/s/AKfycbwjcS0vNrNYhC5Y9E1kqR4x7lmmgVB78nyyie9gaY6myZ9Bl0sN/exec`
