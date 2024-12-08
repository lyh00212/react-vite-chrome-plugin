console.log("content file");
console.log("163422");
console.log("test");
console.log("test");
console.log("test000000");
console.log("test--------------");

const init = () => {
    const addIframe = (id: string, pagePath: string) => {
        const contentIframe = document.createElement("iframe");
        contentIframe.id = id;
        contentIframe.style.cssText =
            "width: 80%; height: 100%; position: fixed; inset: 0px; margin: 0px auto; z-index: 10000002; border: none;";
        const getContentPage = chrome.runtime.getURL(pagePath);
        contentIframe.src = getContentPage;
        document.body.appendChild(contentIframe);
    };
    addIframe("content-start-iframe", "contentPage/index.html");
};

if (window.top === window.self) {
    init();
}
