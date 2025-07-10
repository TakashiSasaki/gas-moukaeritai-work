// Filename: assertLockAndRateLimit.js
// Checks if the current execution is allowed under lock and rate limiting constraints.
// If allowed, increments the counter in cache.
// Accepts optional parameters for key, duration, and limit.
// If an argument is null or undefined, its value is retrieved from the script properties.
// Throws an error if the required parameter is missing.
function assertLockAndRateLimit(customKey, customDuration, customLimit) {
  // Acquire a script-wide lock to prevent concurrent modifications
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) {
    throw new Error('Script is currently locked. Try again later.');
  }

  try {
    const props = PropertiesService.getScriptProperties();
    // Use provided parameter if not null/undefined; otherwise, get from script properties.
    const key = customKey != null ? customKey : props.getProperty('BISHOP_KEY_NAME');
    const durationStr = customDuration != null ? customDuration.toString() : props.getProperty('DURATION_SECOND');
    const limitStr = customLimit != null ? customLimit.toString() : props.getProperty('LIMIT_IN_DURATION');

    // Check if all required values are present
    if (!key || !durationStr || !limitStr) {
      throw new Error('Missing required parameters: key, duration, or limit. ' +
                      'Please provide them as arguments or set corresponding script properties.');
    }

    const duration = parseInt(durationStr, 10);
    const limit = parseInt(limitStr, 10);

    const cache = CacheService.getScriptCache();
    let currentCount = cache.get(key);

    if (currentCount === null) {
      // No previous calls in this window, initialize count to 1
      currentCount = 1;
    } else {
      // Parse and increment the existing count
      currentCount = parseInt(currentCount, 10) + 1;
    }

    // If the number of calls exceeds the allowed limit, throw an error with detailed info
    if (currentCount > limit) {
      throw new Error(
        `Rate limit exceeded: ${currentCount - 1} requests were made in the last ${duration} seconds (limit is ${limit} requests). Please wait before retrying.`
      );
    }

    // Update the counter in the cache with the full expiration reset
    cache.put(key, String(currentCount), duration);
  } finally {
    // Always release the lock
    lock.releaseLock();
  }
}
