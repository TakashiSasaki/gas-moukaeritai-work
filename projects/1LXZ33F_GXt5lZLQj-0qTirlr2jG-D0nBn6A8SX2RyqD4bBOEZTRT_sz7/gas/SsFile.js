"use strict";

/**
  @constructor
  @param {String} ssNameStem
  @param {String} dateString
  @param {Number} ssNumber
  @return {SsFile}
*/
function SsFile(ssNameStem, dateString, ssNumber) {
  Assert.isString(ssNameStem);
  Assert.dateString(dateString);
  Assert.numberInRange(ssNumber, 0, 64)
  this.ssNameStem = ssNameStem;
  this.dateString = dateString;
  this.ssNumber = ssNumber;
  this.threeDigits = Str.addLeadingZero(ssNumber, 3);
  this.parentName = ssNameStem + " " + dateString
  this.ssName = this.parentName + " " + this.threeDigits;
  this.id = null;
  var sealed = Object.seal(this);
  this.id = null; //workaround for GAS bug
  return sealed;
}//SsFile

/**
  @return {String} Spreadsheet ID
*/
SsFile.prototype.create = function (){
  Assert.isNull(this.id);
  //Assert.isNull(this.ss);
  var ss = SpreadsheetApp.create(this.ssName);
  Assert.spreadsheet(ss);
  this.id = ss.getId();
  Assert.isString(this.id);
  return this.id;
}//SsFile.prototype.create

/**
  @return {void}
*/
SsFile.prototype.remove = function(){
  Assert.isString(this.id);
  var result = Drive.Files.remove(this.id);
  Assert.isNull(result);
  this.id = null;
}//SsFile.prototype.remove

/**
  @return {void}
*/
SsFile.prototype.find = function(){
  var q = "title contains '" + this.ssNameStem + "'";
  q += " and title contains '" + this.threeDigits + "'";
  q += " and title contains '" + this.dateString + "'";
  q += " and mimeType = 'application/vnd.google-apps.spreadsheet'";
  q += " and trashed = false";
  var list = Drive.Files.list({q:q});
  Assert.isArray(list.items);
  var files = list.items;
  Assert.arrayLength(files, 1);
  this.id = files[0].id;
}//Ss.prototype.find

/**
  @return {Boolean}
*/
SsFile.prototype.isRegistered = function(){
  Assert.isString(this.id);
  Assert.isInteger(this.ssNumber);
  var up = new Up();
  var registeredId = up.get("ss" + this.ssNumber);
  if(typeof registeredId !== "string") return false;
  return registeredId === this.id;
}//SsFile.prototype.isRegistered

/**
  @return {void}
*/
SsFile.prototype.register = function(){
  Assert.isString(this.id);
  Assert.numberInRange(this.ssNumber, 0, 64);
  var up = new Up();
  up.set("ss"+i, id);
}//SsFile.prototype.register

/**
  @return {void}
*/
SsFile.prototype.rename = function(newName) {
  Assert.isString(newName);
  Assert.isString(this.id);
  //var file = Drive.Files.get(this.id);
  Drive.Files.update({
    title: newName
  }, this.id);
}//SsFile.prototype.rename

function SsFileTest(){
  var ssFile = new SsFile("TestDatastore", "2019-11-27", 1);
  ssFile.create();
  ssFile.remove();
  for(var ssNumber=0; ssNumber<65; ++ssNumber){
    var ssFile = new SsFile("DataStore", "2019-11-25", ssNumber);
    ssFile.find();
    var bRegistered = ssFile.isRegistered();
    Assert.isTrue(bRegistered);
  }//ssNumber
}//SsFileTest
