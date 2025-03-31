// 添加右侧菜单
chrome.runtime.onInstalled.addListener(() => {
    // 截取选择部分
    chrome.contextMenus.create({
        type: "normal",
        title: "间距检测",
        id: "space-detector",
        contexts: ["all"],
    });
});

// 绑定菜单点击事件
chrome.contextMenus.onClicked.addListener((info) => {
    if (["space-detector"].includes(info.menuItemId as string)) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
            spaceDetector(tab[0].id!);
        });
    }
});

// 监听键盘快捷键
chrome.commands.onCommand.addListener((command: string) => {
    if (["space-detector"].includes(command)) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
            spaceDetector(tab[0].id!);
        });
    }
});

chrome.runtime.onMessage.addListener((req) => {
    if (req.type === "space-detector") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
            spaceDetector(tab[0].id!);
        });
    }
    return true;
});

const spaceDetector = (tabId: number) => {
    chrome.scripting
        .executeScript({
            target: { tabId },
            files: ["spaceDetector/spaceDetector.js"],
        })
        .then(() => {
            console.log("js reload");
        });
};
