function getMails(year) {
  if(year === undefined) year = 2023;
  const results = [];
  const threads = GmailApp.search(`from:noreply@tm.openai.com Your data export is ready after:${year}/1/1 before:${year}/12/31`);
  threads.forEach(thread=>{
   const messages = thread.getMessages();
    messages.forEach(message=>{
      const date = message.getDate();
      const body = message.getPlainBody();
      const m = body.match(/https:\/\/proddatamgmtqueue[a-zA-Z0-9%&=?.\/-]+/);
      results.push([date, m[0]]);
    });
  });
  console.log(results);
  return results;
}

function updateMailSheet(year){
  if(year === undefined) year = 2023;
  const s = getMailSheet(year);
  s.clear();
  const values = getMails(year);
  const range = s.getRange(1,1,values.length, 2);
  range.setValues(values);
}
