function getExistingTaskTitles_(taskListTitle){
  var taskLists = Tasks.Tasklists.list();
  var taskList;
  for(var i=0; i<taskLists.items.length; ++i){
    if(taskLists.items[i].title === taskListTitle){
      taskList = taskLists.items[i];
    }//if
  }//for
  if (taskList === undefined) return [];
  var tasks = Tasks.Tasks.list(taskList.id);
  if(tasks === null || tasks === undefined) {
    return [];
  }//if
  var existingTaskTitles = [];
  while(true){
    for(var i=0; i<tasks.items.length; ++i){
      existingTaskTitles.push(tasks.items[i].title);
    }
    if(typeof tasks.nextPageToken === "string") {
      tasks = Tasks.Tasks.list(taskList.id, {pageToken: tasks.nextPageToken});
    } else {
      break;
    }
  }//files
  return existingTaskTitles;
}//getExistingTaskTitles

function getExistingTaskTitlesWithCache(taskListTitle){
  var cache = CacheService.getUserCache();
  var json = cache.get(taskListTitle);
  if(typeof json === "string") {
    console.log("hit cache");
    return JSON.parse(json);
  }
  console.log("missed cache");
  var existingTaskTitles = getExistingTaskTitles(taskListTitle);
  var json = JSON.stringify(existingTaskTitles);
  if(json.length > 100000) throw "task list is too large";
  cache.put(taskListTitle, json, 300);
  return existingTaskTitles;
}//getExistingTaskTitlesWithCache

function isTaskTitleExisting(taskListTitle, taskTitle){
  taskTitles = getExistingTaskTitleWithCache(taskListTitle);
  if(taskTitles.indexOf(taskTitle) >= 0) {
    return true;
  }
  return false;
}//isTaskTitleExisting

function testGetExistingTaskTitles(){
  var existingTaskTitles = getExistingTaskTitles_("Inbox");
  console.log(existingTaskTitles);
}//testGetExistingTaskTitles

function testGetExistingTaskTitlesWithCache(){
  var existingTaskTitles = getExistingTaskTitlesWithCache("Inbox");
  console.log(existingTaskTitles);
}//testGetExistingTaskTitlesWithCache
