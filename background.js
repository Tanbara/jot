chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.url || tab.url.startsWith("chrome://")) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });

    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ["global.css", "styles.css", "components/button-icon/button-icon.css"]
    });
  } catch (err) {
    console.warn("Sidebar injection failed:", err.message);
  }
});

// Respond to @currenttab message from content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'get-tab-info') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      sendResponse({ title: tab.title, url: tab.url });
    });
    return true; // Keep the message channel open
  }
});
