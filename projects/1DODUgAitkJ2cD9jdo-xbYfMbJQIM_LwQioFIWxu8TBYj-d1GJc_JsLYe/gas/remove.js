function remove(salt, key){
  if(salt === undefined) salt = "abc";
  if(key === undefined) key = "kkk";
  var saltEmailHash = computeSaltEmailHash(salt);
  WebClipboardWriter.remove(saltEmailHash, key);
}//remove

function removeAll(salt) {
  if(salt === undefined) salt = "abc";
  var saltEmailHash = computeSaltEmailHash(salt);
  WebClipboardWriter.removeAll(saltEmailHash);
}//removeAll
