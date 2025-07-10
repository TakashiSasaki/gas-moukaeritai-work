/**
 * Filename: previewFileTabs.gs
 * previewFileTabs - Retrieves only the lines containing tab characters from the specified file,
 *                   splits each matching line by the tab character, and returns an array of arrays.
 *
 * For a PersonalDictionary.zip file, it unzips the file and reads dictionary.txt using UTF-8.
 * For an output file, it decodes the file using UTF-16.
 * The result for each file is cached for 10 minutes.
 *
 * @param {string} fileId - The ID of the target file (for dictionary.txt, this is the ID of the zip file)
 * @param {string} processedFile - The name of the file to process ("dictionary.txt" or the output file name)
 * @return {Array} An array of arrays, where each inner array contains the strings obtained by splitting a line on tab characters.
 */
function previewFileTabs(fileId, processedFile) {
  var cache = CacheService.getUserCache();
  var file = DriveApp.getFileById(fileId);
  // The cache key is generated from the file ID, processed file name, and the file's last updated time.
  var key = "preview_" + fileId + "_" + processedFile + "_" + file.getLastUpdated().getTime();
  var cached = cache.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    throw new Error('Server is busy, please try again later.');
  }
  try {
    var linesWithTabs = [];
    if (processedFile === "dictionary.txt") {
      // For PersonalDictionary.zip: unzip the file and obtain dictionary.txt (decoded as UTF-8)
      var blob = file.getBlob();
      var blobs = Utilities.unzip(blob);
      var dictBlob = null;
      for (var i = 0; i < blobs.length; i++) {
        if (blobs[i].getName && blobs[i].getName() === "dictionary.txt") {
          dictBlob = blobs[i];
          break;
        }
      }
      if (dictBlob === null) {
        throw new Error("dictionary.txt not found in zip file");
      }
      var text = dictBlob.getDataAsString(); // Decode as UTF-8
      var lines = text.split(/\r?\n/);
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf('\t') !== -1) {
          // Instead of returning the whole line, split by tab and push the resulting array.
          linesWithTabs.push(lines[i].split('\t'));
        }
      }
    } else {  // For output files (decoded as UTF-16)
      var blob = file.getBlob();
      var text = blob.getDataAsString("UTF-16"); // Decode as UTF-16
      var lines = text.split(/\r?\n/);
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf('\t') !== -1) {
          linesWithTabs.push(lines[i].split('\t'));
        }
      }
    }
    // Cache the result for 10 minutes (600 seconds)
    cache.put(key, JSON.stringify(linesWithTabs), 600);
    return linesWithTabs;
  } finally {
    lock.releaseLock();
  }
}

