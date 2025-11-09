# Project: 1nH20n09gtpxjWEo5FUv9Ixor2nIO0Et0GJ8emW6dIOsgYQf7LXBUwNG0

## Project Overview and Purpose

This Google Apps Script project, named "Hash", provides a collection of utility functions primarily focused on SHA-1 hashing and data manipulation. It includes functions for computing SHA-1 digests in various formats (hexadecimal, base64 web-safe, Uint8Array), converting between different data representations (e.g., Uint8Array to signed 8-bit array, hex to "safe" hex), and creating Blob objects. The project also features a web application interface that allows users to input text and see its SHA-1 hash computed in real-time in different formats. It also includes a function to compute Git object hashes.

## Core Functionality

The project leverages the `Utilities.computeDigest` function for SHA-1 hashing and depends on external libraries `Sha1` and `Random` for additional functionalities.

### Hashing Functions

*   **`computeSha1Base64WebSafe(string|object)`**: Computes the SHA-1 hash of a given string or object (JSON stringified) and returns it as a base64 web-safe encoded string.
*   **`computeSha1Hex(string|object)`**: Computes the SHA-1 hash of a given string or object and returns it as a hexadecimal string.
*   **`computeSha1Uint8Array(string|object)`**: Computes the SHA-1 hash of a given string or object and returns it as an unsigned 8-bit integer array (Uint8Array).
*   **`gitHash(string)`**: Computes the Git object hash (SHA-1) for a given string, prepending "blob <length>\x00" as per Git's object format.
*   **`gitHashHex(string)`**: Returns the hexadecimal representation of the Git object hash.

```javascript
/**
  @param {String|Object} string or object
  @returns {String} base64 web safe representation of SHA1 message digest
*/
function computeSha1Base64WebSafe(string) {
  if(typeof string === typeof {}) {
    string = JSON.stringify(string);
  }
  if(typeof string !== typeof "") throw new Error("expecting string");
  var digest = computeSha1Uint8Array(string);
  var signed = toSigned(digest); // Assuming toSigned is defined elsewhere or from a library
  var base64 = Utilities.base64EncodeWebSafe(signed);
  return base64;
}

/**
  @param {String|Object}
  @returns {String} hex string
*/
function computeSha1Hex(string) {
  if(typeof string === typeof {}) {
    string = JSON.stringify(string);
  }
  if(typeof string !== typeof "") throw new Error("expecting string");
  var digest = computeSha1Uint8Array(string);
  var hex = StringUtility.toHexString(digest); // Assuming StringUtility is defined elsewhere or from a library
  return hex;
}

/**
  @param {String | Object}
  @return {Byte[]} byte array of SHA1 message digest
*/
function computeSha1Uint8Array(string){
  if(typeof string === typeof {}) {
    string = JSON.stringify(string);
  }
  if(typeof string !== typeof "") throw new Error("expecting string");
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, string, Utilities.Charset.UTF_8);
  var digestUnsigned = toUnsigned(digest); // Assuming toUnsigned is defined elsewhere or from a library
  return digestUnsigned;
}

function gitHash(string) {
  var blob = Utilities.newBlob("");
  blob.setDataFromString(string, "UTF-8");
  var utf8Bytes = blob.getBytes();  
  var hashInt8Array = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, "blob " + utf8Bytes.length + "\x00" + string, Utilities.Charset.UTF_8);
  return hashInt8Array;
}
```

### Data Conversion and Utility Functions

*   **`toUint8Array`**: (Delegated to `Sha1.toUint8Array`) Converts various inputs to a Uint8Array.
*   **`toInt8Array(uint8Array)`**: Converts an array of unsigned 8-bit integers to a signed 8-bit integer array.
*   **`toHex`**: (Delegated to `Sha1.toHex`) Converts a byte array to a hexadecimal string.
*   **`toSafeHex(hexOrArrayOrBlob)`**: Converts a hexadecimal string, byte array, or Blob into a "safe" hexadecimal string using a custom character mapping (e.g., '0' to 'c', 'a' to 'r').
*   **`createKonnnichiwaBlob()`**: Creates a Blob object containing the UTF-8 string "こんにちは".
*   **`createNumberSequenceBlob(start, end)`**: Creates a Blob object containing a sequence of numbers from `start` to `end` as bytes.
*   **`isArray(arrayOrSomething)`**: Checks if the input is an array.
*   **`isBlob`**: (Delegated to `Sha1.isBlob`) Checks if the input is a Blob object.
*   **`assertEqual`**: (Delegated to `Sha1.assertEqual`) An assertion utility for testing.
*   **`test()`**: A function to run all internal tests within the project.

## Web Interface

The project includes a simple web interface defined in `index.html`.

### `index.html`

This HTML file provides a user interface for real-time SHA-1 hash computation:

*   **Input Area:** A textarea where users can type or paste text.
*   **Real-time Hashing:** As the user types, the script computes and displays the SHA-1 hash in three formats: `computeSha1Base64WebSafe`, `computeSha1Hex`, and `computeSha1Uint8Array`.
*   **Styling:** Basic CSS is included for the layout and a custom heading style.
*   **Client-side Logic:** JavaScript uses `google.script.run` to call the server-side hashing functions and update the displayed results. It includes a debouncing mechanism to prevent excessive server calls.

```html
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <style>
      /* ... (styling) ... */
    </style>
  </head>
  <body>
    <h1>Hash</h1>
    <textarea onkeyup="computeSha1(this)"></textarea>
    <h1>computeSha1Base64WebSafe</h1>
    <p></p>
    <h1>computeSha1Hex</h1>
    <p></p>
    <h1>computeSha1Uint8Array</h1>
    <p></p>
    <script>
    var computing = 0;
    function computeSha1(element){
      computing += 3;
      setTimeout(function(){
        if(computing > 3) {
          computing -= 3; 
          return;
        }
        google.script.run.withSuccessHandler(function(sha1Base64WebSafe){
          document.getElementsByTagName("p")[0].innerHTML=sha1Base64WebSafe;
          computing -= 1;
        }).withFailureHandler(function(){
          computing -= 1;
        }).computeSha1Base64WebSafe(element.value);
        // ... (calls to computeSha1Hex and computeSha1Uint8Array) ...
      }, 500);
    }
    </script>
  </body>
</html>
```

## Permissions

The `appsscript.json` manifest file specifies the following permissions and access settings:

*   **Time Zone:** `Asia/Tokyo`
*   **Exception Logging:** `STACKDRIVER`
*   **Runtime Version:** `V8`
*   **Dependencies:**
    *   **Libraries:**
        *   `Sha1` (ID: `1oKLfiJY_0SIAx62t0fHFW0dcgkq41VNJZaxhoUqurNP_LKxKh6xTa3WN`, Version: `1`, Development Mode: `true`) - Provides core SHA-1 related utilities.
        *   `Random` (ID: `1NtKt5zOmO0Hvgx_6Jxfl1xyHSK4A65O9krJSfqUfdx-mfjp1fcqiRbSr`, Version: `1`, Development Mode: `true`) - Likely used for random number generation, possibly in testing or specific Blob creation.
*   **Web App Access:** `MYSELF` - The web application can only be accessed by the developer who deployed it.
*   **Web App Execution:** `USER_DEPLOYING` - The script runs under the identity of the user who deployed the web app.

## Configuration

There is no explicit configuration beyond the dependencies on external libraries.

## Deployments

The project has the following deployments:

*   **Deployment ID:** `AKfycbwf__dsRUurgP50dNYbepWMC6Rr19O33uQAg9VjVo1I`
    *   **Target Version:** `HEAD`
    *   **Description:** (empty)
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbwf__dsRUurgP50dNYbepWMC6Rr19O33uQAg9VjVo1I/exec`

*   **Deployment ID:** `AKfycbzTkvoMjAorRMIQXxobvkFVV1RXWTxucFDJbuUtM0PMdoSseVnE`
    *   **Target Version:** `6`
    *   **Description:** `oneplatform api meta-version`
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbzTkvoMjAorRMIQXxobvkFVV1RXWTxucFDJbuUtM0PMdoSseVnE/exec`

*   **Deployment ID:** `AKfycbydGLY1njb3VM_Y8O9XeGAc5sCZsXLvFeA5KToEDOTFC2JCrFti`
    *   **Target Version:** `5`
    *   **Description:** `web app meta-version`
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbydGLY1njb3VM_Y8O9XeGAc5sCZsXLvFeA5KToEDOTFC2JCrFti/exec`
