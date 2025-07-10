function computeOutliers(count, bottomThreshold, topThreshold){
  if(bottomThreshold === undefined) bottomThreshold = 0.9;
  if(topThreshold === undefined) topThreshold = 1.1;
  var over = [];
  var below = [];
  var averageCount = average(count);
  for(var i=0; i<count.length; ++i){
    if(count[i] > averageCount * topThreshold){
      over.push([i, count[i]]);
    }//if
    if(count[i] < averageCount * bottomThreshold) {
      below.push([i, count[i]]);
    }//if
  }//for
  return {over:over, below:below};
}//computeOutliers

computeOutliers.test = function(){
  var count = [10, 9, 10, 6, 11, 16];
  var outliers = computeOutliers(count, 0.9, 1.1);
  Logger.log(outliers);
  //{over=[[5.0, 16.0]], below=[[1.0, 9.0], [3.0, 6.0]]}
  Assert_.equalArrayOfNumberArray(outliers.over, [[5.0, 16.0]]);
  Assert_.equalArrayOfNumberArray(outliers.below, [[1.0, 9.0], [3.0, 6.0]]);
}

function computeOutliersTest(){
  computeOutliers.test();
}