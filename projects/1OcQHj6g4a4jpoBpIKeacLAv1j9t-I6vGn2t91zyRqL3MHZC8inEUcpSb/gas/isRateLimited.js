// Filename: isRateLimited.js
// Function to check if the rate limit has been exceeded.
// It uses the cache entry associated with the script property BISHOP_KEY_NAME 
// to track the number of API calls made within the current DURATION_SECOND window.
// This function also incorporates a script lock to ensure safe concurrent access.
function isRateLimited() {
  // Obtain the script lock to ensure consistency while checking the rate limit.
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) {
    throw new Error('Script is currently locked. Try again later.');
  }
  
  try {
    // Retrieve key name and limit from script properties
    const scriptProperties = PropertiesService.getScriptProperties();
    const key = scriptProperties.getProperty('BISHOP_KEY_NAME');
    const limit = parseInt(scriptProperties.getProperty('LIMIT_IN_DURATION'), 10);

    // Rate limiting check: use the cache to read the number of API calls in the current duration
    const cache = CacheService.getScriptCache();
    let currentCount = cache.get(key);

    // If no calls have been recorded in the current window, the API is not rate limited.
    if (currentCount === null) {
      return false;
    }

    // Convert the cached count to an integer
    currentCount = parseInt(currentCount, 10);

    // Return true if the count is greater than or equal to the allowed limit,
    // meaning further API calls should be blocked.
    return currentCount >= limit;
  } finally {
    // Always release the lock
    lock.releaseLock();
  }
}
