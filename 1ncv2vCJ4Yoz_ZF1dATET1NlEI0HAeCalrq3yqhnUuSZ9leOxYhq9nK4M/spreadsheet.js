/**
 * @fileoverview
 * Googleスプレッドシートへのデータ保存に関するすべての関数を管理します。
 */

/**
 * [Web App用] レコードをGoogleスプレッドシートに保存します。
 * スクリプト全体で同時に1つのプロセスのみ実行されるようにLockServiceで排他制御を行います。
 * @param {object[]} records 保存するDNSレコードの配列。
 * @return {string} 保存先のスプレッドシートのURL。
 */
// function saveRecordsToSheet(records) {
//   if (!records || records.length === 0) {
//     throw new Error('保存するレコードがありません。');
//   }
  
//   // スクリプト全体で共有されるロックを取得します。
//   const lock = LockService.getScriptLock();
//   // 最大10秒間ロックの取得を試みます。
//   const lockAcquired = lock.tryLock(10000);

//   // ロックを取得できなかった場合（他のプロセスが実行中の場合）
//   if (!lockAcquired) {
//     Logger.log(`[SaveToSheet] Could not acquire lock. Another process is running.`);
//     throw new Error('サーバーが現在他のリクエストを処理中です。しばらく待ってからもう一度お試しください。');
//   }

//   // エラーが発生しても必ずロックが解放されるように、try...finallyブロックを使用します。
//   try {
//     Logger.log(`[SaveToSheet] Lock acquired. Starting save process.`);
//     const spreadsheet = getOrCreateSpreadsheet();
//     const headers = ['type', 'hostname', 'value', 'ttl', 'priority']; // ヘッダーの順序を固定
//     const data = [headers];
//     records.forEach(record => {
//       data.push(headers.map(header => record[header]));
//     });

//     // 1. タイムスタンプ付きのシートに保存
//     const timestamp = Utilities.formatDate(new Date(), 'JST', 'yyyy-MM-dd HH:mm:ss');
//     const timestampSheet = spreadsheet.insertSheet(timestamp, 0);
//     timestampSheet.getRange(1, 1, data.length, headers.length).setValues(data);
//     timestampSheet.autoResizeColumns(1, headers.length);
//     timestampSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
//     timestampSheet.setFrozenRows(1);

//     // 2. 'new' という名前のシートに保存（常に上書き）
//     let newSheet = spreadsheet.getSheetByName('new');
//     if (newSheet) {
//       newSheet.clear();
//     } else {
//       newSheet = spreadsheet.insertSheet('new', 0);
//     }
//     newSheet.getRange(1, 1, data.length, headers.length).setValues(data);
//     newSheet.autoResizeColumns(1, headers.length);
//     newSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
//     newSheet.setFrozenRows(1);
    
//     return spreadsheet.getUrl();

//   } catch (e) {
//     Logger.log(`Error saving to sheet: ${e.toString()}`);
//     throw new Error(`スプレッドシートへの保存中にエラーが発生しました: ${e.message}`);
//   } finally {
//     // 処理が成功してもエラーで終了しても、必ずロックを解放します。
//     lock.releaseLock();
//     Logger.log(`[SaveToSheet] Lock released.`);
//   }
// }


/**
 * スクリプトプロパティからIDを取得してスプレッドシートを開くか、
 * 存在しない場合は新しく作成します。
 * @return {GoogleAppsScript.Spreadsheet.Spreadsheet} スプレッドシートオブジェクト。
 */
// function getOrCreateSpreadsheet() {
//   const properties = PropertiesService.getScriptProperties();
//   const spreadsheetId = properties.getProperty('SPREADSHEET_ID');
//   let spreadsheet;

//   if (spreadsheetId) {
//     try {
//       spreadsheet = SpreadsheetApp.openById(spreadsheetId);
//       Logger.log(`Opened existing spreadsheet: ${spreadsheet.getName()}`);
//       return spreadsheet;
//     } catch (e) {
//       Logger.log(`Could not open spreadsheet with ID ${spreadsheetId}. Creating a new one. Error: ${e.message}`);
//     }
//   }
  
//   spreadsheet = SpreadsheetApp.create('DNS Record Extractor Results');
//   const id = spreadsheet.getId();
//   properties.setProperty('SPREADSHEET_ID', id);
//   Logger.log(`Created new spreadsheet. Name: ${spreadsheet.getName()}, ID: ${id}`);
  
//   return spreadsheet;
// }