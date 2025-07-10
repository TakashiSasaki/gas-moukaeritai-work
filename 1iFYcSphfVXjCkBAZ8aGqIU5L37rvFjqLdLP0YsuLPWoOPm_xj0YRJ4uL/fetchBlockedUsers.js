// ブロックしているユーザーの一覧を取得
function fetchBlockedUsers() {
  const service = getOAuth1Service();
  
  if (!service.hasAccess()) {
    throw new Error('Access not authorized. Please authorize the app first.');
  }

  const url = 'https://api.twitter.com/1.1/blocks/list.json'; // ブロックしているユーザーを取得するAPIエンドポイント

  try {
    const response = service.fetch(url, { muteHttpExceptions: true }); // muteHttpExceptionsを有効化
    const httpStatus = response.getResponseCode();

    if (httpStatus >= 200 && httpStatus < 300) {
      const users = JSON.parse(response.getContentText()).users;
      Logger.log(users);
      return users.map(user => ({
        name: user.name,
        screen_name: user.screen_name
      }));
    } else {
      Logger.log('HTTP Error: ' + httpStatus + ' - ' + response.getContentText());
      throw new Error('Failed to fetch blocked users. HTTP status: ' + httpStatus);
    }
  } catch (error) {
    Logger.log('Error fetching blocked users: ' + error.message);
    throw new Error('Unable to fetch blocked users.');
  }
}

