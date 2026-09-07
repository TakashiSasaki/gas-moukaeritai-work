function generateUUIDv3(namespaceUUID, name) {
  if (!namespaceUUID || !name) {
    throw new Error("Namespace and name must be provided");
  }

  // 名前空間UUIDからハイフンを除去し、バイト列に変換
  const namespaceBytes = hexStringToBytes(namespaceUUID.replace(/-/g, ''));
  // 名前をUTF-8のバイト列に変換
  const nameBytes = Utilities.newBlob(name).getBytes();

  // バイト列を連結
  const dataBytes = namespaceBytes.concat(nameBytes);

  // MD5ハッシュを計算
  const md5hash = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, dataBytes);
  const hexHash = digestToHex(md5hash);

// UUIDの形式に整形
const resultUUID = hexHash.substr(0, 8) + "-" +
                   hexHash.substr(8, 4) + "-" +
                   "3" + hexHash.substr(13, 3) + "-" +  // バージョン3を明示
                   adjustVariant(hexHash.substr(16, 4)) + "-" +
                   hexHash.substr(20);

  return resultUUID;
}

function hexStringToBytes(hex) {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return bytes;
}

function digestToHex(digest) {
  var hex = '';
  for (var i = 0; i < digest.length; i++) {
    var byte = digest[i];
    if (byte < 0) byte += 256; // 負の値を調整
    var hexByte = byte.toString(16);
    if (hexByte.length < 2) hexByte = '0' + hexByte; // 1桁の場合は0を追加
    hex += hexByte;
  }
  return hex;
}

function adjustVariant(substr) {
  const firstChar = parseInt(substr[0], 16);
  // 上位2ビットを'10'に設定
  const adjustedChar = (firstChar & 0x3) | 0x8;
  return adjustedChar.toString(16) + substr.substr(1);
}

function testGenerateUUIDv3(){
  const exampleNamespace = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
  const exampleName = "www.example.com";
  const correctResultUuid = "5df41881-3aed-3515-88a7-2f4a814cf09e";
  const generatedUuid = generateUUIDv3(exampleNamespace, exampleName);

  if (generatedUuid === correctResultUuid) {
    console.log("Test passed: Generated UUID is correct.");
  } else {
    console.log("Test failed: Expected " + correctResultUuid + ", but got " + generatedUuid);
  }
}
