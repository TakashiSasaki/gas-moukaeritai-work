function getSpreadsheet() {
  const lock = LockService.getUserLock();
  lock.waitLock(5000);
  const existingSsId = PropertiesService.getUserProperties().getProperty("SS_ID");
  if (existingSsId) {
    const existingSs = SpreadsheetApp.openById(existingSsId);
    if (existingSs) {
      return existingSs;
    } else {
      PropertiesService.getUserProperties().deleteProperty("SS_ID");
    }
  }

  const ssName = PropertiesService.getScriptProperties().getProperty("SS_NAME");
  const files = DriveApp.getFilesByName(ssName);

  if (files.hasNext()) {  // If there are files with the same name
    var ssId;
    while (files.hasNext()) {
      if (ssId) throw new Error(`Two or more files named name ${ssName}`);
      const ss = files.next();
      ssId = ss.getId();
    }//while    
    const existingSs = SpreadsheetApp.openById(ssId);
    if (existingSs) {
      const existingSsId = existingSs.getId();
      PropertiesService.getUserProperties().setProperty("SS_ID", existingSsId);
      return existingSs;
    } else {
      const newSs = SpreadsheetApp.create(ssName);
      if (newSs) {
        const newSsId = newSs.getId();
        PropertiesService.getUserProperties().setProperty("SSI_ID", newSsId);
        return newSs
      }//if
      throw new Error("Could not open the file with ID=${ssId} that should already exist.");
    }//if
  } else {
    var newSs = SpreadsheetApp.create(ssName);
    if (newSs) {
      const newSsId = newSs.getId();
      PropertiesService.getUserProperties().setProperty("SS_ID", newSsId);
      return newSs;
    }
    throw new Error(`No file named ${ssName}`);
  }//if
  const AUTHOR = PropertiesService.getScriptProperties().getProperty("AUTHOR");
  throw new Error("Something wrong with getSpreadsheet(). Please contact the author, ${AUTHOR}");
}//getSpreadsheet

function getSpreadsheetId(){
  const ss = getSpreadsheet();
  return ss.getId();
}

function getSpreadsheetUrl(){
  const ss = getSpreadsheet();
  return ss.getUrl();
}