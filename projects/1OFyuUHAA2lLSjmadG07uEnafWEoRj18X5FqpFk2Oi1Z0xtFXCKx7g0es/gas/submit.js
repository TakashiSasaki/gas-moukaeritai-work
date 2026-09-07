/**
  @param {String} 
  @returns {void}
*/
function cacheKenqwebRecords(kenqwebText) {
  var cache = CacheService.getUserCache();
  var records = CsvParser.tsvDocument(kenqwebText);
  var count = 0;
  for(row in records) {
    cache.put(count, JSON.stringify(records[row]));
    //kenqweb2Object(result[row]);
    count += 1;
  }
  return records.length;
}

function getKenqwebRecords(){
  var cache = CacheService.getUserCache();
  var count = 0;
  var records = [];
  for(;;++count){
    var jsonString = cache.get(count);
    if(jsonString === null) return records;
    var json = JSON.parse(jsonString);
    records.push(json);
  }
  return records;
}

function getDataObjectWithEnglishLabel(){
  var kenqwebRecords = getKenqwebRecords().slice(1);
  var researchmapRecords = kenqwebRecordsToResearchmapRecordsWithEnglishHeader(kenqwebRecords);
  var dataObject = recordsToDataObject(researchmapRecords);
  return dataObject;
}

function getDataObjectWithJapaneseLabel(){
  var kenqwebRecords = getKenqwebRecords().slice(1);
  var researchmapRecords = kenqwebRecordsToResearchmapRecordsWithJapaneseHeader(kenqwebRecords);
  var dataObject = recordsToDataObject(researchmapRecords);
  return dataObject;
}


/**
  @param {String[]} kenqwebRecord
  @returns {Object} 
*/
function kenqwebRecordToObject(kenqwebRecord) {
  var o = {};
  o["発表区分"] = kenqwebRecord[0];
  o["単独／共同"] = kenqwebRecord[1];
  o["演題・和文"] = kenqwebRecord[2];
  o["演題・英文"] = kenqwebRecord[3];
  o["データ区分"] = kenqwebRecord[4];
  o["学内全発表者"] = kenqwebRecord[5];
  o["学外全発表者"] = kenqwebRecord[6];
  o["発表年"] = kenqwebRecord[7];
  o["発表月"] = kenqwebRecord[8];
  o["実績集計年度"] = kenqwebRecord[9];
  o["国内／海外"] = kenqwebRecord[10];
  o["学会名"] = kenqwebRecord[11];
  o["備考・概要"] = kenqwebRecord[12];
  return o;
}

/**
  @param {Object} 
  @returns {String[]} researchmapRecord
*/
function objectToResearchmapRecord(o){
  var record = [];
  record.push(o["演題・和文"]);
  record.push(o["演題・英文"]);
  record.push((o["学内全発表者"] + "," + o["学外全発表者"]).replace(/【データ登録者】/g, ""));
  record.push((o["学内全発表者"] + "," + o["学外全発表者"]).replace(/【データ登録者】/g, ""));
  record.push(o["学会名"]);
  record.push(o["学会名"]);
  record.push(o["発表年"] + o["発表月"] + "00");
  record.push(""); //招待の有無 0無し 1有り
  record.push(""); //記述言語 en, ja,zh,fr,es,ru,de,other
  record.push(o["国内／海外"]); //会議区分 0デフォルト 1国内会議 2国際会議
  record.push(""); //会議種別 0デフォルト 1口頭発表（一般） 2口頭発表（招待・特別） 3口頭発表（基調）4ポスター発表 5シンポジウム・ワークショップパネル（公募） 6シンポジウム・ワークショップパネル（指名）7公開講演、セミナー、チュートリアル、講習、講義等 8メディア報道等 9その他
  record.push(""); //主催者（日本語）
  record.push(""); //主催者（英語）
  record.push(""); //開催地（日本語）
  record.push(""); //開催地（英語）
  record.push(""); //URL
  record.push(o["備考・概要"]); //概要（日本語）全角４００文字程度　２５０文字のみ表示
  record.push(o["備考・概要"]); //概要（英語）全角４００文字程度　２５０文字のみ表示
  return record;
}

/**
  @param {String[]}
  @returns {String[]}
*/
function kenqwebRecordToResearchmapRecord(kenqwebRecord){
  var o = kenqwebRecordToObject(kenqwebRecord);
  var researchmapRecord = objectToResearchmapRecord(o);
  return researchmapRecord;
}

/**
  @param {String[][]}
  @returns {String[][]}
*/
function kenqwebRecordsToResearchmapRecords(kenqwebRecords, header){
  var researchmapRecords = [header];
  for(var i in kenqwebRecords) {
    researchmapRecords.push(kenqwebRecordToResearchmapRecord(kenqwebRecords[i]));
  }
  return researchmapRecords;
}

function kenqwebRecordsToResearchmapRecordsWithJapaneseHeader(kenqwebRecords){
  return kenqwebRecordsToResearchmapRecords(kenqwebRecords, japaneseHeader);
}

function kenqwebRecordsToResearchmapRecordsWithEnglishHeader(kenqwebRecords){
  return kenqwebRecordsToResearchmapRecords(kenqwebRecords, englishHeader);
}

function testRecordsToDataObject(){
  var records = [
    ["a", "b", "c"],
    ["01","02","03"],
    ["A", "B", "C"]
  ];
  var dataObject = recordsToDataObject(records);
  Logger.log(dataObject);
}

function recordsToDataObject(records){
  var dataObject = {"cols": [], "rows": []};
  for(var i in records[0]) {
    dataObject.cols.push({label:records[0][i], type:"string"});
  }
  for(var i in records.slice(1)) {
    dataObject.rows.push({c:[]});
    for(var j in records.slice(1)[i]) {
      var lastRow = dataObject.rows[dataObject.rows.length - 1];
      lastRow.c.push({v:records.slice(1)[i][j]});
    }
  }
  return dataObject;
}


var japaneseHeader = ["タイトル(日本語)",
                      "タイトル(英語)",
                      "講演者(日本語)",
                      "講演者(英語)",
                      "会議名(日本語)",
                      "会議名(英語)",
                      "開催年月日",
                      "招待の有無",
                      "記述言語",
                      "会議区分",
                      "会議種別",
                      "主催者(日本語)",
                      "主催者(英語)",
                      "開催地(日本語)",
                      "開催地(英語)",
                      "URL",
                      "概要(日本語)",
                      "概要(英語)"];

var englishHeader = ["Title(English)",
                     "Title(Japanese)",
                     "Author(English)",
                     "Author(Japanese)",
                     "Conference(English)",
                     "Conference(Japanese)",
                     "Date",
                     "Invited talk",
                     "Language",
                     "Division",
                     "Assortment",
                     "Promoter(English)",
                     "Promoter(Japanese)",
                     "Venue(English)",
                     "Venue(Japanese)",
                     "URL",
                     "Description(English)",
                     "Description(Japanese)"];

var kenqwebHeader =   [
"発表区分","単独／共同","演題・和文","演題・英文","データ区分","学内全発表者",
"学外全発表者", "発表年", "発表月", "実績集計年度", "国内／海外", "学会名", "備考・概要"
];
