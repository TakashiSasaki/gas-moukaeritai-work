/**
 * Wrapper function for ImeDictionary.gemma or ImeDictionary.gemini.
 *
 * @param {string} userInput - The TSV/CSV/JSON input string.
 * @param {string} apiType - 'gemma' or 'gemini' to select the underlying API.
 * @return {Object[]} Parsed array of dictionary entries.
 * @throws {Error} If structure is missing or JSON parsing fails.
 */
function doGenerateImeDictionary(userInput, apiType) {
  // Invoke the selected library function; both return an array of entries directly
  var entries;
  if (apiType === 'gemini') {
    entries = ImeDictionary.gemini(userInput);
  } else {
    entries = ImeDictionary.gemma(userInput);
  }

  // Basic validation: must be an array
  if (!Array.isArray(entries)) {
    throw new Error('Expected an array of entries from ' + apiType + ', but got ' + typeof entries);
  }

  return entries;
}