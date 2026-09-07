/*
  @param {string} seedString
  @return {Random}
*/
function createWithSeedString(seedString) {
  var l = seedString.length / 39;
  if (l < 256) {
    throw "Too short string as a seed";
  } //if
  var seedStrings = [];
  for (var i = 0; i < 39; ++i) {
    seedStrings.push(seedString.slice(i * l, (i + 1) * l));
  } //for i
  return new Random_(seedStrings);
} //createWithSeedString

createWithSeedString.test=function(){
  var seedString = new Array(256 * 39 + 1).join("!");
  var r1 = createWithSeedString(seedString);
  var v1 = r1.get32();
  Logger.log("createWithSeedString : " + v1);
}

/*
  @param {string[]} seedStrings
  @return {Random}
*/
function createWithSeedStrings(seedStrings) {
  return new Random_(seedStrings);
}//createWithSeedStringArray

createWithSeedStrings.test = function(){
  var seedString = new Array(256 + 1).join("#");
  var seedStrings = new Array(39);
  for(var i=0; i<seedStrings.length; ++i){
    seedStrings[i] = seedStrings;
  }
  var r1 = createWithSeedStrings(seedStrings);
  var v1 = r1.get32();
  Logger.log("createWithSeedStrings : " + v1);
}

/*
  @param {void}
  @return {Random}
*/
function createWithRandomSeed() {
  var seedStrings = [];
  for (var i = 0; i < 39; ++i) {
    var s = "";
    while (s.length < 256) {
      s += Math.random() + (new Date()).getTime();
    } //while
    seedStrings.push(s);
  } //for
  return new Random_(seedStrings);
} //createWithRandomSeed

createWithRandomSeed.test = function(){
  var r1 = createWithRandomSeed();
  var v1 = r1.get32();
  Logger.log("createWithRandomSeed : " + v1);
}

/*
  @param {void}
  @return {Random}
*/
function createWithFixedSeed() {
  var strings = [];
  for (var i = 0; i < 39; ++i) {
    var s = "";
    while (s.length < 256) {
      s += ScriptApp.getService().getUrl();
    } //while
    strings.push(s);
  } //for
  return new Random_(strings);
} //createWithFixedSeed

createWithFixedSeed.test = function(){
  var r1 = createWithFixedSeed();
  var v1 = r1.get32();
  Logger.log("createWithFixedSeed : " + v1);
}
