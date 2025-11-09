# 松山市プレミアム商品券 (Matsuyama Premium Gift Certificates)

## Overview

The "松山市プレミアム商品券" (Matsuyama Premium Gift Certificates) project is a Google Apps Script web application designed to assist residents and visitors in Matsuyama City, Japan, in locating stores that accept specific premium gift certificates: "愛顔のえひめ商品券" (Aigao no Ehime Gift Certificates) and "まつやま幸せ実感商品券" (Matsuyama Shiawase Jikkan Gift Certificates). The application provides an interactive map interface where users can find participating stores based on their current location or a manually entered address. It leverages Google Maps API and Google Fusion Tables for geographical data visualization and includes a basic page view counter. The user interface is styled using Bootstrap for a responsive design.

## Functionality

The project offers a user-friendly way to discover and navigate to stores accepting premium gift certificates.

### Core Features

-   **`doGet()`:** The entry point for the web application. It renders `index.html`, sets the sandbox mode to IFRAME, and titles the page "松山市プレミアム商品券".
-   **`getCount()`:** Retrieves the current page view count from script properties.
-   **`incrementCount()`:** Increments the page view counter stored in script properties. It uses `LockService` to ensure atomic updates to the counter.
-   **Location-Based Search (`index.html` & `js.html`):**
    -   **"現在地周辺のお店を探す" (Find stores near current location):** Uses the browser's geolocation API (`navigator.geolocation.getCurrentPosition`) to get the user's coordinates and then opens a Google Fusion Tables map centered on that location.
    -   **"住所を指定してお店を探す" (Find stores by specifying address):** Allows users to input an address. It uses Google Maps Geocoding API (`google.maps.Geocoder`) to convert the address to coordinates and then opens a Google Fusion Tables map. The last entered address is saved in `localStorage`.
-   **Google Fusion Tables Integration:** Store data is visualized on a map using a Google Fusion Table (ID: `1cRTH9zPAFeNnr6Lbz3NRGWErdxrkrlugBjrZqtcK`).
-   **Page View Counter Display:** The `index.html` displays the total number of times the page has been viewed, updated via `incrementCount()`.
-   **Twitter Share Button:** Includes a Twitter share button pre-populated with information about the web app.
-   **Styling:** Uses Bootstrap CSS (`css.html`) for a clean and responsive layout.

### Code Examples

#### `コード.js`

```javascript
function doGet() {
  var html_template = HtmlService.createTemplateFromFile("index");
  var html_output = html_template.evaluate();
  html_output.setSandboxMode(HtmlService.SandboxMode.IFRAME);
  html_output.setTitle("松山市プレミアム商品券");
  return html_output;
}

function getCount() {
  var script_property = PropertiesService.getScriptProperties();
  var current_count = parseInt(script_property.getProperty("count"));
  return current_count;
}

function incrementCount(){
  var lock = LockService.getScriptLock();
  lock.waitLock(5000);
  var current_count = getCount();
  var script_property = PropertiesService.getScriptProperties();
  script_property.setProperty("count", ""+(current_count + 1));
  lock.releaseLock();
  return current_count + 1;
}
```

#### `js.html` (Client-side JavaScript for map interaction)

```html
<script>
$(function() {
  $("#button1").on("click", here);
  $("#button2").on("click", address);
  $("a.twitter-tweet").on("click", function(){$("div.twitter-tweet").show(); return false;});
  var a = localStorage.address;
  $("#address").val(a);
});

function here() {
    navigator.geolocation.getCurrentPosition(function(x) {
        var lat = x.coords.latitude;
        var lng = x.coords.longitude;
        var url = "https://www.google.com/fusiontables/embedviz?q=select+col1+from+1cRTH9zPAFeNnr6Lbz3NRGWErdxrkrlugBjrZqtcK&viz=MAP&h=false&t=1&z=17&l=col1&y=2&tmplt=3&hml=GEOCODABLE" + "&lat=" + lat + "&lng=" + lng;
        window.open(url);
        $("div.twitter-tweet").show();
    }, function() {});
}

function address(){
  var geocoder = new google.maps.Geocoder();
  var a = $("#address").val();
  localStorage.address = a;
  geocoder.geocode({'address': a}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      var latlng = results[0].geometry.location;
      var lat = latlng.lat();
      var lng = latlng.lng();
      var url = "https://www.google.com/fusiontables/embedviz?q=select+col1+from+1cRTH9zPAFeNnr6Lbz3NRGWErdxrkrlugBjrZqtcK&viz=MAP&h=false&t=1&z=17&l=col1&y=2&tmplt=3&hml=GEOCODABLE" + "&lat=" + lat + "&lng=" + lng;
      window.open(url);
      $("div.twitter-tweet").show();
    } else {
      alert("住所が見つかりません");
    }
  });
}
</script>
```

## Permissions

The `appsscript.json` file indicates no specific library dependencies. The web application is configured to execute as the user who deployed it and is accessible by anyone anonymously.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {
  },
  "webapp": {
    "access": "ANYONE_ANONYMOUS",
    "executeAs": "USER_DEPLOYING"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Deployments

The project has two deployments:

-   **ID (HEAD):** `AKfycbzDguF7-c1TW-vM57D1KaZ7cPqALbDTup_RRijB-40j`
    -   **URL:** `https://script.google.com/macros/s/AKfycbzDguF7-c1TW-vM57D1KaZ7cPqALbDTup_RRijB-40j/exec`
-   **ID (Version 21 - web app meta-version):** `AKfycbykZdHgW59Dr54ltfNBkey46mFqf941jzxR8MzBG2Hc_PPB2ddu`
    -   **URL:** `https://script.google.com/macros/s/AKfycbykZdHgW59Dr54ltfNBkey46mFqf941jzxR8MzBG2Hc_PPB2ddu/exec`
