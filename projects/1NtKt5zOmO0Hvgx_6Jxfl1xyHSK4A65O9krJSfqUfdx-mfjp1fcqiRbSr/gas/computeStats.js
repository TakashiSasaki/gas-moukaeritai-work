function computeStats(count){
  return {
    N : sum(count),
    maxCount : max(count),
    minCount : min(count),
    entropy : computeEntropy(count),
    identicalEntropy : log2(count.length),
    outliers : computeOutliers(count)
  };
}

computeStats.test = function(){
  Logger.log(computeStats([5,7,5,5,3]));
}
