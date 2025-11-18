# Google Apps Script Project: 1RsAjkBTBEy4w8Q0kdStuJAXbAIcrnVqXvMGDj5nhQJkmZuMT3tBFTFoE

## Project Overview
This Google Apps Script project functions as a JWT (JSON Web Token) sandbox, primarily designed for demonstrating and testing HMAC-SHA256 signatures. It includes predefined JWT components (header, payload, key) and provides a web interface to visualize these components and their computed signatures.

## Functionality

### `コード.js`
This file contains the main logic and predefined JWT data.

-   **Global Variables**:
    -   `jwsHeader`: A JSON string representing the JWS Header (e.g., `{"typ":"JWT", "alg":"HS256"}`).
    -   `jwsPayload`: A JSON string representing the JWS Payload (e.g., `{"iss":"joe", "exp":1300819380, "http://example.com/is_root":true}`).
    -   `jwk`: A JSON string representing the JSON Web Key (JWK) used for signing.
    -   `jwsInput`: A base64-encoded string combining the header and payload.
    -   `signatureByteArray`: A byte array representing a pre-computed signature.
    -   `signatureBase64`: A base64-encoded string of a pre-computed signature.
    -   `keyBase64`: A base64-encoded string of the key.
-   **`doGet()`**: This function is the entry point for web app requests. It serves the `index.html` template, sets the viewport meta tag, and titles the page "JWT Sandbox".
-   **`test()`**: A test function that demonstrates the usage of `Utilities.computeHmacSha256Signature` with the predefined JWT components. It logs various intermediate steps, including base64 encoding/decoding and HMAC computation.
-   **`Hmac256WikipediaExample1()`**: Demonstrates HMAC-SHA256 computation using a Wikipedia example ("The quick brown fox jumps over the lazy dog" with key "key"). It returns the HMAC as a hexadecimal string.
-   **`test2()`**: Further tests HMAC-SHA256 computation using `jwsInput` and `keyBase64`.
-   **`testJwsInput()`**: Tests if the byte array representation of `jwsInput` matches a predefined byte array.
-   **`testKey()`**: Tests if the positive byte array representation of `keyBase64` matches a predefined byte array.
-   **`testSignature()`**: Tests if the positive byte array representation of `signatureBase64` matches `signatureByteArray`.

### `utils.js`
This file provides utility functions for byte array manipulation.

-   **`toPositiveByteArray(ba)`**: Converts a byte array (which can contain negative values in JavaScript's `byte` representation) into an array where all byte values are positive (0-255).
-   **`isEqualByteArray(ba1, ba2)`**: Compares two byte arrays for equality.
-   **`byteArrayToString(byte_array)`**: Converts a byte array to a string using `String.fromCharCode.apply`.
-   **`byteArrayToString2(ba)`**: Converts a byte array to a string by iterating through bytes and converting each to a character.
-   **`stringToByteArray(string)`**: Converts a string into a byte array by getting the character code of each character.

## Web Interface
The `index.html` file provides a simple web interface to interact with the JWT sandbox.

-   **Content Display**: It displays the raw and base64-encoded forms of the `jwsHeader`, `jwsPayload`, and `jwk` using `<textarea>` elements.
-   **Signature Calculation**: It dynamically calculates and displays the HMAC-SHA256 signature using the provided `jwsHeader`, `jwsPayload`, and `jwk` (specifically `JSON.parse(jwk).k`). The signature is shown in both raw and base64-encoded forms.
-   **No Client-side JavaScript**: The HTML file primarily uses server-side templating (`<?= ... ?>`) to render the content, meaning most calculations and displays are performed when the page is served, rather than interactively in the browser.

## Permissions
The `appsscript.json` manifest specifies the following web app execution permissions:
-   `webapp.access`: `ANYONE_ANONYMOUS` - This means the web application can be accessed by anyone, even without a Google account.
-   `webapp.executeAs`: `USER_DEPLOYING` - The script will execute with the identity and permissions of the user who deployed the web app.

## Configuration
This project does not explicitly list any external libraries or advanced services in its `appsscript.json`. All necessary configurations appear to be self-contained within the script's code and properties.

## Deployments
The project has two deployments:

1.  **Deployment 1 (HEAD)**:
    -   **ID**: `AKfycbzcE3giVJRdG8U5CpuYfX34rnBYSWHiQEj1A7uRjycU`
    -   **Target**: `HEAD` (This deployment points to the latest saved version of the script).
    -   **Description**: (No specific description provided).
    -   **Published URL**: `https://script.google.com/macros/s/AKfycbzcE3giVJRdG8U5CpuYfX34rnBYSWHiQEj1A7uRjycU/exec`

2.  **Deployment 2 (Version 1)**:
    -   **ID**: `AKfycbwYYTltOaKzGwc9mqNK-6Pd8j4yMb5TS96h0i2mhh1V85fULffp`
    -   **Target**: `1` (This deployment points to version 1 of the script).
    -   **Description**: "web app meta-version"
    -   **Published URL**: `https://script.google.com/macros/s/AKfycbwYYTltOaKzGwc9mqNK-6Pd8j4yMb5TS96h0i2mhh1V85fULffp/exec`
