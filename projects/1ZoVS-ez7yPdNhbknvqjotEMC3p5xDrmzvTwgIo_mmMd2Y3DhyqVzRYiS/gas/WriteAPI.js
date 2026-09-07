function recordSticker(sheetName, xPercent, yPercent, stickerText) {
  if (!sheetName) {
    sheetName = "Sheet1";
    xPercent = 12.3;
    yPercent = 23.4;
    stickerText = "☺";
  }
  const lock = LockService.getUserLock();
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  lock.waitLock(1000);
  const lastRow = sheet.getLastRow();
  sheet.insertRowAfter(lastRow);
  const range = sheet.getRange(lastRow + 1, 1, 1, 4);
  range.setValues([[new Date(), xPercent, yPercent, stickerText]]);
  lock.releaseLock();
}//recordSticker
