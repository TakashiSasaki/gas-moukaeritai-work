# Project: Google Cloud Vision API ハンズオン GDG Shikoku

This Google Apps Script project is a web application designed for a hands-on workshop by GDG Shikoku, demonstrating the capabilities of the Google Cloud Vision API.

## Overview

The application provides a simple web interface where users can input an image URL. The script then fetches the image, encodes it in base64, and sends it to the Google Cloud Vision API for analysis. The analysis requests landmark, logo, and label detection.

## Functionality

The core logic is handled by the following functions in `コード.js`:

-   `doGet()`: This function is the entry point for the web app. It serves the `index.html` file, which contains the user interface.

    ```javascript
    function doGet() {
      var html_template = HtmlService.createTemplateFromFile("index");
      var html_output = html_template.evaluate();
      return html_output;
    }
    ```

-   `postApi(image_base64)`: This function takes a base64 encoded image string, constructs a request payload, and sends it to the `images:annotate` endpoint of the Google Cloud Vision API. It retrieves the necessary API key from the script's properties.

    ```javascript
    function postApi(image_base64){
      var api_key = PropertiesService.getScriptProperties().getProperty("ApiKey");
      var url = "https://vision.googleapis.com/v1/images:annotate?key=" + api_key;
      var payload = {
       "requests": [
          {
             "image": {
                "content": image_base64
             },
             "features": [
                {
                   "type": "LANDMARK_DETECTION",
                   "maxResults": "10"
                },
                {
                   "type": "LOGO_DETECTION",
                   "maxResults": "10"
                },
                {
                   "type": "LABEL_DETECTION",
                   "maxResults": "10"
                }
             ]
          }
       ]
      };

      UrlFetchApp.fetch(url, {
       "headers": {"Content-Type":"application/json"},
       "payload" : payload
      });
    }
    ```

## Web Interface

The user interface is defined in `index.html`. It consists of:
- An input field for the image URL.
- A button to trigger the image fetching.
- A textarea to display the base64 representation of the image.
- A button to send the image to the Cloud Vision API.
- A textarea to display the results from the API.

## Permissions

The permissions for this web app are defined in the `appsscript.json` file:

-   **Who can access the app**: The `access` property is set to `ANYONE_ANONYMOUS`. This means anyone on the internet can access the web app, even without being logged into a Google account.
-   **Who the app runs as**: The `executeAs` property is set to `USER_DEPLOYING`. This means the script executes with the identity and permissions of the Google account that created the deployment. Any actions performed by the script (like calling APIs) will be attributed to the deploying user.

## Configuration

-   **API Key**: The Google Cloud Vision API key is expected to be stored as a script property named `ApiKey`.

## Deployments

The project has the following deployments:

-   **Deployment ID**: `AKfycbx3MemFjc-LFvbERtjXm4E5bt4VtJQsMxHCMGrJe3Vi`
    -   **Target**: `@HEAD`
    -   **Description**: _(none)_
    -   **Published URL**: [Link](https://script.google.com/macros/s/AKfycbx3MemFjc-LFvbERtjXm4E5bt4VtJQsMxHCMGrJe3Vi/exec)

-   **Deployment ID**: `AKfycbybQ7kJ_JzM3UCaM7-ILi9QP7RfuXLDPthCl0xes-f6x1FIIP10`
    -   **Target**: Version `1`
    -   **Description**: web app meta-version
    -   **Published URL**: [Link](https://script.google.com/macros/s/AKfycbybQ7kJ_JzM3UCaM7-ILi9QP7RfuXLDPthCl0xes-f6x1FIIP10/exec)
