(function () {
    let cssDict = [
        { name: "font-size", type: "fonts", typeName: "字号", value: "" },
        { name: "font-weight", type: "fonts", typeName: "字重", value: "" },
        { name: "font-style", type: "fonts", typeName: "字体风格", value: "" },
        { name: "height", type: "height", typeName: "高度", value: "" },
        { name: "width", type: "width", typeName: "宽度", value: "" },
        {
            name: "line-height",
            type: "line-height",
            typeName: "行高",
            value: "",
        },
        { name: "margin", type: "spacing", typeName: "外边距", value: "" },
        {
            name: "margin-top",
            type: "spacing",
            typeName: "外边距(上)",
            value: "",
        },
        {
            name: "margin-right",
            type: "spacing",
            typeName: "外边距(右)",
            value: "",
        },
        {
            name: "margin-bottom",
            type: "spacing",
            typeName: "外边距(下)",
            value: "",
        },
        {
            name: "margin-left",
            type: "spacing",
            typeName: "外边距(左)",
            value: "",
        },
        { name: "padding", type: "spacing", typeName: "内边距", value: "" },
        {
            name: "padding-top",
            type: "spacing",
            typeName: "内边距(上)",
            value: "",
        },
        {
            name: "padding-right",
            type: "spacing",
            typeName: "内边距(右)",
            value: "",
        },
        {
            name: "padding-bottom",
            type: "spacing",
            typeName: "内边距(下)",
            value: "",
        },
        {
            name: "padding-left",
            type: "spacing",
            typeName: "内边距(左)",
            value: "",
        },
        { name: "color", type: "color", typeName: "颜色", value: "" },
        {
            name: "background-color",
            type: "color",
            typeName: "背景色",
            value: "",
        },
        { name: "border", type: "border", typeName: "边框", value: "" },
        { name: "border-color", type: "边框颜色", value: "" },
        { name: "border-top", type: "border", typeName: "边框(上)", value: "" },
        {
            name: "border-right",
            type: "border",
            typeName: "边框(右)",
            value: "",
        },
        {
            name: "border-bottom",
            type: "border",
            typeName: "边框(下)",
            value: "",
        },
        {
            name: "border-left",
            type: "border",
            typeName: "边框(左)",
            value: "",
        },
        { name: "border-radius", type: "radius", typeName: "圆角", value: "" },
        { name: "box-shadow", type: "shadow", typeName: "阴影", value: "" },
        { name: "text-shadow", type: "shadow", typeName: "阴影", value: "" },
    ];

    // 颜色相关样式
    let colorDic = ["color", "background-color", "border-color"];

    // 宽高
    let whDict = ["width", "height"];

    const dictionary = cssDict.map((item) => item.name);
    let cssMap = new Map();
    let domMap = new Map();
    let inView = false;
    let cssDetector = null;
    let currentElement = null;
    let iframeList = [];

    // 获取当前页面的document
    function getDocument() {
        return window.document;
    }
    // 创建mask遮罩
    function createMask(id) {
        const mask = document.createElement("div");
        mask.id = id;
        mask.style.pointerEvents = "none";
        mask.style.background = "rgb(3, 132, 253, 0.22)";
        mask.style.position = "fixed";
        mask.style.display = "none";
        mask.style.zIndex = 9999999;
        return mask;
    }
    // 更新元素的样式
    function updateCss(element, currentElement) {
        // 更新所有的样式
        let styleTemp = {};
        if (cssMap.get(currentElement)) {
            styleTemp = cssMap.get(currentElement);
        } else {
            let temp = {};
            let rules = getEleStyleStr(currentElement.ownerDocument);
            for (let r in rules) {
                let rule = rules[r];
                let style = rule.style;
                if (currentElement.matches(rule.selectorText)) {
                    for (let j = 0; j < dictionary.length; j++) {
                        const value = style.getPropertyValue(dictionary[j]);
                        value && (temp[dictionary[j]] = value);
                    }
                }
            }
            cssMap.set(currentElement, temp);
            styleTemp = temp;
        }
        for (let i = 0; i < cssDict.length; i++) {
            const property = cssDict[i].name;
            updateSingleCss(
                element,
                property,
                cssDict[i].type,
                styleTemp,
                currentElement
            );
        }
    }
    // 更新单个样式
    function updateSingleCss(
        element,
        property,
        type,
        styleTemp,
        currentElement
    ) {
        // 获取当前element的所有样式
        let propertyValue =
            styleTemp[property] ||
            currentElement.style.getPropertyValue(property) ||
            element.getPropertyValue(property);
        let ele = document.getElementById("css_detector_" + property);
        let innerText = isColor(property, propertyValue);
        ele.lastChild.innerHTML =
            innerText.indexOf("var(") > -1
                ? `<span class='css_detector_conrect'>${innerText}</span>`
                : innerText || "无";
    }
    // 是否是颜色样式，是则转化为16进制
    function isColor(propertyName, propertyValue) {
        let result = "";
        if (colorDic.indexOf(propertyName) > -1) {
            result = `<span class='css_detector_container_box' style='backgroundColor:${propertyValue}'></span>${propertyValue}`;
        } else {
            result = propertyValue;
        }
        return result;
    }
    // 鼠标移动，给hover卡片里填充内容
    function cssMouseOver(e) {
        const document = getDocument();
        const container = document.getElementById("css_detector_container");

        if (!container) {
            return;
        }
        container.firstChild.innerHTML = `<div>元素名：${this.tagName.toLowerCase()}</div><div>类名：${
            this.className
        }</div><div style='color:#1c79f4;'>操作：按Esc退出；按F键冻结,可固定住卡片进行查看，再按F解冻</div>`;
        if (this.tagName !== "body") {
            this.style.outline = "1px dashed #f00";
            currentElement = this;
            const targetDomInfo = this.getBoundingClientRect();
            const { width, height, left, top } = targetDomInfo;
            const curDoc = this.ownerDocument;
            if (domMap.has(curDoc)) {
                let maskDom = domMap.get(curDoc);
                maskDom.style.width = width + "px";
                maskDom.style.height = height + "px";
                maskDom.style.left = left + "px";
                maskDom.style.top = top + "px";
                maskDom.style.display = "block";
            } else {
                let dom = createMask(curDoc.title);
                curDoc.body.appendChild(dom);
                domMap.set(curDoc, dom);
            }
        }
        const element = document.defaultView.getComputedStyle(this, null);
        updateCss(element, currentElement);
        e.stopPropagation();
        // 通知spacing触发鼠标移动事件
        window.mouseEventEle = e;
        window.postMessage({ type: "spacing-mouse-move" }, "*");
    }
    // 鼠标移动，判断hover卡片的位置，给left和top值重新赋值
    function cssMouseMove(e) {
        const document = getDocument();
        const container = document.getElementById("css_detector_container");
        if (!container) {
            return;
        }
        container.style.display = "block";
        let pageWidth = window.innerWidth;
        let pageHeight = window.innerHeight;
        let containerWidth = 400;
        let containerHeight = document.defaultView
            .getComputedStyle(container, null)
            .getPropertyValue("height");
        containerHeight =
            containerHeight.substring(0, containerHeight.length - 1) * 1;
        if (e.pageX + containerWidth > pageWidth) {
            if (e.pageX - containerWidth - 10 > 0) {
                container.style.left = e.pageX - containerWidth - 40 + "px";
            } else {
                container.style.left = 0 + "px";
            }
        } else {
            container.style.left = e.pageX + 20 + "px";
        }
        if (e.pageY + containerHeight > pageHeight) {
            if (e.pageY - containerHeight - 10 > 0) {
                container.style.top = e.pageY - containerHeight - 20 + "px";
            } else {
                container.style.top = 0 + "px";
            }
        } else {
            container.style.top = e.pageY + 20 + "px";
        }
        inView = isElementInViewport(container);
        if (!inView) {
            container.style.top = window.pageYOffset + 20 + "px";
        }
        e.stopPropagation();
        // 通知spacing触发鼠标移动事件
        window.mouseEventEle = e;
        window.postMessage({ type: "spacing-mouse-move" }, "*");
    }
    // 鼠标移出，将边框取消掉
    function cssMouseOut(e) {
        this.style.outline = "";
        e.stopPropagation();
        // 通知spacing触发鼠标移出事件
        window.mouseEventEle = e;
        window.postMessage({ type: "spacing-mouse-out" }, "*");
    }
    // 判断元素是否在视窗范围内
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <=
                (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <=
                (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    // 获取当前元素上对应的cssRules
    function getEleStyleStr(document) {
        let sheets = document.styleSheets;
        let allRules = [];
        for (let i in sheets) {
            let rules = sheets[i].rules || sheets[i].cssRules;
            for (let r in rules) {
                let rule = rules[r];
                allRules.push(rule);
            }
        }
        return allRules;
    }

    class CssDetector {
        constructor() {
            this.isEnable = false;
            this.isFreeze = false;
            this.hasListenEvents = false;
        }
        // 判断是否是antdesign元素
        _isAntElement(element) {
            let classList = element.classList ? element.classList : [];
            let isAnt = [...classList].find(
                (item) => item.indexOf("ant-") > -1
            );
            return !!isAnt;
        }
        // 递归获取当前页面所有的elements
        _getAllElements(element) {
            let elements = [];
            if (element && element.hasChildNodes()) {
                elements.push(element);
                let childs = element.childNodes;
                for (let i = 0; i < childs.length; i++) {
                    if (childs[i].hasChildNodes()) {
                        elements = elements.concat(
                            this._getAllElements(childs[i])
                        );
                    } else if (childs[i].nodeName === "IFRAME") {
                        // ICC子系统是iframe，还要获取iframe的所有元素
                        let currentDoc = childs[i].contentDocument;
                        if (currentDoc) {
                            iframeList.push(currentDoc);
                            elements = elements.concat(
                                this._getAllElements(currentDoc.body)
                            );
                        }
                    } else if (childs[i].nodeType === 1) {
                        if (!this._isAntElement(childs[i])) {
                            elements.push(childs[i]);
                        }
                    }
                }
            }
            return elements;
        }
        // 创建悬浮卡片
        _createHoverCard() {
            const document = getDocument();
            let cardEle = null;
            if (document) {
                // 先创建悬浮卡片容器
                cardEle = document.createElement("div");
                cardEle.id = "css_detector_container";
                // 创建容器头部header
                let header = document.createElement("div");
                header.id = "css_detector_container_header";
                cardEle.appendChild(header);
                // 创建容器内容区域body
                let body = document.createElement("div");
                body.id = "css_detector_container_body";
                let ttable = document.createElement("table");
                let thead = document.createElement("thead");
                let tr = document.createElement("tr");
                let th1 = document.createElement("th");
                th1.className = "css_detector_container_thead1";
                th1.innerHTML = "样式名";
                let th2 = document.createElement("th");
                th2.className = "css_detector_container_thead2";
                th2.innerHTML = "样式类型";
                let th3 = document.createElement("th");
                th3.className = "css_detector_container_thead3";
                th3.innerHTML = "值";
                tr.appendChild(th1);
                tr.appendChild(th2);
                tr.appendChild(th3);
                thead.appendChild(tr);
                ttable.appendChild(thead);
                let tbody = document.createElement("tbody");
                cardEle.appendChild(body);
                cssDict.map(function (item) {
                    let tr = document.createElement("tr");
                    tr.id = `css_detector_${item.name}`;
                    let td1 = document.createElement("td");
                    td1.className = "css_detector_container_td1";
                    td1.innerHTML = item.name;
                    let td2 = document.createElement("td");
                    td2.className = "css_detector_container_td2";
                    td2.innerHTML = item.typeName;
                    let td3 = document.createElement("td");
                    td3.className = "css_detector_container_td3";
                    td3.innerHTML = item.value;
                    tr.appendChild(td1);
                    tr.appendChild(td2);
                    tr.appendChild(td3);
                    tbody.appendChild(tr);
                });
                ttable.appendChild(tbody);
                body.appendChild(ttable);
                // 创建容器底部区域结构footer
                let footer = document.createElement("div");
                footer.id = "css_detector_container_footer";
                footer.appendChild(document.createTextNode(""));
                cardEle.appendChild(footer);
            }
            return cardEle;
        }
        // 给每个元素绑定鼠标移动事件
        _addEventListener() {
            const document = getDocument();
            if (document) {
                iframeList = [];
                let elements = this._getAllElements(document.body);
                for (let i = 0; i < elements.length; i++) {
                    const element = elements[i];
                    element.addEventListener("mouseover", cssMouseOver, false);
                    element.addEventListener("mousemove", cssMouseMove, false);
                    element.addEventListener("mouseout", cssMouseOut, false);
                }
            }
            this.hasListenEvents = true;
        }
        // 给每个元素移除鼠标移动事件
        _removeEventListener() {
            const document = getDocument();
            if (document) {
                iframeList = [];
                let elements = this._getAllElements(document.body);
                for (let i = 0; i < elements.length; i++) {
                    const element = elements[i];
                    element.removeEventListener(
                        "mouseover",
                        cssMouseOver,
                        false
                    );
                    element.removeEventListener(
                        "mousemove",
                        cssMouseMove,
                        false
                    );
                    element.removeEventListener("mouseout", cssMouseOut, false);
                }
            }
            this.hasListenEvents = false;
        }
        // 启用
        enable() {
            const document = getDocument();
            let container = document.getElementById("css_detector_container");
            if (!container) {
                this._addEventListener();
                container = this._createHoverCard();
                document.body.appendChild(container);
                this.isEnable = true;
            }
        }
        // 禁用
        disable() {
            const document = getDocument();
            let container = document.getElementById("css_detector_container");
            if (container) {
                document.body.removeChild(container);
                this._removeEventListener();
                this.isEnable = false;
            }
        }
        // 冻结
        freeze() {
            const document = getDocument();
            let container = document.getElementById("css_detector_container");
            if (container && this.hasListenEvents) {
                this._removeEventListener();
                this.isFreeze = true;
            }
        }
        // 解冻
        unfreeze() {
            const document = getDocument();
            let container = document.getElementById("css_detector_container");
            currentElement && (currentElement.style.outline = "");
            if (container && !this.hasListenEvents) {
                this._addEventListener();
                this.isFreeze = false;
            }
        }
        // 获取当前实例的启用状态
        isEnabled() {
            return this.isEnable;
        }
        // 销毁
        destroy() {
            currentElement && (currentElement.style.outline = "");
            cssDetector.disable();
            const domMapVals = [...domMap.values()];
            domMapVals.map((item) => item.remove());
            domMap.clear();

            // 销毁cssDetector实例
            cssDetector = null;
            document.removeEventListener("keyup", cssDetectorKeyUpListener);
            document.removeEventListener("keydown", cssDetectorKeyListener);
            // 给每个iframe的document绑定键盘事件
            if (iframeList.length) {
                for (let i = 0; i < iframeList.length; i++) {
                    let doc = iframeList[i];
                    doc.removeEventListener("keyup", cssDetectorKeyUpListener);
                    doc.removeEventListener("keydown", cssDetectorKeyListener);
                }
            }
        }
    }
    // 键盘按下的事件
    function cssDetectorKeyListener(e) {
        if (!cssDetector || !cssDetector.isEnabled()) return;
        // 按下ESC键，直接退出
        if (e.keyCode === 27) {
            cssDetector.destroy();
            // 销毁spacing实例
            window.postMessage({ type: "spacing-destroy" }, "*");
        }
        // 按下F键，冻结/解冻
        if (e.keyCode === 70) {
            if (cssDetector.hasListenEvents) {
                cssDetector.freeze();
            } else {
                cssDetector.unfreeze();
            }
        }
        // 按下Control键，启用间距检测
        if (e.keyCode === "control") {
            currentElement && (currentElement.style.outline = "");
            cssDetector.disable();
            const domMapVals = [...domMap.values()];
            domMapVals.map((item) => item.remove());
            domMap.clear();
        }
    }
    // 键盘抬起的事件
    function cssDetectorKeyUpListener(e) {
        // 重新启用Token检测
        if (e.key === "Control" && cssDetector) {
            cssDetector.enable();
        }
    }
    // 创建cssDetector实例
    if (!cssDetector) {
        cssDetector = new CssDetector();
        cssDetector.enable();
    } else {
        if (!cssDetector.isEnabled()) {
            cssDetector.enable();
        }
    }
    document.onkeydown = cssDetectorKeyListener;
    document.onkeyup = cssDetectorKeyUpListener;
    // 给每个iframe的document绑定键盘事件
    if (iframeList.length) {
        for (let i = 0; i < iframeList.length; i++) {
            let doc = iframeList[i];
            doc.onkeydown = cssDetectorKeyListener;
            doc.onkeyup = cssDetectorKeyUpListener;
        }
    }
    // 监听来自其他内容脚本的信息
    window.addEventListener("message", function (event) {
        // 确保消息来自自己的脚本
        if (event.source !== window) return;
        if (event.data.type && event.data.type === "css-detector-enable") {
            cssDetector.enable();
        }
        if (event.data.type && event.data.type === "css-detector-destroy") {
            cssDetector.destroy();
        }
    });
})();
