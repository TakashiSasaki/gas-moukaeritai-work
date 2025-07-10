"use strict";

/**
  @param {String} ssNameStem
  @param {String} dateString
  @return {SsFolder}
*/
function SsFolder(ssNameStem, dateString) {
  Assert.isString(ssNameStem);
  this.ssNameStem = ssNameStem;
  Assert.dateString(dateString);
  this.dateString = dateString;
  this.folderName = ssNameStem + " " + dateString;
  this.folder = undefined;
  var sealed = Object.seal(this);
  //this.folder = null; //workaround for GAS bug
  return sealed;
}//SsFolder

/**
  @return {void}
*/
SsFolder.prototype.find =  function(){
  //Assert.isNull(this.folder);
  Assert.isUndefined(this.folder);
  var q = "title contains '" + this.ssNameStem + "'";
  q += " and title contains '" + this.dateString + "'";
  q += " and mimeType = 'application/vnd.google-apps.folder'";
  q += " and trashed = false";
  var list = Drive.Files.list({q:q});
  Assert.isArray(list.items);
  var items = list.items;
  if(items.length !== 1) throw "find: two or more folder.";
  this.folder = items[0];
  Assert.equalStrings(this.folder.kind, "drive#file");
  Assert.equalStrings(this.folder.mimeType, "application/vnd.google-apps.folder");
}//SsFolder.prototype.find

/**
  @return {void}
*/
SsFolder.prototype.create = function() {
  Assert.isString(this.folderName);
  Assert.isUndefined(this.folder);
  
  var newId = Drive.Files.generateIds({maxResults:1}).ids[0];
  Assert.isString(newId);
  
  this.folder = Drive.Files.insert({
      "mimeType": "application/vnd.google-apps.folder",
      "title": this.folderName
  });
  Assert.equalStrings(this.folder.kind, "drive#file");
  Assert.equalStrings(this.folder.mimeType, "application/vnd.google-apps.folder");
}//SsFolder.prototype.creatFolder

/**
  @return {void}
*/
SsFolder.prototype.remove = function(){
  var result = Drive.Files.remove(this.folder.id);
  this.folder = null;
}//SsFolder.prototype.remove

/**
  @param {SsFile} ssFile
  @return {void}
*/
SsFolder.prototype.add = function(ssFile) {
  Assert.instanceOf(this, SsFolder);
  Assert.instanceOf(ssFile, SsFile);
  Assert.isNumber(ssFile.ssNumber);
  Assert.equalStrings(this.folder.kind, "drive#file");
  Assert.equalStrings(this.folder.mimeType, "application/vnd.google-apps.folder");
  var result = Drive.Parents.insert(this.folder, ssFile.id);
  Drive.Parents.remove(ssFile.id, "root");
  return this;
}//SsFolder.prototype.add

function SsFolderTest(){
  var ssNameStem = "TestDatastore";
  var dateString = "2019-11-28";
  var ssFolder = new SsFolder(ssNameStem, dateString);
  Assert.isUndefined(ssFolder.folder);
  ssFolder.create();
  var ssFolder2 = new SsFolder(ssNameStem, dateString);
  Assert.isUndefined(ssFolder2.folder);
  ssFolder2.find();
  var ssFile = new SsFile(ssNameStem, dateString, 1);
  ssFile.create();
  ssFolder.add(ssFile);
  ssFolder.remove();
  
  var ssFolder3 = new SsFolder("DataStore", "2019-11-25");
  Assert.isUndefined(ssFolder3.folder);
  ssFolder3.find();
  Logger.log(ssFolder3.folder);
}//SsFolderTest
