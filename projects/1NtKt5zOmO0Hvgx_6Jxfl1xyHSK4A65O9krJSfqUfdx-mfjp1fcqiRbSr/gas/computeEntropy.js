function computeEntropy(count) {
  var N = sum(count);
  var averageCount =N/count.length;
  var entropy = 0;
  for(var i in count) {
    var p = count[i] / N;
    entropy += - p  * log2(p);
  }//for
  return entropy;
}//computeEntropy

