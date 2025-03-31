import Rect from "./rect";
import {
    clearPlaceholderElement,
    createPlaceholderElement,
} from "./placeholder";
import { placeMark, removeMarks } from "./marker";
import { isElementInIframe } from "./lib/utils";
import { Spacing as SpacingType } from "./type";

(function () {
    let active: boolean = false;
    let hoveringElement: HTMLElement | null = null;
    let selectedElement: HTMLElement | null;
    let targetElement: HTMLElement | null;
    let delayedDismiss: boolean = false;
    let delayedRef: ReturnType<typeof setTimeout> | null = null;

    const Spacing: SpacingType = {
        start() {
            if (!document.body) {
                console.warn(
                    `Unable to initialise, document.body does not exist.`
                );
                return;
            }
            // 添加事件监听器给主窗口
            addEventListeners(window);

            const iframes = document.querySelectorAll("iframe");
            iframes.forEach((iframe) => {
                iframe.onload = () => {
                    // 获取 iframe 的 window 对象
                    const iframeWindow = iframe.contentWindow as any;
                    if (iframeWindow) {
                        addEventListeners(iframeWindow);
                    }
                };
                // 直接添加事件监听器（在 iframe 加载之前）
                const iframeWindow = iframe.contentWindow as any;
                if (iframeWindow) {
                    addEventListeners(iframeWindow);
                }
            });
        },

        stop() {
            // 添加事件监听器给主窗口
            removeEventListeners(window);

            const iframes = document.querySelectorAll("iframe");
            iframes.forEach((iframe) => {
                iframe.onload = () => {
                    const iframeWindow = iframe.contentWindow as any;
                    if (iframeWindow) {
                        removeEventListeners(iframeWindow);
                    }
                };
                const iframeWindow = iframe.contentWindow;
                if (iframeWindow) {
                    removeEventListeners(iframeWindow);
                }
            });
        },
    };

    // 统一添加事件处理函数
    const addEventListeners = (targetWindow: any) => {
        targetWindow.addEventListener("keydown", keyDownHandler);
        targetWindow.addEventListener("keyup", keyUpHandler);
        targetWindow.addEventListener("mousemove", cursorMoveHandler);
        targetWindow.addEventListener("mouseout", cursorLeaveHandler);
    };

    // 统一添加事件处理函数
    const removeEventListeners = (targetWindow: any) => {
        targetWindow.removeEventListener("keydown", keyDownHandler);
        targetWindow.removeEventListener("keyup", keyUpHandler);
        targetWindow.removeEventListener("mousemove", cursorMoveHandler);
        targetWindow.removeEventListener("mouseout", cursorLeaveHandler);
    };

    function keyDownHandler(e: KeyboardEvent) {
        if (delayedDismiss) {
            cleanUp();
            if (delayedRef) {
                clearTimeout(delayedRef);
                delayedRef = null;
            }
        }
        if (!hoveringElement) return;
        if (e.key === "Control" && !active) {
            e.preventDefault();
            active = true;
            setSelectedElement();
            preventPageScroll(true);
        }
        if (e.shiftKey) {
            delayedDismiss = true;
        }
    }

    function keyUpHandler(e: KeyboardEvent) {
        if (e.key === "Control" && active) {
            delayedRef = setTimeout(
                () => {
                    cleanUp();
                },
                delayedDismiss ? 5000 : 0
            );
        }
    }

    function cursorLeaveHandler(e: MouseEvent) {
        const to = e.relatedTarget as HTMLElement;
        if (!to || to.nodeName === "HTML") {
            hoveringElement = null;
            cleanUp();
        }
    }

    function cleanUp(): void {
        active = false;
        clearPlaceholderElement("selected");
        clearPlaceholderElement("target");
        delayedDismiss = false;
        selectedElement = null;
        targetElement = null;
        removeMarks();
        preventPageScroll(false);

        // 重新启用Token检测
        // window.postMessage({ type: "css-detector-enable" }, "*");
    }

    function cursorMoveHandler(e: MouseEvent) {
        if (e.composedPath) {
            hoveringElement = e.composedPath()[0] as HTMLElement;
            if (!e.composedPath()[0]) {
                hoveringElement = e.target as HTMLElement;
            } else {
                hoveringElement = e.target as HTMLElement;
            }
        }
        if (!active) return;

        setTargetElement().then(() => {
            if (selectedElement !== null && targetElement !== null) {
                const selectedElementRect: DOMRect =
                    selectedElement.getBoundingClientRect();
                const targetElementRect: DOMRect =
                    targetElement.getBoundingClientRect();

                const selected: Rect = new Rect(selectedElementRect);
                const target: Rect = new Rect(targetElementRect);

                removeMarks();

                let top: number,
                    bottom: number,
                    left: number,
                    right: number,
                    outside: boolean;

                if (
                    selected.containing(target) ||
                    selected.inside(target) ||
                    selected.colliding(target)
                ) {
                    console.log(`containing || inside || colliding`);

                    top = Math.round(
                        Math.abs(
                            selectedElementRect.top - targetElementRect.top
                        )
                    );
                    bottom = Math.round(
                        Math.abs(
                            selectedElementRect.bottom -
                                targetElementRect.bottom
                        )
                    );
                    left = Math.round(
                        Math.abs(
                            selectedElementRect.left - targetElementRect.left
                        )
                    );
                    right = Math.round(
                        Math.abs(
                            selectedElementRect.right - targetElementRect.right
                        )
                    );
                    outside = false;
                } else {
                    console.log("outside");

                    top = Math.round(
                        Math.abs(
                            selectedElementRect.top - targetElementRect.bottom
                        )
                    );
                    bottom = Math.round(
                        Math.abs(
                            selectedElementRect.bottom - targetElementRect.top
                        )
                    );
                    left = Math.round(
                        Math.abs(
                            selectedElementRect.left - targetElementRect.right
                        )
                    );
                    right = Math.round(
                        Math.abs(
                            selectedElementRect.right - targetElementRect.left
                        )
                    );
                    outside = true;
                }
                // 判断当前元素是否在iframe中，是的话 top 需要加上 iframe 的 top 值，left 同
                const iframeEle = isElementInIframe(selectedElement);
                let iframeTop, iframeLeft;
                if (iframeEle) {
                    const { top: ifrTop, left: ifrLeft } =
                        iframeEle.getBoundingClientRect();
                    iframeTop = ifrTop;
                    iframeLeft = ifrLeft;
                }

                placeMark(selected, target, "top", `${top}px`, outside, {
                    iframeTop,
                    iframeLeft,
                });
                placeMark(selected, target, "bottom", `${bottom}px`, outside, {
                    iframeTop,
                    iframeLeft,
                });
                placeMark(selected, target, "left", `${left}px`, outside, {
                    iframeTop,
                    iframeLeft,
                });
                placeMark(selected, target, "right", `${right}px`, outside, {
                    iframeTop,
                    iframeLeft,
                });
            }
        });
    }

    function setSelectedElement(): void {
        if (hoveringElement && hoveringElement !== selectedElement) {
            selectedElement = hoveringElement;
            clearPlaceholderElement("selected");
            createPlaceholderElement("selected", selectedElement, "red");
        }
    }

    function setTargetElement(): Promise<void> {
        return new Promise((resolve) => {
            if (
                active &&
                hoveringElement &&
                hoveringElement !== selectedElement &&
                hoveringElement !== targetElement
            ) {
                targetElement = hoveringElement;
                clearPlaceholderElement("target");
                createPlaceholderElement("target", targetElement, "blue");
                resolve();
            }
        });
    }

    function preventPageScroll(active: boolean): void {
        if (active) {
            window.addEventListener(
                "DOMMouseScroll",
                scrollingPreventDefault,
                false
            );
            window.addEventListener("wheel", scrollingPreventDefault, {
                passive: false,
            });
            window.addEventListener("mousewheel", scrollingPreventDefault, {
                passive: false,
            });
        } else {
            window.removeEventListener(
                "DOMMouseScroll",
                scrollingPreventDefault
            );
            window.removeEventListener("wheel", scrollingPreventDefault);
            window.removeEventListener("mousewheel", scrollingPreventDefault);
        }
    }

    function scrollingPreventDefault(e: Event): void {
        e.preventDefault();
    }

    // 监听来自其他内容脚本的消息
    window.addEventListener("message", (event) => {
        // 确保消息来自自己的脚本
        if (event.source !== window) return;

        if (event.data.type && event.data.type === "spacing-mouse-move") {
            cursorMoveHandler((window as any).mouseEventEle);
        }
        if (event.data.type && event.data.type === "spacing-mouse-out") {
            cursorLeaveHandler((window as any).mouseEventEle);
        }

        if (event.data.type && event.data.type === "spacing-destroy") {
            Spacing.stop();
        }
    });
    Spacing.start();
})();
