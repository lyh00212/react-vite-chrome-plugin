console.log("background service-worker file");

// 本地修改代码时，热更新
chrome.management.getSelf((self) => {
    if (self.installType === "development") {
        // 监听的文件列表
        const fileList = [
            "http://127.0.0.1:5501/dist/manifest.json",
            "http://127.0.0.1:5501/dist/popup/popup.js",
            "http://127.0.0.1:5501/dist/background/service-worker.js",
            "http://127.0.0.1:5501/dist/content/content.js",
            "http://127.0.0.1:5501/dist/contentPage/contentPage.js",
        ];
        // 文件列表内容字段
        const fileObj: {
            [props: string]: string;
        } = {};
        // reload 重新加载
        const reload = () => {
            chrome.tabs.query(
                {
                    active: true,
                    currentWindow: true,
                },
                (tabs: chrome.tabs.Tab[]) => {
                    if (tabs[0]) {
                        chrome.tabs.reload(tabs[0].id);
                    }
                    // 强制刷新页面
                    chrome.runtime.reload();
                }
            );
        };
        // 遍历监听的文件，通过请求获取文件内容，判断是否需要刷新
        const checkReloadPage = () => {
            fileList.forEach((item) => {
                fetch(item)
                    .then((res) => res.text())
                    .then((files) => {
                        // console.log(`Checking file: ${item}`);
                        // console.log(`Current content: ${files}`);
                        // console.log(`Stored content: ${fileObj[item]}`);

                        if (!fileObj[item]) {
                            // console.log(
                            //     "Storing initial content for the first time."
                            // );
                            fileObj[item] = JSON.parse(JSON.stringify(files));
                        } else if (
                            JSON.stringify(fileObj[item]) !==
                            JSON.stringify(files)
                        ) {
                            // console.log("File content changed, reloading...");
                            reload();
                        } else {
                            // console.log("File content unchanged.");
                        }
                    })
                    .catch((error) => {
                        console.error("Error checking folder changes:", error);
                    });
            });
        };
        // 设置闹钟（定时器）
        // 闹钟名称
        const ALARM_NAME = "LISTENER_FILE_TEXT_CHANGE";
        // 创建闹钟
        const createAlarm = async () => {
            const alarm = await chrome.alarms.get(ALARM_NAME);
            if (typeof alarm === "undefined") {
                chrome.alarms.create(ALARM_NAME, {
                    periodInMinutes: 0.1,
                });
                checkReloadPage();
            }
        };
        createAlarm();
        // 监听闹钟
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === ALARM_NAME) {
                console.log("Alarm triggered, calling checkReloadPage..."); // 添加调试信息
                checkReloadPage();
            }
        });
    }
});

// 监听键盘快捷键
chrome.commands.onCommand.addListener((command: string) => {
    if (
        ["screenshot-selected-area", "screenshot-full-screen"].includes(command)
    ) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id!, { type: command });
        });
    }
});

// 截取全屏
chrome.runtime.onMessage.addListener(
    (req, sender, sendResponse: (response: any) => void) => {
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
            return true;
        }
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
