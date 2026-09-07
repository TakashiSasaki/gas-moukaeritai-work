global = this;

function onInstall(e){
  AddonHelper.installAddon(SpreadsheetApp, global,"TakashiSasaki", "47Cf");
}
onInstall.title="Reinstall add-on";

function onOpen(e){
  onInstall(e);
}
