const folderName = 'ChatGPT Archives';

function getFolder() {

  const folderId = PropertiesService.getUserProperties().getProperty("folderId");
  if (folderId !== null) {
    const folder = DriveApp.getFolderById(folderId);
    return folder;
  }

  var folders = DriveApp.getFoldersByName(folderName);
  var filesArray = [];

  while (folders.hasNext()) {
    const folder = folders.next();
    filesArray.push(folder);

    console.log(filesArray);
  }
  if (filesArray.length === 1) {
    const folderId = filesArray[0].getId();
    PropertiesService.getUserProperties().setProperty("folderId", folderId);
    return filesArray[0];
  }

  if (filesArray.length === 0) {
    var folder = DriveApp.createFolder(folderName);
    PropertiesService.getUserProperties().setProperties("folderId", folder.getId());
    return folder;
  }

  throw new Error("There are more than one folders named 'ChatGPT Archives'.");
}//getFolder
