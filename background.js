chrome.contextMenus.create({
  id: "copy-fa-icon",
  title: "Copy Font Awesome Icon Name",
  contexts: ["all"],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "copy-fa-icon") {
    chrome.tabs.sendMessage(tab.id, { action: "copyIconName" });
  }
});
