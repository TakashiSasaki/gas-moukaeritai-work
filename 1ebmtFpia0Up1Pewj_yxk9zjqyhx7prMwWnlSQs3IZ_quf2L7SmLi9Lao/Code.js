/**
 * ユーザーの全タスクリストを取得し、統計情報を含めて返します。
 * UserCacheを利用してリストデータおよびデフォルトリストIDをキャッシュし、API消費を最小限に抑えます。
 * * @param {boolean} forceRefresh キャッシュを無視して強制的にデータを更新するかどうか
 * @return {Array<Object>} タスクリスト情報の配列
 */
function getTaskLists(forceRefresh = false) {
  const cache = CacheService.getUserCache();
  const DATA_CACHE_KEY = 'task_lists_data_v1';
  const DEFAULT_ID_CACHE_KEY = 'default_task_list_id';
  const CACHE_DURATION_SEC = 600; // 10分

  // 1. キャッシュがあればそれを返す
  if (!forceRefresh) {
    const cachedData = cache.get(DATA_CACHE_KEY);
    if (cachedData) {
      console.log('Serving list data from cache');
      return JSON.parse(cachedData);
    }
  }

  try {
    console.log('Fetching from API');
    
    // 2. 全タスクリストを取得
    const taskLists = Tasks.Tasklists.list();
    if (!taskLists.items) return [];

    // 3. デフォルトリストIDの解決（キャッシュ戦略付き）
    let defaultListId = cache.get(DEFAULT_ID_CACHE_KEY);
    
    if (!defaultListId || forceRefresh) {
      try {
        // API経由で @default の実体IDを取得
        defaultListId = Tasks.Tasklists.get('@default').id;
        // ID単体をキャッシュに保存
        cache.put(DEFAULT_ID_CACHE_KEY, defaultListId, CACHE_DURATION_SEC);
        console.log('Default list ID resolved and cached:', defaultListId);
      } catch (e) {
        console.warn('デフォルトリストの特定に失敗:', e);
      }
    } else {
      console.log('Using cached default list ID:', defaultListId);
    }

    // 4. データ整形と統計計算
    const result = taskLists.items.map(list => {
      // 統計用タスク取得（maxResults等は適宜調整）
      const tasksResponse = Tasks.Tasks.list(list.id, {
        showHidden: true,
        maxResults: 100
      });
      
      const tasks = tasksResponse.items || [];
      const taskCount = tasks.length;
      
      let oldestDate = null;
      let newestDate = null;
      let previewTasks = [];

      if (taskCount > 0) {
        const validTasks = tasks.filter(t => t.updated);
        const timestamps = validTasks.map(t => new Date(t.updated).getTime());

        if (timestamps.length > 0) {
          oldestDate = new Date(Math.min(...timestamps)).toISOString();
          newestDate = new Date(Math.max(...timestamps)).toISOString();
        }

        previewTasks = validTasks
          .filter(t => t.title && t.title.trim() !== "")
          .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
          .slice(0, 5)
          .map(t => t.title);
      }

      return {
        id: list.id,
        title: list.title,
        updated: list.updated,
        isDefault: list.id === defaultListId, // ここで判定
        taskCount: taskCount,
        oldestDate: oldestDate,
        newestDate: newestDate,
        previewTasks: previewTasks
      };
    });

    // 5. 結果セット全体をキャッシュ
    try {
      cache.put(DATA_CACHE_KEY, JSON.stringify(result), CACHE_DURATION_SEC);
    } catch (e) {
      console.warn('Data cache failed (size limit):', e);
    }

    return result;

  } catch (error) {
    console.error('getTaskLists Error:', error);
    throw new Error('データ取得に失敗しました: ' + error.message);
  }
}

/**
 * 特定のリスト内のタスク一覧を取得
 */
function getTasks(taskListId) {
  try {
    const tasks = Tasks.Tasks.list(taskListId);
    if (!tasks.items) return [];
    
    return tasks.items.map(task => ({
      id: task.id,
      title: task.title,
      status: task.status,
      due: task.due,
      notes: task.notes
    }));
  } catch (error) {
    console.error('getTasks Error:', error);
    throw new Error('タスク取得失敗');
  }
}

/**
 * デバッグ用: デフォルトリストIDの解決結果をコンソールに出力します。
 * 手動実行して、@default がどのIDにマッピングされているか確認してください。
 */
function debugDefaultListId() {
  try {
    console.log('--- Debugging Default List ID ---');
    
    // 1. @default を直接取得
    const defaultList = Tasks.Tasklists.get('@default');
    console.log('Resolved @default to:');
    console.log('  Title:', defaultList.title);
    console.log('  ID:', defaultList.id);
    
    // 2. 全リストを取得して照合
    const allLists = Tasks.Tasklists.list().items;
    const found = allLists.find(l => l.id === defaultList.id);
    
    if (found) {
      console.log('MATCH: Found corresponding list in Tasklists.list()');
      console.log('  Matched List Title:', found.title);
      console.log('  Matched List ID:', found.id);
    } else {
      console.error('MISMATCH: The resolved default ID was NOT found in the full list.');
    }
    
    console.log('---------------------------------');
    return defaultList.id;
  } catch (e) {
    console.error('Debug execution failed:', e);
  }
}