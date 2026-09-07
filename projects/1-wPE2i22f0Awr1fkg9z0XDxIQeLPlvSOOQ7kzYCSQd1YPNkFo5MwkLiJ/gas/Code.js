function listTaskLists() {
  try {
    const taskLists = Tasks.Tasklists.list();
    if (!taskLists.items || taskLists.items.length === 0) {
      Logger.log('No task lists found.');
      return;
    }
    Logger.log('Task lists:');
    for (let i = 0; i < taskLists.items.length; i++) {
      const taskList = taskLists.items[i];
      Logger.log(`- ${taskList.title} (ID: ${taskList.id})`);
      // デフォルトリストかどうかをAPIレスポンスから直接判断する明確なプロパティは提供されていません。
      // 通常、最初に作成されるリストや、削除できないリストがデフォルトの役割を担います。
      // 前回の考察通り、「既定」という名前のリストがそれに該当する可能性が高いです。
    }
  } catch (e) {
    Logger.log('Error listing task lists: ' + e.toString());
  }
}