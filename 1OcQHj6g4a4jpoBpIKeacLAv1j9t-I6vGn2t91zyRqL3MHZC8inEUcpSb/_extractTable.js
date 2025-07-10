// Filename: _extractTable.gs
// This function processes input text by splitting it into lines.
// For lines that contain a hard tab ("\t"), the line is split by the tab character,
// and the resulting array is added to the intermediate state.
// The intermediate state (an array of arrays) is returned.

function _extractTable(inputText) {
  Logger.log("_extractTable, inputText");
  Logger.log(inputText);
  // Split the input text into individual lines using newlines
  var lines = inputText.split(/\r?\n/);
  var table = [];
  
  // Process each line to extract only those containing a hard tab
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf('\t') !== -1) {
      // Split the line by tab character and add the array of parts to the intermediate state
      table.push(lines[i].split('\t'));
    }
  }
  
  // Return the intermediate state object
  Logger.log("_extractTable, table");
  Logger.log(table);
  return table;
}// the end of _extractTable function

