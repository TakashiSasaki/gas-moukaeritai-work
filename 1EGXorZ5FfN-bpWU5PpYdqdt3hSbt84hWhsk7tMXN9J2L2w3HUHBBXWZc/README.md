# UUID generator

## Overview

This Google Apps Script project is a library for generating version 3 UUIDs (Universally Unique Identifiers). It provides a function to create a UUID based on a namespace and a name, using the MD5 hashing algorithm as specified in RFC 4122.

## Functionality

The library provides a single function for generating version 3 UUIDs.

### Core Features

- **`generateUUIDv3(namespaceUUID, name)`:** This function takes a namespace UUID and a name as input and returns a version 3 UUID. It works by concatenating the namespace and name, computing the MD5 hash of the result, and then formatting the hash into the standard UUID format.

### Code Examples

#### `uuidv3.js`
```javascript
function generateUUIDv3(namespaceUUID, name) {
  if (!namespaceUUID || !name) {
    throw new Error("Namespace and name must be provided");
  }

  // Convert namespace UUID to bytes
  const namespaceBytes = hexStringToBytes(namespaceUUID.replace(/-/g, ''));
  // Convert name to UTF-8 bytes
  const nameBytes = Utilities.newBlob(name).getBytes();

  // Concatenate bytes
  const dataBytes = namespaceBytes.concat(nameBytes);

  // Compute MD5 hash
  const md5hash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, dataBytes);
  const hexHash = digestToHex(md5hash);

  // Format into UUID
  const resultUUID = hexHash.substr(0, 8) + "-" +
                   hexHash.substr(8, 4) + "-" +
                   "3" + hexHash.substr(13, 3) + "-" +  // Set version to 3
                   adjustVariant(hexHash.substr(16, 4)) + "-" +
                   hexHash.substr(20);

  return resultUUID;
}
```

## Permissions

The `appsscript.json` file specifies that the web app is accessible to anyone anonymously and executes as the user who deployed it.

```json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}
```

## Deployments

The project has multiple deployments. The latest deployment is version 16.

- **ID (HEAD):** `AKfycbxpfdQ_opinLm4jnvqQQg1EsNBLODA49ZHAiYPLxf8r`
  - **URL:** `https://script.google.com/macros/s/AKfycbxpfdQ_opinLm4jnvqQQg1EsNBLODA49ZHAiYPLxf8r/exec`
- **ID (Version 16):** `AKfycby-x1Lu3i8CfTOZrvYr1yH3HeHx_TliBiUAMEIDWlST4RlWYsxvUZChWscioM4YqVRewA`
  - **URL:** `https://script.google.com/macros/s/AKfycby-x1Lu3i8CfTOZrvYr1yH3HeHx_TliBiUAMEIDWlST4RlWYsxvUZChWscioM4YqVRewA/exec`
