# Project: AddonHelper Library

This Google Apps Script project is a utility library named "AddonHelper" designed to simplify the development of Google Workspace Add-ons for applications like Google Sheets, Docs, or Slides. It provides core functionalities for creating custom menus, displaying interactive sidebars, and integrating external web content into these sidebars.

## Overview

The primary purpose of this library is to abstract away common boilerplate code associated with Google Workspace Add-on development. It enables developers to quickly set up menus and dynamic sidebars, including the ability to pull and cache HTML, CSS, and JavaScript from external sources like `jsrun.it`.

## Functionality

The library's functionality is distributed across `install.js`, `menu.js`, `sidebar.js`, and `sidebarTemplate.html`.

### Core Features

-   **`installAddon(app, global, jsdoitUser, jsdoitCodeId, templateParameter)`**: This is the main entry point for setting up an add-on.
    -   It takes an `app` object (e.g., `SpreadsheetApp`, `DocumentApp`, `SlidesApp`) to interact with the host application's UI.
    -   A `global` object (typically `this` from the parent script) is used to discover functions for menu items.
    -   Optional `jsdoitUser` and `jsdoitCodeId` parameters allow for dynamically loading and displaying content from `jsrun.it` in a sidebar.
    -   An optional `templateParameter` object can be passed to the sidebar's HTML template.
-   **`installAddonMenu_(ui, global)`**: A helper function that creates a custom add-on menu. It iterates through functions in the provided `global` object, adding them as menu items if they have a `title` property and do not start or end with an underscore (`_`).
-   **`showSidebar_(ui, jsdoitUser, jsdoitCodeId, templateParameter)`**: A helper function responsible for creating and displaying a sidebar.
    -   It fetches HTML, CSS, and JavaScript content from `jsrun.it` using the provided `jsdoitUser` and `jsdoitCodeId`.
    -   The fetched content is cached using `CacheService.getScriptCache()` for 30 seconds to improve performance.
    -   The content is then injected into `sidebarTemplate.html` and displayed as a sidebar in the host application's UI.

### Code Examples

#### `install.js`

```javascript
/**
  @param app {SpreadsheetApp|DocumentApp|SlidesApp}
  @param global {object} global object of parent script
  @param jsdoitUser {string} optional
  @param jsdoitCodeId {string} optional
  @param templateParameter {object} optional
  @return {void}
*/
function installAddon(app, global, jsdoitUser, jsdoitCodeId, templateParameter) {
  if(app === undefined) {
    throw "installAddon: requires SpreadsheetApp, DocumentApp or SlidesApp.";
  }
  var ui = app.getUi();
  if(typeof global === "object") {
    installAddonMenu_(ui, global);
  }
  if(typeof jsdoitUser === "string" || typeof jsdoitCodeId === "string") {
    showSidebar_(ui, jsdoitUser, jsdoitCodeId, templateParameter)
  }
}
```

#### `menu.js`

```javascript
/**
  enumerate functions in the global object and put them into add-on menu.
  Functions whose name begin or end with _ are ignored.
  Each function should have title property.
  
  @param global {object}
  @param ui {Ui}
  @return {void}
*/
function installAddonMenu_(ui, global) {
  var functionNames = [];
  var menu = ui.createAddonMenu();

  for(var i in global) {
    var f = global[i];
    if(toString.call(f) !== "[object Function]") continue;
    if(i.match(/_.*/)) continue;
    if(i.match(/.*_^/)) continue;
    if(f.title === undefined) continue;
    menu.addItem(f.title, i);
  }
  menu.addToUi();
}
```

#### `sidebar.js`

```javascript
/**
  import HTML/CSS/JS from JSDO.IT and show it in UI sidebar.
  
  @param ui {Ui}
  @param jsdoitUser {string}
  @param jsdoitCodeId {string}
  @param templateParameter {object} optional
  @return {void}
*/
function showSidebar_(ui, jsdoitUser, jsdoitCodeId, templateParameter){
  var jsdoitPrefix = jsdoitUser + "/" + jsdoitCodeId + "/";
  
  var html = CacheService.getScriptCache().get(jsdoitPrefix);
  if(html === null) {
    html = UrlFetchApp.fetch("http://jsrun.it/" + jsdoitPrefix).getContentText();
    CacheService.getScriptCache().put(jsdoitPrefix + "html", html, 30);
  }
  var m = html.match(/<title>(.+) - js do it<\/title>/);
  var title = m[1];

  var body = CacheService.getScriptCache().get(jsdoitPrefix + "html");
  if(body === null) {
    body = UrlFetchApp.fetch("http://jsrun.it/" + jsdoitPrefix +"html").getContentText();
    CacheService.getScriptCache().put(jsdoitPrefix + "body", body, 30);
  }
  var css = CacheService.getScriptCache().get(jsdoitPrefix + "css");
  if(css === null) {
    css = UrlFetchApp.fetch("http://jsrun.it/" + jsdoitPrefix + "css").getContentText();
    CacheService.getScriptCache().put(jsdoitPrefix + "css", css, 30);
  }
  var js = CacheService.getScriptCache().get(jsdoitPrefix + "js");
  if(js === null) {
    js = UrlFetchApp.fetch("http://jsrun.it/" + jsdoitPrefix +"js").getContentText();
    CacheService.getScriptCache().put(jsdoitPrefix + "js", js, 30);
  }
  var bodyTemplate = HtmlService.createTemplate(body);
  
  if(templateParameter !== undefined) {
    for(var i in templateParameter){
      bodyTemplate[i] = templateParameter[i];
    }
  }
  var sidebar = HtmlService.createTemplateFromFile("sidebarTemplate");
  sidebar.body = bodyTemplate.evaluate().getContent();
  sidebar.css = css;
  sidebar.js = js;
  ui.showSidebar(sidebar.evaluate().setTitle(title));
}
```

## Web Interface (`sidebarTemplate.html`)

The `sidebarTemplate.html` serves as a flexible container for the add-on's sidebar content. It uses Bootstrap for styling and includes placeholders for dynamic content:

-   **`<?!=css?>`**: Injects dynamically fetched CSS from `jsrun.it`.
-   **`<?!=body?>`**: Injects the main HTML body content, also fetched from `jsrun.it`.
-   **`<?!=js?>`**: Injects dynamically fetched JavaScript from `jsrun.it`.

## Permissions

The `appsscript.json` file specifies no explicit OAuth scopes or library dependencies. As a library, it will inherit the permissions of the Google Apps Script project that uses it.

## Configuration

-   **Time Zone**: The project is configured for the `Asia/Tokyo` time zone.
-   **Dependencies**: No external libraries are explicitly listed in `appsscript.json`.
-   **Caching**: Utilizes `CacheService.getScriptCache()` to cache external HTML, CSS, and JavaScript content fetched from `jsrun.it`.

## Deployments

This project is intended to be deployed as a Google Apps Script library, to be included and used by other add-on projects. Specific deployment IDs and URLs would be available from the Google Apps Script project's deployment history.
