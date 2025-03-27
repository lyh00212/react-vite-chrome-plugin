// 添加右侧菜单
chrome.runtime.onInstalled.addListener(() => {
    // 截取选择部分
    chrome.contextMenus.create({
        type: "normal",
        title: "css样式检测",
        id: "css-detector",
        contexts: ["all"],
    });
});

// 绑定菜单点击事件
chrome.contextMenus.onClicked.addListener((info) => {
    if (["css-detector"].includes(info.menuItemId as string)) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
            cssDetector(tab[0].id!);
        });
    }
});

// 监听键盘快捷键
chrome.commands.onCommand.addListener((command: string) => {
    if (["css-detector"].includes(command)) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
            cssDetector(tab[0].id!);
        });
    }
});

chrome.runtime.onMessage.addListener((req) => {
    if (req.type === "css-detector") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
            cssDetector(tab[0].id!);
        });
    }
    return true;
});

const cssDetector = (tabId: number) => {
    chrome.scripting
        .executeScript({
            target: { tabId },
            files: ["cssDetector/cssDetector.js"],
        })
        .then(() => {
            console.log("js reload");
        });
    chrome.scripting.insertCSS({
        target: { tabId },
        files: ["cssDetector/cssDetector.css"],
    });
};
