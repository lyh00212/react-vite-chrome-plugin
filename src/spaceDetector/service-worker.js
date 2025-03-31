// 引入spacing检测脚本
const spacingCheck = (tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["spacing/spacing.js"],
    });
};

// 监听消息
chrome.runtime.onMessage.addListener((req) => {
    if (req.type === "css-detector") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                const tab = tabs[0];
                spacingCheck(tab);
            }
        });
    }
    return true;
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "css-detector") {
        spacingCheck(tab);
    }
});

chrome.commands.onCommand.addListener(async (command) => {
    if (command === "css-detector") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                const tab = tabs[0];
                spacingCheck(tab);
            }
        });
    }
});
