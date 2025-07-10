function computeCounts(values, minValue, maxValue){
  var counts = new Array(maxValue - minValue + 1);
  for(var i=0; i<counts.length; ++i) counts[i]=0;
  for(var i=0; i<values.length; ++i){
    var value = values[i];
    counts[value-minValue]++;
  }//for
  return counts;
}//computeCounts

computeCounts.test = function(){
  var values = [-2, -1, 0, 1, 2, -1];
  var counts = computeCounts(values, -2, 2);
  Assert_.equalNumberArray(counts, [1.0, 2.0, 1.0, 1.0, 1.0]);
  Logger.log(counts);
}//computeCounts.test

function computeCountsTest(){
  computeCounts.test();
}//computeCountsTest