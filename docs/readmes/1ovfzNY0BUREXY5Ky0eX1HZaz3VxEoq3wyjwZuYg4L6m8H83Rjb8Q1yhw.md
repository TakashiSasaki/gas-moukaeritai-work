# Project: 1ovfzNY0BUREXY5Ky0eX1HZaz3VxEoq3wyjwZuYg4L6m8H83Rjb8Q1yhw

## Project Overview and Purpose

This Google Apps Script project, likely named "Is_" or a similar type-checking utility library, provides a collection of functions to validate the type and format of various JavaScript and Google Apps Script specific objects and primitives. It includes checks for arrays, base64 strings, blobs, date strings, defined values, email addresses, NI URIs, number arrays, and Spreadsheet objects. The project aims to offer a robust set of validation tools for other Google Apps Script projects, ensuring data integrity and simplifying conditional logic. It also includes a `doGet` function that can be used to run internal tests via a web app deployment.

## Core Functionality

The project's core functionality is to provide a comprehensive set of type and format validation functions.

### Type and Format Validation Functions

The project contains several functions, each designed to validate a specific data type or format:

*   **`array(a)`**: Checks if the input `a` is a JavaScript array.

    ```javascript
    /**
      @param {Array} a
      @return {Boolean}
    */
    function array(a) {
      return Object.prototype.toString.call(a) === '[object Array]';
    }
    ```

*   **`base64(base64String, websafe, nopad)`**: Validates if a string is a valid Base64 encoded string, with options for websafe and no-padding variations (RFC 4648).

    ```javascript
    /**
      Test BASE64 encoding (RFC 4648)
      @param {String} base64String
      @param {Boolean} websafe, default is false
      @param {Boolean} nopad, default is false
      @return {Boolean}
    */
    function base64(base64String, websafe, nopad) {
      if(websafe === undefined) websafe = false;
      if(nopad === undefined) nopad = false;
      if(typeof base64String !== "string") throw "isBase64: base64String should be a string.";
      // ... (regex validation logic) ...
    }
    ```

*   **`blob(blob)`**: Checks if the input `blob` is a Google Apps Script `Blob` object. It inspects the object's `toString()` representation and the presence of `copyBlob` method.

    ```javascript
    /**
      @param {Blob} blob or something
      @return {Boolean}
    */
    function blob(blob) {
      var x = Object.prototype.toString.call(blob);
      console.log("Object.prototype.toString.call(blob) : " + x);
      if(x == "[object JavaObject]"){
        var keys = Object.keys(blob);
        if(keys.indexOf("copyBlob") >= 0) return true;
      }
      
      if(x === "[object Object]"){
        console.log("typeof blob.copyBlob : " + typeof blob.copyBlob);
        if(typeof blob.copyBlob === "function") return true;
      }
      return false;
    }
    ```

*   **`dateString(dateString)`**: Validates if a string represents a date in `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` format.

    ```javascript
    /**
      @param {String} dateString
      @return {Boolean}
    */
    function dateString(dateString){
      if(typeof dateString !== "string") return false;
      var dateRegEx = /^\d{4}([-](\d{2})([-]\d{2})?)?$/;
      return dateString.match(dateRegEx) !== null;  
    }
    ```

*   **`defined(any)`**: Checks if a variable is defined (not `undefined`).

    ```javascript
    /**
      @param {*} any
      @return {Boolean}
    */
    function defined(any) {
      if(typeof any === "undefined") return false;
      return true;
    }
    ```

*   **`email(emailString)`**: Validates if a string is a valid email address using a regular expression.

    ```javascript
    /**
      @param {String} Email string
      @return {Boolean}
    */
    function email(emailString){
      if(typeof emailString !== "string") return false;
      var emailRegEx = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ 
      return emailString.match(emailRegEx) !== null;
    }
    ```

*   **`niUri(niUri)`**: Validates if a string conforms to the NI (Naming Authority Identifier) URI format.

    ```javascript
    function niUri(niUri) {
      var regex = /^ni:\/\/(.*)\\/(.+);([a-zA-Z0-9_-]+)$/;
      if(typeof niUri !== "string") return false;
      var match = niUri.match(regex);
      if(match === null) return false;
      var authority = match[1];
      var alg = match[2];
      var val = match[3];
      return (match[0] === niUri);
    }
    ```

*   **`numberArray(a)`**: Checks if the input `a` is an array and all its elements are numbers.

    ```javascript
    /**
      @param {Array}
      @return {Boolean}
    */
    function numberArray(a) {
      if(!array(a)) return false; // Relies on the 'array' function
      for(var i=0; i<a.length; ++i){
        if(typeof a[i] !== "number") return false;
      }
      return true;
    }
    ```

*   **`spreadsheet(ss)`**: Checks if the input `ss` is a Google Apps Script `Spreadsheet` object. It uses `toString()` method to identify the object type.

    ```javascript
    /**
      @param {Spreadsheet} ss
      @return {Boolean}
    */
    function spreadsheet(ss){
      if(typeof ss !== "object") return false;
      if(toString.call(ss) !== "[object JavaObject]") return false;
      if(Object.prototype.toString.call(ss) !== "[object JavaObject]") return false;
      if(typeof ss.toString !== "function") return false;
      if(ss.toString() !== "Spreadsheet") return false;
      return true;
    }
    ```

### Test Functions (`test.js`)

*   **`test()`**: A general test runner function that iterates through all functions in the global scope and executes any function that has a `.test()` method. This allows for quick verification of all validation functions.

    ```javascript
    /*
      Run all brief internal test for 'Hash' project.
      @return {void}
    */
    function test(){
      for(var i in this){
        if(typeof this[i] === "function") {
          if(typeof this[i]["test"] === "function"){
            console.log("Running the test for " + i);
            this[i]["test"]();
          }
        }
      }
      var now = new Date();
      return [now, now.getTime()];
    }
    ```

### Web App Entry Point (`doGet.js`)

*   **`doGet(e)`**: This function serves as an entry point for a web app deployment. If a `test` parameter is present in the URL, it executes the `test()` function and returns its output as plain text.

    ```javascript
    function doGet(e) {
      if(typeof e.parameter.test !== "undefined"){
        return ContentService.createTextOutput(test());
      }
    }
    ```

## Permissions

The `appsscript.json` manifest file specifies the following permissions and access settings:

*   **Time Zone:** `Asia/Tokyo`
*   **Exception Logging:** `STACKDRIVER`
*   **Runtime Version:** `V8`
*   **Dependencies:** No external libraries are explicitly listed in `appsscript.json`.
*   **Web App Access:** `ANYONE_ANONYMOUS` - The web application is accessible by anyone, even without a Google account.
*   **Web App Execution:** `USER_DEPLOYING` - The script runs under the identity of the user who deployed the web app.

## Deployments

The project has the following deployments:

*   **Deployment ID:** `AKfycbwizThTnDoMwPeZWvpp3U23bYSI5W4ckj0V2UgV0_N_`
    *   **Target Version:** `HEAD`
    *   **Description:** (empty)
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbwizThTnDoMwPeZWvpp3U23bYSI5W4ckj0V2UgV0_N_/exec`

*   **Deployment ID:** `AKfycbz_IlegeYN8hkLyATN0OeepUp8i_Hqz0uH3FWMLqn6NSJnwyEL7`
    *   **Target Version:** `18`
    *   **Description:** `web app meta-version`
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbz_IlegeYN8hkLyATN0OeepUp8i_Hqz0uH3FWMLqn6NSJnwyEL7/exec`
