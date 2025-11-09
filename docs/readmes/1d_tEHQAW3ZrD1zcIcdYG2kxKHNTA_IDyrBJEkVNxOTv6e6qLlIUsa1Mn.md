# HOTP

## Overview

This Google Apps Script project is a web application that implements the HMAC-based One-Time Password (HOTP) algorithm. It provides a set of functions to compute an HOTP value based on a secret key, a counter, and the desired number of digits.

## Functionality

The project is designed as a web app that can be used to generate HOTP values. The user interface is loaded from external URLs.

### Core Features

- **`doGet(e)`:** This function is the main entry point for the web app. It fetches HTML, CSS, and JavaScript from external URLs and uses them to render the user interface.
- **`computeHotp(keyHex, count, nDigits)`:** This is the core function of the project. It takes a hexadecimal key, a counter, and the desired number of digits as input, and returns the computed HOTP value.
- **Helper Functions:** The project includes several helper functions for converting between different data formats, such as `hexToByteString`, `numberTo16Hex`, and `byteArrayToHex`.

### Code Examples

#### `Code.js`
```javascript
function computeHotp(keyHex, count, nDigits) {
  var keyByteString = hexToByteString(keyHex);
  var countHex = numberTo16Hex(count);
  var countByteString = hexToByteString(countHex);
  var byteArray = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_1, countByteString, keyByteString);
  return hmacToHotp(byteArray, nDigits, true);
}

function numberTo16Hex(number) {
  if (number < 0) throw "expecting non-negative integer";
  if (Math.floor(number) !== number) throw "expecting integer";
  var hex = Number(number).toString(16);
  Logger.log(hex);
  return ("0000000000000000" + hex).substr(-16);
}
```

## Permissions

The `appsscript.json` file specifies that the web app is accessible to anyone anonymously and executes as the user who deployed it.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {},
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

- **ID (HEAD):** `AKfycbwgopPvcgHbAjE1m0jN_9aSulK8czWby8zdx_bG5pyd`
  - **URL:** `https://script.google.com/macros/s/AKfycbwgopPvcgHbAjE1m0jN_9aSulK8czWby8zdx_bG5pyd/exec`
- **ID (Version 2):** `AKfycbyYu40SlSY-3k6MCUFkf9Fx3NzGzz2IiKLuUgt8AuUgqI1dphdO`
  - **URL:** `https://script.google.com/macros/s/AKfycbyYu40SlSY-3k6MCUFkf9Fx3NzGzz2IiKLuUgt8AuUgqI1dphdO/exec`
