/**
  @param {Array} arr
  @return {Object}
*/
function getIndexOf(arr) {
  var ui = SpreadsheetApp.getUi();
  var ranges = SpreadsheetApp.getActiveRangeList().getRanges();
  if (
    ranges.length != 2 ||
    ranges[0].getNumRows() != 1 ||
    ranges[1].getNumColumns() != 2
  ) {
    ui.alert(
      [
        "Select two ranges. The first range is used for input and it should have one row.",
        "The second range is used for output and it should have two columns.",
        "The left column has values to search for.",
        "The indices will be stored at the right column."
      ].join(" ")
    );
    return;
  }
  var inputRange = ranges[0];
  var outputRange = ranges[1];
  var list = inputRange.getValues()[0];
  var outputRangeValues = outputRange.getValues();
  for(var i=0; i<outputRangeValues.length; ++i){
    outputRangeValues[i][1] = list.indexOf(outputRangeValues[i][0]);
  }//for
  outputRange.setValues(outputRangeValues);
} //calcIndexOf
getIndexOf.input = "a"; //array, A for array of array
getIndexOf.output = "o"; //object
getIndexOf.caption=getIndexOf.name;

