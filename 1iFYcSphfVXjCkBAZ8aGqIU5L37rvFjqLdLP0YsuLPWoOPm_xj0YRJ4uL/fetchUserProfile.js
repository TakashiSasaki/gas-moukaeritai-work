// Twitter API 1.1を使用してユーザープロフィールを取得
function fetchUserProfile() {
  const service = getOAuth1Service();
  if (!service.hasAccess()) {
    throw new Error('Access not authorized. Please authorize the app first.');
  }

  const url = 'https://api.twitter.com/1.1/account/verify_credentials.json'; // Twitter API 1.1のエンドポイント
  try {
    const response = service.fetch(url);
    const profile = JSON.parse(response.getContentText());
    Logger.log(profile);
    return {
      name: profile.name,
      username: profile.screen_name,
      description: profile.description,
    };
  } catch (error) {
    Logger.log('Error fetching profile: %s', error);
    throw new Error('Unable to fetch profile data.');
  }
}