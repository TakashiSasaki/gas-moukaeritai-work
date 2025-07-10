function doGet() {
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("シート1");
  var number_format = sheet.getRange(1,1).getNumberFormat();
  sheet.insertRowsBefore(1,1);
  var now = new Date();
  sheet.getRange(1,1,1,1).setValues([[now]]);
  sheet.getRange(1,1,1,1).setNumberFormat(number_format);
  var html_template = HtmlService.createTemplateFromFile("index");
  var html_output = html_template.evaluate();
  return html_output;
}
//個人情報の記録
function recordKojin(start_time,q1,q2,q3){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("Kojin");
  sheet.insertRowsBefore(1,1);
  var range = sheet.getRange(1,1,1,4);
  range.setValues([[start_time,q1,q2,q3]]);
}
//練習の選択結果の記録
function recordPchoice(start_time, start_pchoice, qestion, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("pchoice");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, start_pchoice, qestion, element_id, element_value, element_checked]]);
}
//練習の順位付け結果の記録
function recordPrank00(start_time, start_prank00,click_time, element_id, element_value, element_checked) {
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("prank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, start_prank00,click_time, element_id, element_value, element_checked]]);
}
function recordPrank01(start_time, start_prank01,click_time, element_id, element_value, element_checked) {
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("prank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, start_prank01,click_time, element_id, element_value, element_checked]]);
}
function recordPrank02(start_time, start_prank02,click_time, element_id, element_value, element_checked) {
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("prank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, start_prank02,click_time, element_id, element_value, element_checked]]);
}
//練習の上位選択結果の記録
function recordPbest00(start_time, start_pbest00,click_time, element_id, element_value, element_checked) {
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("pbest");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, start_pbest00,click_time, element_id, element_value, element_checked]]);
}
function recordPbest01(start_time, start_pbest01,click_time, element_id, element_value, element_checked) {
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("pbest");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, start_pbest01,click_time, element_id, element_value, element_checked]]);
}
function recordPbest02(start_time, start_pbest02,click_time, element_id, element_value, element_checked) {
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("pbest");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, start_pbest02,click_time, element_id, element_value, element_checked]]);
}

//本番のデータ
//選択結果の記録｛choice01:(選択肢数6，優越なし)，choice02:(選択肢数6，優越あり)，choice03:(選択肢数8，優越なし)，choice04:(選択肢数8，優越あり)｝
function recordchoice01(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("choice");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordchoice02(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("choice");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordchoice03(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("choice");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordchoice04(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("choice");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}


//順位付け結果の記録
//          ｛rank01:(選択肢数6，優越なし)，rank02:(選択肢数6，優越あり)，rank03:(選択肢数8，優越なし)，rank04:(選択肢数8，優越あり)｝
function recordrank01(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordrank02(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordrank03(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordrank04(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
//          ｛rank11:(選択肢数6，優越なし)，rank12:(選択肢数6，優越あり)，rank13:(選択肢数8，優越なし)，rank14:(選択肢数8，優越あり)｝
function recordrank11(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordrank12(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordrank13(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordrank14(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
//          ｛rank21:(選択肢数6，優越なし)，rank22:(選択肢数6，優越あり)，rank23:(選択肢数8，優越なし)，rank24:(選択肢数8，優越あり)｝
function recordrank21(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordrank22(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordrank23(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordrank24(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
//          ｛rank31:(選択肢数6，優越なし)，rank32:(選択肢数6，優越あり)，rank33:(選択肢数8，優越なし)，rank34:(選択肢数8，優越あり)｝
function recordrank31(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordrank32(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordrank33(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordrank34(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}

//          ｛rank41:(選択肢数6，優越なし)，rank42:(選択肢数6，優越あり)，rank43:(選択肢数8，優越なし)，rank44:(選択肢数8，優越あり)｝
function recordrank41(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordrank42(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordrank43(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordrank44(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rank");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}

//上位選択結果の記録
//制限なし｛best01:(選択肢数6，優越なし)，best02:(選択肢数6，優越あり)，best03:(選択肢数8，優越なし)，best04:(選択肢数8，優越あり)｝
function recordbest01(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordbest02(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordbest03(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordbest04(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
//必須2｛best11:(選択肢数6，優越なし)，best12:(選択肢数6，優越あり)，best13:(選択肢数8，優越なし)，best14:(選択肢数8，優越あり)｝
function recordbest11(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordbest12(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordbest13(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordbest14(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}

//必須3｛best21:(選択肢数6，優越なし)，best22:(選択肢数6，優越あり)，best23:(選択肢数8，優越なし)，best24:(選択肢数8，優越あり)｝
function recordbest21(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordbest22(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordbest23(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordbest24(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
//任意2｛best31:(選択肢数6，優越なし)，best32:(選択肢数6，優越あり)，best33:(選択肢数8，優越なし)，best34:(選択肢数8，優越あり)｝
function recordbest31(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordbest32(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordbest33(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordbest34(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
//任意3｛best41:(選択肢数6，優越なし)，best42:(選択肢数6，優越あり)，best43:(選択肢数8，優越なし)，best44:(選択肢数8，優越あり)｝
function recordbest41(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordbest42(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordbest43(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}
function recordbest44(start_time, end_,click_time, element_id, element_value, element_checked){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("best");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,6);
  range.setValues([[start_time, end_,click_time, element_id, element_value, element_checked]]);
}

//休憩
function recordrest01(start_time, end_best33, click_time,aa){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rest");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,4);
  range.setValues([[start_time, end_best33, click_time,aa]]);
}
function recordrest02(start_time, h, click_time,aa){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rest");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,4);
  range.setValues([[start_time, h, click_time,aa]]);
}
function recordrest03(start_time, h, click_time,aa){
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("rest");
  sheet.insertRowsBefore(1,1);  
  var range = sheet.getRange(1,1,1,4);
  range.setValues([[start_time, h, click_time,aa]]);
}

//属性値の読み込み
function getNm(){
  var htmlTemplate = HtmlService.createTemplateFromFile("nm");
  var htmlOutput = htmlTemplate.evaluate();
  return htmlOutput.getContent();
}

function getTr(cc){
  var htmlTemplate = HtmlService.createTemplateFromFile("tr");
  var sheet = SpreadsheetApp.openById("12D-ZMx10I3Yfaq2X_L1U5auMkKAu1gDRaOKJVRyNYUw").getSheetByName("物件");
  var range = sheet.getRange(1, 1, 25, 49);
  var values = range.getValues();
  var items = [];
  for(var i in values[0]) {
    if(cc === values[0][i]) {
      var range2 = sheet.getRange(1, Number(i)+1, 26, 1);
      var values2 = range2.getValues();
      for(var j in values2) {
        var x = values2[j][0];
        var y = Number(x);
      if(y>=1 && y<=8) {
          items[y-1] = [values[j][0],values[j][1],values[j][2],values[j][3]];
        }
      }
    }
  }
  htmlTemplate.items = items;
  var htmlOutput = htmlTemplate.evaluate();
  return htmlOutput.getContent();
}

//function testGetTr(){
//  Logger.log(getTr("choice01"));
//}