function testImeDictionary() {
  var a = `
  ほげほげ\thogehoge
`;
  const result = ImeDictionary.generateImeDictionaryWithGemini(a);
  Logger.log(result);
}
