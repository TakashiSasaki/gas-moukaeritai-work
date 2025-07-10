function log2(x){
  return Math.log(x) / Math.LOG2E;
}

function max(count){
  return Math.max.apply(null, count);
}

function min(count){
  return Math.min.apply(null, count);
}

function sum(count){
  return count.reduce(function(prev, cur, i, arr){return prev + cur;});
}

function average(count){
  return sum(count) / count.length;
}
