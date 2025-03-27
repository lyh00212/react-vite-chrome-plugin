// 监听键盘快捷键
chrome.commands.onCommand.addListener((command: string) => {
    if (
        [
            "screenshot-selected-area",
            "screenshot-full-screen",
            "exit_screenshot",
        ].includes(command)
    ) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id!, { type: command });
        });
    }
});

// 截取全屏
chrome.runtime.onMessage.addListener(
    (req, _, sendResponse: (response: any) => void) => {
        if (req.type === "screenshot") {
            chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
                chrome.tabs.captureVisibleTab(
                    tab[0].windowId,
                    { format: "png", quality: 100 },
                    (dataUrl: string) => {
                        sendResponse({ image: dataUrl });
                    }
                );
            });
        }
        return true;
    }
);

// 添加右侧菜单
chrome.runtime.onInstalled.addListener(() => {
    // 截取选择部分
    chrome.contextMenus.create({
        type: "normal",
        title: "截取选择部分",
        id: "screenshot-selected-area",
        contexts: ["all"],
    });
    // 截取整个页面
    chrome.contextMenus.create({
        type: "normal",
        title: "截取整个页面",
        id: "screenshot-full-screen",
        contexts: ["all"],
    });
});

// 绑定菜单点击事件
chrome.contextMenus.onClicked.addListener((info) => {
    if (
        ["screenshot-selected-area", "screenshot-full-screen"].includes(
            info.menuItemId as string
        )
    ) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id!, { type: info.menuItemId });
        });
    }
});
