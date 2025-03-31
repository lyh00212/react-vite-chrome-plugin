export function rgbaToHex(rgba: string) {
    // 抽取r, g, b, a
    const rgbaValues = rgba.match(/\d+\.?\d*/g);
    // 如果没有找到 则返回null
    if (!rgbaValues) return null;

    // 红色
    const r = parseInt(rgbaValues[0]);
    // 绿色
    const g = parseInt(rgbaValues[1]);
    // 蓝色
    const b = parseInt(rgbaValues[2]);
    // Alpha，默认值为1（不透明）
    const a = parseFloat(rgbaValues[3]) || 1;

    // 转换为16进制
    const hex = [r, g, b]
        .map((value) => {
            const hexValue = value.toString(16);
            // 确保是两位数
            return hexValue.length === 1 ? "0" + hexValue : hexValue;
        })
        .join("");

    // 处理 Alphe 值（可选）
    // const alphaHex = Math.round(a * 255).toString(16).padStart(2, "0")

    // 返回带有 '#' 的十六进制颜色
    return `#${hex}${a === 1 ? "" : "-" + a}`;
}

export function isElementInIframe(element: any) {
    // 获取所有的iframe
    const iframes = document.getElementsByTagName("iframe");

    // 遍历所有的iframe
    for (let i = 0; i < iframes.length; i++) {
        const iframe: any = iframes[i];

        // 尝试访问 iframe 文档
        try {
            const iframeDocument =
                iframe.contentDocument || iframe.contentWindow.document;
            // 检查元素是否在当前 iframe 文档中
            if (iframeDocument.body.contains(element)) {
                // 返回包含该元素的 iframe
                return iframe;
            }
        } catch (e) {
            // 如果访问出现错误（同源策略）， 忽略并继续查找下一个 iframe
            console.warn(`无法访问iframe ${i} 的内容:`, e);
        }
    }
    // 如果没有找到，返回null
    return null;
}
