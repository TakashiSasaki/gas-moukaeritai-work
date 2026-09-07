"use strict";
/**
  @constructor
  @return {Journal}
*/
function Journal() {
  this.dirty = new Dirty();
  this.cache = new Cache();
  this.sht = new Sht(64,0);
  var sealed = Object.seal(this);
  return sealed;
}//Journal


Journal.prototype.flush = function(){
  var dirtyKeysAll = this.dirty.getDirtyAll();
  var rangeValues = [];
  for(var ssNumber = 0; ssNumber<64; ++ssNumber){
    for(var sheetNumber = 0; sheetNumber<64; ++sheetNumber){
      var dirtyItems = dirtyKeysAll[ssNumber][sheetNumber];
      if(dirtyItems === undefined) continue;
      for(var i=0; i<dirtyItems.length; ++i){
        var dirtyItem = dirtyItems[i];
        Assert.arrayLength(dirtyItem, 5);
        var k = dirtyItem[0];
        Assert.isString(k);
        var value = this.cache.get(k);
        Assert.isString(value);
        dirtyItem.push(value);
        Assert.arrayLength(dirtyItem, 6);
        rangeValues.push(dirtyItem);
      }//for
    }//for sheetNumber
  }//for ssNumber

  this.sht.append(rangeValues);
  this.dirty.clean();
}//Journal.flush

function JournalTest(){
  var dirty = new Dirty();
  dirty.clean();
  var cache = new Cache();
  cache.write("key-ABC", "value-Hello");
  cache.write("key-DEF", "value-HogeHoge");
  cache.write("key-123", "value-Sleepy");
  var count = dirty.count();
  Assert.equalNumbers(count, 3);
  var journal = new Journal();
  journal.flush();
}//JournalTest
