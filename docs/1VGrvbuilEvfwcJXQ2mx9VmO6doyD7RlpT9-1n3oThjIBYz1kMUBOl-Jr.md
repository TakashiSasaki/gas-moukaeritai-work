# Google Apps Script Project: 1VGrvbuilEvfwcJXQ2mx9VmO6doyD7RlpT9-1n3oThjIBYz1kMUBOl-Jr

## Project Overview
This Google Apps Script project is a web application designed for conducting surveys or experiments, likely focused on user choices, rankings, and preferences. It features a multi-page web interface where user interactions are recorded into a designated Google Sheet for data collection and analysis.

## Functionality

### `コード.js`
This file contains the server-side logic for handling web requests and recording user data.
-   **`doGet()`**: The entry point for the web application. It records the current timestamp into a Google Sheet (ID: `12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw`, Sheet: "シート1") and then serves the `index.html` template.
-   **`recordKojin(start_time, q1, q2, q3)`**: Records personal information (start time and three questions/answers) into the "Kojin" sheet.
-   **`recordPchoice(start_time, start_pchoice, qestion, element_id, element_value, element_checked)`**: Records practice choice results into the "pchoice" sheet.
-   **`recordPrank00`, `recordPrank01`, `recordPrank02(...)`**: Records practice ranking results into the "prank" sheet.
-   **`recordPbest00`, `recordPbest01`, `recordPbest02(...)`**: Records practice "best choice" results into the "pbest" sheet.
-   **`recordchoice01` to `recordchoice04(...)`**: Records main experiment choice results into the "choice" sheet. These functions are differentiated by the number of choices (6 or 8) and the presence of "superiority" (優越 - meaning dominance or preference).
-   **`recordrank01` to `recordrank44(...)`**: Records main experiment ranking results into the "rank" sheet. These functions are highly granular, categorized by choice count, "superiority," and different "rank" stages (e.g., `rank01` to `rank04`, `rank11` to `rank14`, etc.).
-   **`recordbest01` to `recordbest44(...)`**: Records main experiment "best choice" results into the "best" sheet. These functions are categorized by choice count, "superiority," and different "best" stages (e.g., unrestricted, required 2, required 3, optional 2, optional 3).
-   **`recordrest01`, `recordrest02`, `recordrest03(...)`**: Records data related to rest periods during the experiment into the "rest" sheet.
-   **`getNm()`**: Returns the content of the "nm" HTML template.
-   **`getTr(cc)`**: Reads data from the "物件" (property/item) sheet, filters it based on a given `cc` parameter, and then injects this data into the "tr" HTML template.

### Web Interface (`index.html` and other HTML files)
The `index.html` file serves as the main entry point for the web interface, which is composed of numerous dynamically included HTML templates.
-   **Structure**: The `index.html` file includes a `<style>` block with extensive CSS rules that initially hide most of the content (`display:none;`). It then dynamically includes content from a large number of other HTML files (e.g., `hosoku1.html`, `pchoice.html`, `rank01.html`, `best01.html`, etc.) using server-side includes (`<?!=HtmlService.createHtmlOutputFromFile("filename").getContent();?>` and `<?!=HtmlService.createTemplateFromFile("filename").evaluate().getContent();?>`).
-   **Multi-stage Interface**: The extensive use of `display:none;` for most sections suggests a multi-stage or interactive survey/experiment where different sections are revealed or hidden based on user interaction or client-side script logic.
-   **External Libraries**: The interface utilizes jQuery for client-side scripting.
-   **Client-side Script**: A small client-side script initializes a `start_time` variable, indicating that the timing of user interactions is a crucial aspect of the experiment.
-   **Survey Link**: The page includes a link to an external Google Forms survey (`https://goo.gl/MtFDSv`).

## Permissions
The `appsscript.json` manifest specifies the following web app execution permissions:
-   `webapp.access`: `ANYONE_ANONYMOUS` - This means the web application can be accessed by anyone, even without a Google account.
-   `webapp.executeAs`: `USER_DEPLOYING` - The script will execute with the identity and permissions of the user who deployed the web app.

## Configuration
This project relies on a specific Google Sheet (ID: `12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw`) for storing all collected data across various sheets within that spreadsheet (e.g., "シート1", "Kojin", "pchoice", "prank", "pbest", "choice", "rank", "best", "rest", "物件").

## Deployments
The project has two deployments:

1.  **Deployment 1 (HEAD)**:
    -   **ID**: `AKfycbwII4BHZbgpwPcEUc0iQu0Ks0OftjKwwn5zSO_skyQ`
    -   **Target**: `HEAD` (This deployment points to the latest saved version of the script).
    -   **Description**: (No specific description provided).
    -   **Published URL**: `https://script.google.com/macros/s/AKfycbwII4BHZbgpwPcEUc0iQu0Ks0OftjKwwn5zSO_skyQ/exec`

2.  **Deployment 2 (Version 15)**:
    -   **ID**: `AKfycbzeGbJwCa36rSEB60hvIiTQzkpqsjHVgxarhxvKpgFVzTHLZPQ`
    -   **Target**: `15`
    -   **Description**: "web app meta-version"
    -   **Published URL**: `https://script.google.com/macros/s/AKfycbzeGbJwCa36rSEB60hvIiTQzkpqsjHVgxarhxvKpgFVzTHLZPQ/exec`
