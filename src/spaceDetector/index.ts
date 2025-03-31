import Spacing from "./spacing";

Spacing();

// 监听来自其他内容脚本的消息
window.addEventListener("message", (event) => {
    // 确保消息来自自己的脚本
    if (event.source !== window) return;
    if (event.data.type && event.data.type === "spacing-destroy") {
        Spacing.stop();
    }
});
