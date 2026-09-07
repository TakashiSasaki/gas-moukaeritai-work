/**
  @param {Array}
*/
function Random_(seedStringArray){
  this.sha512s = [];
  for(var i=0; i<seedStringArray.length; ++i) {
    var sha512 = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_512, 
                  seedStringArray[i] + (new Date()).getTime() + Math.random());
    this.sha512s = this.sha512s.concat(sha512);
  }//for i
  //Logger.log(this.sha512s);
  
  this.keys = [];
  for(var i=0; i<39; ++i){
    var b1 = this.sha512s[i*39];
    var b2 = this.sha512s[i*39+1];
    var b3 = this.sha512s[i*39+2];
    var b4 = this.sha512s[i*39+3];
    if(b1 < 0) b1 += 256;
    if(b2 < 0) b2 += 256;
    if(b3 < 0) b3 += 256;
    if(b4 < 0) b4 += 256;
    var dword = (b1<<24) ^ (b2<<16) ^ (b3<<8) ^ b4;
    //Logger.log(dword);
    this.keys.push(dword);
  }//for i
  
  // TODO: reproducibility
  this.mt = new MersenneTwister();
  this.mt.init_by_array(this.keys, this.keys.length);
}//Random
