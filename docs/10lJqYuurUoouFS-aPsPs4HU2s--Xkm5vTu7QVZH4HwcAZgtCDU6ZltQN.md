# Project: Assert

This Google Apps Script project is a comprehensive assertion library, providing a wide range of utility functions for validation and type checking. It is designed to be used as a testing or validation framework within other Google Apps Script projects.

## Overview

The "Assert" library is composed of numerous small, single-purpose functions that check for specific conditions. If an assertion fails, the function throws an error with a descriptive message. This pattern is common in testing libraries to ensure that data and variables conform to expected types and values. The library is exposed as a web app, which appears to be configured to run tests via URL parameters.

## Functionality

The project is structured as a collection of small files, each containing one or more related assertion functions. The functions follow a consistent design pattern: they take a value as input, check a condition, and throw an error if the condition is not met. Many functions return the `global` object, allowing for a fluent, chainable interface.

Key categories of assertion functions include:

-   **Type Checking**: Functions like `isArray`, `isString`, `isNumber`, `isObject`, `isFunction`, `isBlob`, `isNull`, and `isUndefined` validate the type of a given variable.
-   **Value Checking**: Functions like `equal`, `isTrue`, `isInteger`, and `isNumberInRange` check for specific values or conditions.
-   **String and Array Checks**: Functions such as `stringLength`, `arrayLength`, and `base64` perform validation specific to strings and arrays.
-   **Property and Definition Checks**: `hasProperty`, `isDefined`, and `notUndefined` check for the existence of properties and whether a variable has been defined.

The web app endpoint is defined in `doGet.js`:

-   **`doGet(e)`**: This function serves as a test runner. If a URL parameter named `test` is provided, it executes the `test()` function (defined in `test.js`) and returns the output as plain text. This provides a simple way to trigger the project's test suite via an HTTP GET request.

```javascript
// Example from isNumber.js
var global = this;
/**
  @param {Number} n
  @return {Assert}
*/
function isNumber(n) {
  if(typeof n !== "number") throw "number: n is not a number.";
  return global;
}//isNumber

// Example from equal.js
function equal(v1, v2) {
  if(typeof v1 !== typeof v2) throw "equal: different types. typeof v1: " + typeof v1 + ", typeof v2: " + typeof v2;
  if(v1 !== v2) throw "equal: value is not equal. v1: " + v1 + ", v2: " + v2;
}//equal
```

## Web Interface

This project does not have a user-facing HTML interface. The `doGet(e)` function is configured to return plain text results from a test execution, making it suitable for use as a testing endpoint.

## Permissions

The web application is configured with the following permissions:

-   **Execution**: `USER_DEPLOYING` (the script runs with the identity and permissions of the user who deployed the web app).
-   **Access**: `ANYONE_ANONYMOUS` (the web app is accessible by anyone, including users not logged into a Google account).

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **Dependencies**: No external libraries or advanced Google services are enabled.

## Deployments

The project has two deployments:

-   **Deployment 1**:
    -   **ID**: `AKfycbyRlCKjGudCigQfHi_xpT-TGokkuYGVNukjxS8F32wj`
    -   **Target**: `@HEAD`
    -   **Description**: _(none)_
    -   **Published URL**: [Link](https://script.google.com/macros/s/AKfycbyRlCKjGudCigQfHi_xpT-TGokkuYGVNukjxS8F32wj/exec)
-   **Deployment 2 (Version 29)**:
    -   **ID**: `AKfycbxh9gLe6rAOYu_lR4R7j7qiYSDUZ_qhdVeGPhnS-PnzhIS_Dq6r`
    -   **Target**: `29`
    -   **Description**: `web app meta-version`
    -   **Published URL**: [Link](https://script.google.com/macros/s/AKfycbxh9gLe6rAOYu_lR4R7j7qiYSDUZ_qhdVeGPhnS-PnzhIS_Dq6r/exec)
