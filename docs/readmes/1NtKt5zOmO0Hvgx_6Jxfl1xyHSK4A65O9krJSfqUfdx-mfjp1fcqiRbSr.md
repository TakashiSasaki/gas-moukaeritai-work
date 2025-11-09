# Project: 1NtKt5zOmO0Hvgx_6Jxfl1xyHSK4A65O9krJSfqUfdx-mfjp1fcqiRbSr

## Project Overview and Purpose

This Google Apps Script project, named "Random", is a comprehensive library for generating pseudo-random numbers and performing statistical analysis on them. It implements the Mersenne Twister algorithm for high-quality random number generation and provides various functions to generate random numbers in different formats (e.g., 31-bit integers, 32-bit integers, 8-bit, 16-bit, and 32-bit arrays, floating-point numbers in different ranges). Additionally, it includes utilities for computing statistical properties like counts, entropy, and identifying outliers in generated data. The project also features a web application interface, though it appears to be minimal.

## Core Functionality

The project's core is built around the Mersenne Twister algorithm, providing robust random number generation and statistical tools.

### Random Number Generation

*   **`Random_(seedStringArray)`**: The constructor for the `Random` object. It initializes the Mersenne Twister with a seed derived from an array of seed strings, incorporating current time and `Math.random()` for additional entropy.
*   **`createWithSeedString(seedString)`**: Creates a `Random` instance using a single, long seed string.
*   **`createWithSeedStrings(seedStrings)`**: Creates a `Random` instance using an array of seed strings.
*   **`createWithRandomSeed()`**: Creates a `Random` instance with a highly random seed derived from `Math.random()` and current time.
*   **`createWithFixedSeed()`**: Creates a `Random` instance with a fixed seed based on the script's URL, useful for reproducible sequences.
*   **`get31()`**: Returns a 31-bit random integer.
*   **`get32()`**: Returns a 32-bit random integer.
*   **`get01BothClose()`**: Returns a random floating-point number in the range `[0, 1]`.
*   **`get01BothOpen()`**: Returns a random floating-point number in the range `(0, 1)`.
*   **`get01RightOpen()`**: Returns a random floating-point number in the range `[0, 1)`.
*   **`get01RightOpen53bitResolution()`**: Returns a random floating-point number in the range `[0, 1)` with 53-bit resolution.
*   **`getInt8Array(len)`**: Returns an array of `len` random 8-bit signed integers.
*   **`getUint8Array(len)`**: Returns an array of `len` random 8-bit unsigned integers.
*   **`getInt16Array(len)`**: Returns an array of `len` random 16-bit signed integers.
*   **`getUint16Array(len)`**: Returns an array of `len` random 16-bit unsigned integers.
*   **`getInt32Array(len)`**: Returns an array of `len` random 32-bit signed integers.
*   **`getUint32Array(len)`**: Returns an array of `len` random 32-bit unsigned integers.
*   **`getBlob(len)`**: Returns a `Blob` object containing `len` random 8-bit signed integers.

```javascript
/**
  @param {Array}
*/
function Random_(seedStringArray){
  // ... (initialization of Mersenne Twister with seed) ...
  this.mt = new MersenneTwister();
  this.mt.init_by_array(this.keys, this.keys.length);
}//Random

/*
  @param {string} seedString
  @return {Random}
*/
function createWithSeedString(seedString) {
  // ... (logic to prepare seed strings) ...
  return new Random_(seedStrings);
}

/**
  @return {int} 32bit random integer value.
*/
function get32() {
  var v = globalInstance.get32();
  return v;
}

Random_.prototype.get32 = function(){
  return this.mt.genrand_int32();
}

/**
  @param {Number} len length
  @return {Array} an array of 8bit unsigned int.
*/
function getUint8Array(len){
  if(typeof len !== "number") throw "needs length";
  var a = [];
  while(a.length < len){
    var v = globalInstance.get32();
    var b1 = v >>> 24;
    var b2 = (v >>> 16) & 0xff;
    var b3 = (v >>> 8) & 0xff;
    var b4 = v  & 0xff;
    a.push(b1);
    a.push(b2);
    a.push(b3);
    a.push(b4);
  }//while
  return a.slice(0,len);
}
```

### Statistical Analysis Functions

*   **`computeCounts(values, minValue, maxValue)`**: Computes the frequency of each value within a given range in an array.
*   **`computeEntropy(count)`**: Calculates the entropy of a frequency distribution.
*   **`computeOutliers(count, bottomThreshold, topThreshold)`**: Identifies values that fall outside a specified range (outliers) based on their frequency.
*   **`computeStats(count)`**: Computes a comprehensive set of statistics for a frequency distribution, including sum, max, min, entropy, identical entropy, and outliers.
*   **`log2(x)`**: Computes the base-2 logarithm of `x`.
*   **`max(count)`**: Returns the maximum value in an array.
*   **`min(count)`**: Returns the minimum value in an array.
*   **`sum(count)`**: Computes the sum of all values in an array.
*   **`average(count)`**: Computes the average of all values in an array.

```javascript
function computeCounts(values, minValue, maxValue){
  var counts = new Array(maxValue - minValue + 1);
  for(var i=0; i<counts.length; ++i) counts[i]=0;
  for(var i=0; i<values.length; ++i){
    var value = values[i];
    counts[value-minValue]++;
  }//for
  return counts;
}

function computeEntropy(count) {
  var N = sum(count);
  var entropy = 0;
  for(var i in count) {
    var p = count[i] / N;
    entropy += - p  * log2(p);
  }//for
  return entropy;
}

function computeStats(count){
  return {
    N : sum(count),
    maxCount : max(count),
    minCount : min(count),
    entropy : computeEntropy(count),
    identicalEntropy : log2(count.length),
    outliers : computeOutliers(count)
  };
}
```

### Testing

*   **`test()`**: A function to run all internal tests within the project.

## Web Interface

The project includes a minimal web interface defined in `index.html`.

### `index.html`

This HTML file provides a basic page for the web application. It currently contains no visible content, suggesting it might be a placeholder or intended for future development of a user interface to interact with the random number generation and statistical analysis features.

```html
<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
  </head>
  <body>
    
  </body>
</html>
```

## Permissions

The `appsscript.json` manifest file specifies the following permissions and access settings:

*   **Time Zone:** `Asia/Tokyo`
*   **Exception Logging:** `STACKDRIVER`
*   **Dependencies:**
    *   **Libraries:**
        *   `Is_` (ID: `1ovfzNY0BUREXY5Ky0eX1HZaz3VxEoq3wyjwZuYg4L6m8H83Rjb8Q1yhw`, Version: `18`, Development Mode: `true`) - Likely used for type checking and validation.
        *   `Assert_` (ID: `10lJqYuurUoouFS-aPsPs4HU2s--Xkm5vTu7QVZH4HwcAZgtCDU6ZltQN`, Version: `29`, Development Mode: `true`) - Used for assertions and testing.
*   **Web App Access:** `ANYONE_ANONYMOUS` - The web application is accessible by anyone, even without a Google account.
*   **Web App Execution:** `USER_DEPLOYING` - The script runs under the identity of the user who deployed the web app.

## Configuration

The project uses a `globalInstance` of the `Random` object, initialized with `createWithRandomSeed()`, to provide a default source of randomness.

## Deployments

The project has the following deployments:

*   **Deployment ID:** `AKfycbzn1v1t80Mi14_us-OavdkbQsvw2E4G240mJ8gIajBW`
    *   **Target Version:** `HEAD`
    *   **Description:** (empty)
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbzn1v1t80Mi14_us-OavdkbQsvw2E4G240mJ8gIajBW/exec`

*   **Deployment ID:** `AKfycbyuozxZBLDWPjordLuqG3BerMK52zqSmnji9EFLjWGSWoP9EFLU`
    *   **Target Version:** `7`
    *   **Description:** `web app meta-version`
    *   **Published URL:** `https://script.google.com/macros/s/AKfycbyuozxZBLDWPjordLuqG3BerMK52zqSmnji9EFLjWGSWoP9EFLU/exec`
