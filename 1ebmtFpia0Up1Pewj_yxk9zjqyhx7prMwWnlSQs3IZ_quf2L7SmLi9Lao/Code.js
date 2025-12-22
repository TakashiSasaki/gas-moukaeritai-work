/**
 * 構成定数
 */
const CONFIG = {
  CACHE: {
    VERSION: 'v2',
    TTL: 600,
    PREFIX_STATS: 'stats_', 
    PREFIX_DEFAULT: 'sys_def_id'
  },
  API: {
    SLEEP_MS: 500
  }
};

/**
 * Webアプリケーションのエントリーポイント (ルーティング機能付き)
 */
function doGet(e) {
  // ?page=readme が指定された場合はドキュメントを表示
  if (e.parameter.page === 'readme') {
    return HtmlService.createTemplateFromFile('README')
      .evaluate()
      .setTitle('Google Tasks Manager - Help')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }

  // デフォルトはメインアプリを表示
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Google Tasks Manager')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * フロントエンドから現在のアプリURLを取得するための関数
 */
function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}

/**
 * ユーザーの全タスクリストを取得
 */
function getTaskLists(forceRefresh = false) {
  const cache = CacheService.getUserCache();
  try {
    const taskLists = Tasks.Tasklists.list();
    if (!taskLists.items) return [];

    let defaultListId = null;
    if (!forceRefresh) defaultListId = cache.get(getKey(CONFIG.CACHE.PREFIX_DEFAULT));
    if (!defaultListId) {
      try {
        const defaultList = Tasks.Tasklists.get('@default');
        defaultListId = defaultList.id;
        cache.put(getKey(CONFIG.CACHE.PREFIX_DEFAULT), defaultListId, CONFIG.CACHE.TTL);
      } catch (e) { console.warn('デフォルトリスト特定失敗:', e); }
    }

    const cacheKeys = taskLists.items.map(list => getListStatsKey(list.id));
    const cachedBlobs = forceRefresh ? {} : cache.getAll(cacheKeys);

    return taskLists.items.map(list => {
      const key = getListStatsKey(list.id);
      const cachedJson = cachedBlobs[key];
      let statsData;

      if (cachedJson) {
        try { statsData = JSON.parse(cachedJson); } catch (e) { console.warn('キャッシュ破損:', e); }
      }

      if (!statsData) {
        statsData = fetchAndComputeListStats(list.id);
        try { cache.put(key, JSON.stringify(statsData), CONFIG.CACHE.TTL); } catch (e) { console.warn('Cache put failed:', e); }
      }

      return { ...list, ...statsData, isDefault: list.id === defaultListId };
    });
  } catch (error) {
    console.error('getTaskLists Error:', error);
    throw new Error('タスクリスト取得失敗: ' + error.message);
  }
}

/**
 * 統計情報の計算
 */
function fetchAndComputeListStats(listId) {
  Utilities.sleep(100); 
  
  const tasksResponse = Tasks.Tasks.list(listId, { showHidden: true, showDeleted: true, maxResults: 100 });
  const tasks = tasksResponse.items || [];
  let activeCount = 0, completedCount = 0, deletedCount = 0, timestamps = [], validTasksForPreview = [];

  tasks.forEach(t => {
    if (t.updated) timestamps.push(new Date(t.updated).getTime());
    if (t.deleted === true || t.deleted === 'true') deletedCount++;
    else if (t.status === 'completed') completedCount++;
    else {
      activeCount++;
      if (t.title && t.title.trim() !== "") validTasksForPreview.push(t);
    }
  });

  let oldestDate = null, newestDate = null;
  if (timestamps.length > 0) {
    oldestDate = new Date(Math.min(...timestamps)).toISOString();
    newestDate = new Date(Math.max(...timestamps)).toISOString();
  }
  const previewTasks = validTasksForPreview
    .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
    .slice(0, 5).map(t => t.title);

  return {
    stats: { total: tasks.length, active: activeCount, completed: completedCount, deleted: deletedCount },
    oldestDate, newestDate, previewTasks
  };
}

/**
 * タスク詳細取得
 */
function getTasks(taskListId) {
  try {
    const tasks = Tasks.Tasks.list(taskListId, { showHidden: true, showDeleted: true, maxResults: 100 });
    if (!tasks.items) return [];
    return tasks.items.map(task => ({
      id: task.id, title: task.title, status: task.status, due: task.due, notes: task.notes,
      updated: task.updated, deleted: !!task.deleted
    }));
  } catch (error) {
    console.error('getTasks Error:', error);
    throw new Error('タスク詳細取得失敗: ' + error.message);
  }
}

/**
 * タスク移動
 */
function moveTasks(sourceListId, targetListId, taskIds) {
  const results = { success: [], failed: [], fatalError: null };

  try {
    taskIds.forEach((taskId, index) => {
      if (index > 0) Utilities.sleep(CONFIG.API.SLEEP_MS);

      try {
        let originalTask;
        try {
           originalTask = Tasks.Tasks.get(sourceListId, taskId);
        } catch (getError) {
           console.warn(`Task ${taskId} not found or already deleted.`);
           return; 
        }
        
        const newTaskResource = { title: originalTask.title || "" };
        if (originalTask.notes) newTaskResource.notes = originalTask.notes;
        if (originalTask.due) newTaskResource.due = originalTask.due;
        if (originalTask.status) newTaskResource.status = originalTask.status;

        const insertedTask = Tasks.Tasks.insert(newTaskResource, targetListId);
        
        if (insertedTask && insertedTask.id) {
          try {
            Utilities.sleep(200);
            Tasks.Tasks.remove(sourceListId, taskId);
            results.success.push(taskId);
          } catch (deleteError) {
            console.warn(`Copy successful but delete failed for ${taskId}: ${deleteError.message}`);
            results.failed.push({ 
              id: taskId, 
              error: '移動先にコピーされましたが、元のタスクを削除できませんでした（一時的なAPIエラーの可能性があります）。' 
            });
          }
        } else {
          throw new Error('Insert failed (No ID returned)');
        }
      } catch (e) {
        console.error(`Failed to move task ${taskId}:`, e);
        results.failed.push({ id: taskId, error: e.message });
      }
    });

    try {
      const cache = CacheService.getUserCache();
      cache.removeAll([getListStatsKey(sourceListId), getListStatsKey(targetListId)]);
    } catch (cacheError) { console.warn('Cache invalidation failed:', cacheError); }

  } catch (fatal) {
    console.error('moveTasks Fatal Error:', fatal);
    results.fatalError = fatal.toString();
  }
  return results;
}

/**
 * タスク削除
 */
function deleteTasks(listId, taskIds) {
  const results = { success: [], failed: [], fatalError: null };
  try {
    taskIds.forEach((taskId, index) => {
      if (index > 0) Utilities.sleep(CONFIG.API.SLEEP_MS);

      try {
        Tasks.Tasks.remove(listId, taskId);
        results.success.push(taskId);
      } catch (e) {
        console.error(`Failed to delete task ${taskId}:`, e);
        let errorMsg = e.message;
        if (errorMsg.includes('Not Found')) {
          results.success.push(taskId);
        } else {
          results.failed.push({ id: taskId, error: errorMsg });
        }
      }
    });
    try { CacheService.getUserCache().remove(getListStatsKey(listId)); } catch (e) {}
  } catch (fatal) {
    console.error('deleteTasks Fatal Error:', fatal);
    results.fatalError = fatal.toString();
  }
  return results;
}

/**
 * リスト削除
 */
function deleteTaskList(taskListId) {
  try {
    const cache = CacheService.getUserCache();
    const defaultId = cache.get(getKey(CONFIG.CACHE.PREFIX_DEFAULT));
    let defaultListReal;
    try { defaultListReal = Tasks.Tasklists.get('@default'); } catch(e) {}

    if (taskListId === defaultId || (defaultListReal && taskListId === defaultListReal.id)) {
       throw new Error('このリストは「デフォルトリスト」のため、削除できません。');
    }

    Tasks.Tasklists.remove(taskListId);
    cache.remove(getListStatsKey(taskListId));

    return { success: true };
  } catch (e) {
    console.error('deleteTaskList Error:', e);
    throw new Error('リスト削除失敗: ' + e.message);
  }
}

function getKey(keyName) { return `${CONFIG.CACHE.VERSION}_${keyName}`; }
function getListStatsKey(listId) { return getKey(`${CONFIG.CACHE.PREFIX_STATS}${listId}`); }