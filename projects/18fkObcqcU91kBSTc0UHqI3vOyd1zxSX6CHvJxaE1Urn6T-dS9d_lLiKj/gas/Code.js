/**
 * 1枚のカードにすべてのメタデータをまとめて表示する。
 */
function onDriveItemsSelected(e) {
  const fileId = e.drive.selectedItems[0].id;
  const file = getDriveMetadataViaV3(fileId);

  // 各種メタデータの取得（存在しない場合は "(Unavailable)" や "(none)" と表示）
  const fileName     = file.name || "(no title)";
  const mimeType     = file.mimeType || "(unknown)";
  const createdTime  = file.createdTime || "(unknown)";
  const modifiedTime = file.modifiedTime || "(unknown)";
  const md5          = file.md5Checksum || "(Unavailable)";
  const sha1         = file.sha1Checksum || "(Unavailable)";
  const sha256       = file.sha256Checksum || "(Unavailable)";
  const size         = file.size ? file.size + " bytes" : "(Unavailable)";
  const parents      = file.parents ? file.parents.join(", ") : "(none)";
  const starred      = (file.starred !== undefined) ? file.starred : "(unknown)";
  const shared       = (file.shared !== undefined) ? file.shared : "(unknown)";

  // exportLinks を MIME タイプ毎のハイパーリンクボタン群として作成
  let exportButtons;
  if (file.exportLinks) {
    exportButtons = CardService.newButtonSet();
    for (let key in file.exportLinks) {
      const url = file.exportLinks[key];
      const openLink = CardService.newOpenLink()
        .setUrl(url)
        .setOpenAs(CardService.OpenAs.FULL_SIZE)
        .setOnClose(CardService.OnClose.NOTHING);
      const btn = CardService.newTextButton()
        .setText(key)
        .setOpenLink(openLink);
      exportButtons.addButton(btn);
    }
  } else {
    exportButtons = CardService.newTextParagraph().setText("(none)");
  }

  // RAW JSON を2スペースインデントで文字列化
  const rawJson = JSON.stringify(file, null, 2);

  // カードの構築：概要情報、exportLinks、RAW JSON（コピー用）、そして作者情報を表示
  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle("Selected File Metadata"))
    .addSection(
      CardService.newCardSection()
        .addWidget(CardService.newTextParagraph().setText(`<b>File ID:</b> ${fileId}`))
        .addWidget(CardService.newTextParagraph().setText(`<b>File Name:</b> ${fileName}`))
        .addWidget(CardService.newTextParagraph().setText(`<b>MIME Type:</b> ${mimeType}`))
        .addWidget(CardService.newTextParagraph().setText(`<b>Created Time:</b> ${createdTime}`))
        .addWidget(CardService.newTextParagraph().setText(`<b>Modified Time:</b> ${modifiedTime}`))
        .addWidget(CardService.newTextParagraph().setText(`<b>Size:</b> ${size}`))
        .addWidget(CardService.newTextParagraph().setText(`<b>MD5 Checksum:</b> ${md5}`))
        .addWidget(CardService.newTextParagraph().setText(`<b>SHA-1 Checksum:</b> ${sha1}`))
        .addWidget(CardService.newTextParagraph().setText(`<b>SHA-256 Checksum:</b> ${sha256}`))
        .addWidget(CardService.newTextParagraph().setText(`<b>Parents:</b> ${parents}`))
        .addWidget(CardService.newTextParagraph().setText(`<b>Starred:</b> ${starred}`))
        .addWidget(CardService.newTextParagraph().setText(`<b>Shared:</b> ${shared}`))
    )
    .addSection(
      CardService.newCardSection()
        .addWidget(CardService.newTextParagraph().setText("<b>Export Links:</b>"))
        .addWidget(exportButtons)
    )
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextInput()
            .setFieldName("rawJson")
            .setTitle("Raw JSON")
            .setValue(rawJson)
            .setMultiline(true)
        )
    )
    // 作者情報セクションの追加
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextParagraph().setText(
            "<b>Author:</b> Takashi Sasaki<br><b>Homepage:</b> <a href='https://x.com/TakashiSasaki' target='_blank'>https://x.com/TakashiSasaki</a>"
          )
        )
    )
    .build();

  return [card];
}

/**
 * Drive API v3 からファイルメタデータを取得する。
 */
function getDriveMetadataViaV3(fileId) {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=*`;
  const options = {
    method: "get",
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`
    },
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}

/**
 * HTMLエスケープ用関数
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
