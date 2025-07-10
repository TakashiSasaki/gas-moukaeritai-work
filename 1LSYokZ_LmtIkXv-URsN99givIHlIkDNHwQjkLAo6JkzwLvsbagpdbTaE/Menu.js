//menuCaptions = ["Sheet appearance", "Misc"];
//app = SpreadsheetApp;
//function onOpen(){};
//eval(SidebarHelper.getEvaluable(this));
global=this;
function recreateMenu(e) {
  var ui = SpreadsheetApp.getUi();
  var addonMenu = ui.createAddonMenu();
  var subMenu;
  var addedFunctionNames = [];
  
  function add(item, caption){
    console.log(arguments.callee.name + " : type item = " + typeof item);
    if(typeof item === "object"/* && item.constructor.name === "Array"*/){
      for(var i=0; i<item.length; ++i){
        add(item[i][0], item[i][1]);
      }//for
      return;
    }//if

    if(typeof item === "string"){
      if(subMenu !== undefined){
        addonMenu.addSubMenu(subMenu);
      }
      subMenu = ui.createMenu(item);
      add(global[item]);
      return;
    }//if
    if(item === undefined){
      subMenu.addSeparator();
      return;
    }//if
    if(typeof item === "function"){
      console.log(addedFunctionNames);
      if(addedFunctionNames.indexOf(item.name) >= 0){
        throw "Function " + item.name + " already exists in the menu.";
      }//if
      addedFunctionNames.push(item.name);
      if(typeof item.caption === "string") {
      } else if(typeof item.title === "string"){
        item.caption = item.title;
      } else  if(typeof caption === "string") {
        item.caption = caption;
      } else {
        item.caption = item.name;
      }
      subMenu.addItem(item.caption, item.name);
      return;
    }//if
    throw "unexpected item : " + ""+item;
  }//add

  add("Database");
  add(appendObject);
  add(appendFieldName);
  add(setSpecialValuesToCells);
  add(showConstructorNameOfValuesInRange);
  add(showConstructorNameOfValuesInRangeByToStringCall);
  add(showJsonOfValuesInRange);
  add(showTypeOfValuesInRange);
  add("Trigger");
  add(showInstalledTriggers);
  add(deleteInstalledTriggers);
  add(addOnEditColorTrigger);
  add("Edit");
  add(placeCheckbox);
  //add(calcIndexOf);
  add("Edit sheet");
  add(adjustColumnWidth);
  add(createSheetByDate);
  add("Unicode");
  add("URL");
  add("Developer Metadata");
  add(showDeveloperMetadata);
  add("Dev");
  add("Help");
  add();
  add(arguments.callee);
  
  addonMenu.addSubMenu(subMenu);
  addonMenu.addToUi();
  return addedFunctionNames;
}//recreateMenu

recreateMenu.title = "Recreate the menu";


function onInstall() {
  recreateMenu();
}

function onOpen(){
  recreateMenu();
}

function invoke(f){
  if(f.input === undefined){
    throw new Error(f.name + ".input is undefined.");
  }//if
  if(f.output === undefined){
    throw new Error(f.name + ".output is undefined.");
  }//if
  var ui;
  var ss;
  var ranges = [];
  try {
    ui = SpreadsheetApp.getUi();
  } catch(e){
    ui = null;
    console.log(e);
  }//try
  ss = SpreadsheetApp.getActiveSpreadsheet();
  if(ss === null){
    console.log("No active spreadsheet.");
  } else {
    ranges = ss.getActiveRangeList();
  }//if

  if(f.input.match("^v+$")){
    if(ranges[0].length === f.input.match.length){
    } else {
    }
  } else {
    var input = f.input.split("");
    for(var i=0; i<input.length; ++i){
    }
    f.apply(args);
  }//if
}//invoke

function invokeTest(){
  function test(){
    console.log(arguments);
  }
  test.input="ab";
  test.output="o";
  //invoke(test);
  console.log([1,2][1]);
  console.log([1,2][2]);
  console.log([1,2][3]);
  console.log([1,2][4]);
  console.log("vv".match(/v+/));
}//invokeTest
