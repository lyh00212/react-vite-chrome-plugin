// 截图功能
interface CropOpts {
    [key: string]: number;
}
interface CropObj {
    [key: string]: any;
}
/**
 * 图片裁剪
 * @param image base64
 * @param opts (x,y,w,h)
 * @return Promise<base64>
 */
function cropPic(image: string, opts: CropOpts) {
    return new Promise((resolve) => {
        const x = opts.x,
            y = opts.y;
        const w = opts.w,
            h = opts.h;
        const format = opts.format || "png";
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        document.body.append(canvas);

        const img = new Image();
        img.onload = () => {
            const context = canvas.getContext("2d");
            context!.drawImage(img, x, y, w, h, 0, 0, w, h);
            const cropped = canvas.toDataURL(`image/${format}`);
            canvas.remove();
            resolve(cropped);
        };
        img.src = image;
    });
}

/**
 * 将图片复制进用户粘贴板
 * @param image base64
 */
async function copy_img_to_clipboard(
    image: string,
    destroy_ins: CropObj,
    image_container: HTMLElement
) {
    await chrome.storage.local.set({ image: image }).then(() => {
        console.log("图片裁剪成功");
    });
    // 添加确定取消按钮
    const cropperCropBox =
        document.getElementsByClassName("cropper-crop-box")[0];
    const okBtn = createButton("确定", "#1c79f4", "0", "0", function () {
        // 注销掉刚刚产生的对象
        destroy_ins.destroy();
        image_container.remove();
        // 打开iframe嵌入页
        init_iframe();
    });
    cropperCropBox.appendChild(okBtn);
    const cancelButton = createButton(
        "取消",
        "none",
        "70px",
        "1px solid #ffffff",
        function () {
            // 注销掉刚刚产生的对象
            destroy_ins.destroy();
            image_container.remove();
        }
    );
    cropperCropBox.appendChild(cancelButton);
}

/**
 * 创建确认取消按钮
 */
function createButton(
    text: string,
    backgroundColor: string,
    right: string,
    border: string,
    onClick: () => void
) {
    const btn = document.createElement("div");
    btn.style.width = "60px";
    btn.style.height = "32px";
    btn.style.borderRadius = "4px";
    btn.style.background = backgroundColor;
    btn.style.position = "absolute";
    btn.style.right = right;
    btn.style.border = border;
    btn.style.fontSize = "14px";
    btn.style.display = "flex";
    btn.style.justifyContent = "center";
    btn.style.alignItems = "center";
    btn.style.cursor = "pointer";
    btn.textContent = text; // 设置按钮文本
    // 绑定点击事件
    btn.addEventListener("click", onClick);

    return btn;
}

/**
 * 监听 service-worker、功能页 发来的消息
 */
chrome.runtime.onMessage.addListener((req) => {
    // 由于manifest中设置了all_iframes:true，导致在存在iframe的页面，content.js会渲染多次，所以这里需要判断
    if (window.top === window.self) {
        const image_container = document.getElementById(
            "chrome-screenshot-image-container"
        );
        if (req.type === "screenshot-selected-area") {
            // 截取所选区域
            if (!image_container) {
                area_screenshot();
            }
        }
        if (req.type === "screenshot-full-screen") {
            // 截取全屏
            if (!image_container) {
                page_screenshot();
            }
        }
        if (req.type === "destroy-screenshot-iframe") {
            // 销毁iframe
            remove_iframe();
        }
        if (req.type === "exit_screenshot") {
            // 退出截屏
            exit_screenshot();
        }
    }
    return false;
});

/**
 * 进行区域截图
 */
async function area_screenshot() {
    // 返回整个屏幕截图
    const screen_image = await chrome.runtime.sendMessage({
        type: "screenshot",
    });
    if (!screen_image.image) {
        alert("截图失败，请刷新页面重试");
        return;
    }
    const image_container = document.createElement("div");
    image_container.style.width = "100vw";
    image_container.style.height = "100vh";
    image_container.style.position = "fixed";
    image_container.style.left = "0px";
    image_container.style.top = "0px";
    image_container.style.zIndex = "99999999999";
    image_container.id = "chrome-screenshot-image-container";
    document.body.append(image_container);
    const image_dom = document.createElement("img");
    image_dom.src = screen_image.image;
    image_dom.style.maxWidth = "100%";
    image_container.append(image_dom);

    const infos: CropOpts = {};
    const destroy_ins = new Cropper(image_dom, {
        autoCrop: true,
        autoCropArea: 0.001,
        zoomOnTouch: false,
        zoomOnWheel: false,
        movable: false,
        rotatable: false,
        zoomable: false,
        crop(event) {
            infos.x = event.detail.x;
            infos.y = event.detail.y;
            infos.w = event.detail.width;
            infos.h = event.detail.height;
        },
        async cropend() {
            const crop_image: string = (await cropPic(
                screen_image.image,
                infos
            )) as string;
            copy_img_to_clipboard(crop_image, destroy_ins, image_container);
        },
    });
}

async function page_screenshot() {
    // 返回整个屏幕截图
    const screen_image = await chrome.runtime.sendMessage({
        type: "screenshot",
    });
    if (!screen_image.image) {
        alert("截图失败，请刷新页面重试");
        return;
    }
    await chrome.storage.local.set({ image: screen_image.image });

    init_iframe();
}

function init_iframe() {
    console.log("init");
    const addIframe = (id: string, pagePath: string) => {
        const contentIframe = document.createElement("iframe");
        contentIframe.id = id;
        contentIframe.style.cssText =
            "width: 100%; height: 100%; position: fixed; inset: 0px; margin: 0px auto; z-index: 10000002; border: none;";
        const getContentPage = chrome.runtime.getURL(pagePath);
        contentIframe.src = getContentPage;
        document.body.appendChild(contentIframe);
    };
    if (window.top === window.self) {
        addIframe("content-start-iframe", "contentPage/index.html");
    }
}

function remove_iframe() {
    const iframe = document.getElementById(
        "content-start-iframe"
    ) as HTMLElement;
    iframe.remove();
}

function exit_screenshot() {
    const image_container = document.getElementById(
        "chrome-screenshot-image-container"
    );
    image_container?.remove();
}
