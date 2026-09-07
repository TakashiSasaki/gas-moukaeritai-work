
/**
 * 現在のプロジェクトに設定されているすべてのトリガーを削除します。
 */
function deleteAllTriggers() {
  const allTriggers = ScriptApp.getProjectTriggers();
  
  if (allTriggers.length === 0) {
    console.log("削除するトリガーは見つかりませんでした。");
    return;
  }

  allTriggers.forEach(trigger => {
    const functionName = trigger.getHandlerFunction();
    ScriptApp.deleteTrigger(trigger);
    console.log(`関数「${functionName}」のトリガーを削除しました。`);
  });

  console.log(`合計 ${allTriggers.length} 個のトリガーをすべて削除しました。`);
}

/**
 * 【手動設定用】毎日20時〜21時に実行するようにトリガーを1つだけ設定してください。
 */
function dailyMainTrigger() {
  const date = new Date().getDate();
  
  // 8, 18, 28日でなければ何もしない（ここで条件判定）
  if (![8, 18, 28].includes(date)) {
    console.log(`今日は${date}日のため、実行をスキップします。`);
    return;
  }

  console.log(`${date}日の実行を開始します。最初の関数を予約します。`);
  // 最初の関数(1番)を1分後に実行するように予約
  createNextTrigger(1, 1);
}

/**
 * 各番号の関数を実行し、次の番号を予約する
 */
function relayExecutor(n) {
  // 1. 自分を呼び出したトリガーを削除（掃除）
  deleteTriggerByName("runRelay" + n);

  // 2. 本来の処理を実行
  console.log(`Step ${n}: executeAndSave(${n}) を実行します。`);
  try {
    executeAndSave(n);
  } catch (e) {
    console.error(`Error in Step ${n}: ${e.message}`);
  }

  // 3. 次の番号（10番まで）があれば、10分後に予約
  if (n < 10) {
    createNextTrigger(n + 1, 10);
    console.log(`次（Step ${n + 1}）を10分後に予約しました。`);
  } else {
    console.log("すべての工程（1〜10）が完了しました。");
  }
}

/**
 * 指定した分後に実行するトリガーを作成
 */
function createNextTrigger(nextN, minutesLater) {
  ScriptApp.newTrigger("runRelay" + nextN)
    .timeBased()
    .after(minutesLater * 60 * 1000)
    .create();
}

/**
 * 特定の関数名に紐付くトリガーを削除する
 */
function deleteTriggerByName(functionName) {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(t);
    }
  });
}

// --- トリガーから呼び出すための中継用関数（10個） ---
function runRelay1()  { relayExecutor(1); }
function runRelay2()  { relayExecutor(2); }
function runRelay3()  { relayExecutor(3); }
function runRelay4()  { relayExecutor(4); }
function runRelay5()  { relayExecutor(5); }
function runRelay6()  { relayExecutor(6); }
function runRelay7()  { relayExecutor(7); }
function runRelay8()  { relayExecutor(8); }
function runRelay9()  { relayExecutor(9); }
function runRelay10() { relayExecutor(10); }