# File Triage

## Overview

This Google Apps Script project, "File Triage," is a web application designed to help users organize files within their Google Drive. It provides a user interface for selecting a folder, viewing its contents, creating subfolders, and moving files. A key feature of this application is its integration with the Gemini API to automatically generate title suggestions for files and rename them.

## Functionality

The application provides a web-based interface for managing files in a selected Google Drive folder.

### Core Features

- **`doGet(e)`:** The main entry point for the web app, which renders the user interface.
- **Folder Management:**
    - `saveFolderId(folderId)`: Saves the selected folder ID to user properties.
    - `getSavedFolderInfo()`: Retrieves the saved folder information.
    - `listRootFolders()`: Lists all folders in the user's Google Drive root.
    - `getFolderContents()`: Retrieves the subfolders and files within the selected folder.
    - `createSubfolder(newFolderName)`: Creates a new subfolder.
- **File Management:**
    - `searchFiles(queryText)`: Searches for files within the selected folder.
    - `moveFilesToSubfolder(fileIds, destinationFolderName, currentFilterName)`: Moves files to a specified subfolder.
- **Gemini API Integration:**
    - `generateTitlesForFile(fileId, titleCount)`: Uses the Gemini API to generate a specified number of title suggestions for a file.
    - `renameFile(fileId, newTitle)`: Renames a file.
    - `generateAndRenameFile(fileId)`: Generates a single title suggestion and immediately renames the file.

### Code Examples

#### `gemini.js`
```javascript
function generateTitlesForFile(fileId, titleCount) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini APIキーが設定されていません。スクリプトプロパティを確認してください。');
  }
  
  const count = parseInt(titleCount, 10);
  if (isNaN(count) || count < 1 || count > 5) {
    throw new Error('無効なタイトル数です。1から5の間で指定してください。');
  }
  const promptText = `この文書の全体を読んで、内容を的確に表す日本語のタイトルを${count}つ考えてください。考えたタイトルだけを、余計な説明を付けずにマークダウンの箇条書きで出力してください。`;

  const geminiFile = uploadToGeminiById(fileId);

  // ... (API call to Gemini)
}
```

#### `Code.js`
```javascript
function moveFilesToSubfolder(fileIds, destinationFolderName, currentFilterName) {
  if (!fileIds || fileIds.length === 0) {
    throw new Error('移動対象のファイルが指定されていません。');
  }
  if (!destinationFolderName || destinationFolderName === '__ALL__') {
    throw new Error('移動先のフォルダが指定されていません。');
  }

  const userProperties = PropertiesService.getUserProperties();
  const folderId = userProperties.getProperty('incomingFolderId');
  if (!folderId) {
    throw new Error('起点となるフォルダが設定されていません。');
  }

  // ... (code to move files)
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

The project has three deployments:

- **ID (HEAD):** `AKfycbxS_89F7wf80xDUm3ARW4CakFj2Z4Cfl2zPBmEoDDyz`
  - **URL:** `https://script.google.com/macros/s/AKfycbxS_89F7wf80xDUm3ARW4CakFj2Z4Cfl2zPBmEoDDyz/exec`
- **ID (Version 2):** `AKfycbzvReMR-VKH5iJgUzDlvz00-JDibu7fr7yPzB8K5bEMAgfLbINXEunhH4BeW25VrtFqWw`
  - **URL:** `https://script.google.com/macros/s/AKfycbzvReMR-VKH5iJgUzDlvz00-JDibu7fr7yPzB8K5bEMAgfLbINXEunhH4BeW25VrtFqWw/exec`
- **ID (Version 1):** `AKfycbymlILmC4oBsr9g0-13__FspAJj9kwx65Cyo-msAetIcRoVcPYZ45SSjQcgqnVg5bjzfw`
  - **URL:** `https://script.google.com/macros/s/AKfycbymlILmC4oBsr9g0-13__FspAJj9kwx65Cyo-msAetIcRoVcPYZ45SSjQcgqnVg5bjzfw/exec`
