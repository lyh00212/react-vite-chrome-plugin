// 截图功能
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

var maskDom = createMask();
var isSelectModel = false;
var isMousedown = null;
var target = {};

window.globalClickMouseDowned = null;
window.globalClickDownTime = null;

document.addEventListener("mousedown", listenerMousedown);
document.addEventListener("mouseup", listenerMouseup);
document.addEventListener("mousemove", listenerMousemove);

function listenerMousedown(event) {
    if (isSelectModel) return;
    // target.style.pointerEvents = "none";
    isMousedown = true;
    if (event.which !== 1) {
        window.globalClickMouseDowned = true;
        window.globalClickDownTime = new Date().getTime();
    }
}

async function listenerMouseup(event) {
    if (isSelectModel) return;
    isMousedown = false;
    // target.style.pointerEvents = "auto";
    if (window.globalClickMouseDowned && event.which === 1) {
        window.globalClickMouseDowned = false;
        const now = new Date().getTime();
        if (now - window.globalClickDownTime < 300) {
            // 关闭选择模式
            isSelectModel = false;
            maskDom.style.display = "none";

            const infos = {
                x: parseInt(maskDom.style.left),
                y: parseInt(maskDom.style.top),
                w: parseInt(maskDom.style.width),
                h: parseInt(maskDom.style.height),
            };

            // console.log('dom infos:', infos);
            // 返回整个屏幕截图
            const screen_image = await chrome.runtime.sendMessage({
                type: "screenshot",
            });
            if (!screen_image.image) {
                alert(chrome.i18n.getMessage("errorMsg"));
                return;
            }

            const crop_image = await crop(screen_image.image, infos);
            copy_img_to_clipboard(crop_image);
        }
    }
}
function listenerMousemove(event) {
    if (!isSelectModel) return;

    /**
     * 鼠标移入时的高亮处理
     */
    if (!isMousedown) {
        // 拿到鼠标移入的元素集合
        const paths = document.elementsFromPoint(event.x, event.y);
        // 这里取第一个就行
        target = paths[0];
        // console.log("target:", target);

        if (target) {
            // 拿到元素的坐标信息
            const targetDomInfo = target.getBoundingClientRect();
            const h = targetDomInfo.height,
                w = targetDomInfo.width,
                l = targetDomInfo.left,
                t = targetDomInfo.top;

            maskDom.style.width = w + "px";
            maskDom.style.height = h + "px";
            maskDom.style.left = l + "px";
            maskDom.style.top = t + "px";
            maskDom.style.display = "block";
        } else {
            maskDom.style.display = "none";
        }
    }
}

/**
 * 图片裁剪
 * @param image base64
 * @param opts (x,y,w,h)
 * @return Promise<base64>
 */
function crop(image, opts) {
    return new Promise((resolve, reject) => {
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
            context.drawImage(img, x, y, w, h, 0, 0, w, h);
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
async function copy_img_to_clipboard(image, destroy_ins, image_container) {
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
function createButton(text, backgroundColor, right, border, onClick) {
    const btn = document.createElement("div");
    btn.style.width = "60px";
    btn.style.height = "32px";
    btn.style.borderRadius = "4px";
    btn.style.background = backgroundColor;
    btn.style.position = "absolute";
    btn.style.right = right;
    btn.style.bottom = border;
    btn.style.fontSize = "14px";
    btn.style.display = "flex";
    btn.style.justifyContent = "center";
    btn.style.cursor = "pointer";
    btn.textContent = text; // 设置按钮文本
    // 绑定点击事件
    btn.addEventListener("click", onClick);

    return btn;
}

function createMask() {
    const mask = document.createElement("div");
    // 必须让鼠标指针能够穿透 mask 元素
    mask.style.pointerEvents = "none";
    mask.style.background = "rgb(3, 132, 253, 0.22)";
    mask.style.position = "fixed";
    mask.style.zIndex = 999999999999;
    mask.style.display = "none";
    document.body.appendChild(mask);
    return mask;
}

/**
 * 监听 service-worker、功能页 发来的消息
 */
chrome.runtime.onMessage.addListener((req, sender, res) => {
    console.log(req, "content-----");

    console.log("监听到了");
    if (req.type === "screenshot-selected-area") {
        // 截取所选区域
        area_screenshot();
    }
    if (req.type === "screenshot-full-screen") {
        // 截取全屏
        page_screenshot();
    }
    if (req.type === "destroy-screenshot-iframe") {
        // 销毁iframe
        destroy_screenshot_iframe();
    }
});

/**
 * 进行区域截图
 */
function area_screenshot() {
    // 返回整个屏幕截图
    chrome.runtime.sendMessage(
        {
            type: "screenshot",
        },
        (screen_image) => {
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
            image_container.style.zIndex = 99999999999;
            document.body.append(image_container);
            const image_dom = document.createElement("img");
            image_dom.src = screen_image.image;
            image_dom.style.maxWidth = "100%";
            image_container.append(image_dom);

            const infos = [];
            console.log(image_dom, "image_dom-----");

            const destroy_ins = new Cropper(image_dom, {
                autoCrop: true,
                autoCropArea: 0.001,
                zoomOnTouch: false,
                zoomOnWheel: false,
                movable: false,
                rotatable: false,
                zoomable: false,
                crop(event) {
                    console.log(event, "crop-----");

                    (infos.x = event.detail.x),
                        (infos.y = event.detail.y),
                        (infos.w = event.detail.width),
                        (infos.h = event.detail.height);
                },
                async cropend() {
                    console.log(cropend, "----");

                    const crop_image = await crop(screen_image.image, infos);
                    copy_img_to_clipboard(
                        crop_image,
                        destroy_ins,
                        image_container
                    );
                },
            });
        }
    );
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

const init_iframe = () => {
    console.log("init");
};
