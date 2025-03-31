import Rect from "./rect";
import { LineBorder, Direction } from "./type";

function createLine(
    width: number,
    height: number,
    top: number,
    left: number,
    text: string,
    border: LineBorder = "none",
    iframeRect: any
): void {
    const marker: HTMLSpanElement = document.createElement("span");
    marker.style.backgroundColor = "red";
    marker.style.position = "fixed";
    marker.classList.add(`spacing-js-marker`);
    marker.style.width = `${width}px`;
    marker.style.height = `${height}px`;

    if (border === "x") {
        marker.style.borderLeft = "1px solid rgba(255, 255, 255, .8)";
        marker.style.borderRight = "1px solid rgba(255, 255, 255, .8)";
    }
    if (border === "y") {
        marker.style.borderTop = "1px solid rgba(255, 255, 255, .8)";
        marker.style.borderBottom = "1px solid rgba(255, 255, 255, .8)";
    }

    marker.style.pointerEvents = "none";
    if (iframeRect.iframeTop) {
        top += iframeRect.iframeTop;
    }
    if (iframeRect.iframeLeft) {
        left += iframeRect.iframeLeft;
    }
    marker.style.top = `${top}px`;
    marker.style.left = `${left}px`;
    marker.style.zIndex = "9998";
    marker.style.boxSizing = "content-box";

    const value: HTMLSpanElement = document.createElement("span");
    value.classList.add(`spacing-js-value`);
    value.style.backgroundColor = "red";
    value.style.color = "white";
    value.style.fontSize = "10px";
    value.style.display = "inline-block";
    value.style.fontFamily = "Helvetica, sans-serif";
    value.style.fontWeight = "bold";
    value.style.borderRadius = "20px";
    value.style.position = "fixed";
    value.style.width = "42px";
    value.style.lineHeight = "15px";
    value.style.height = "16px";
    value.style.textAlign = "center";
    value.style.zIndex = "10000";
    value.style.pointerEvents = "none";
    value.style.boxSizing = "content-box";
    value.innerText = text;

    if (border === "x") {
        let topOffset = top + height / 2 - 7;

        if (topOffset > document.documentElement.clientHeight - 20) {
            topOffset = document.documentElement.clientHeight - 20;
        }
        if (topOffset < 0) {
            topOffset = 6;
        }
        value.style.top = `${topOffset}px`;
        value.style.left = `${left + 6}px`;
    } else if (border === "y") {
        let leftOffset = left + width / 2 - 20;

        if (leftOffset > document.documentElement.clientWidth - 48) {
            leftOffset = document.documentElement.clientWidth - 48;
        }
        if (leftOffset < 0) {
            leftOffset = 6;
        }
        value.style.top = `${top + 6}px`;
        value.style.left = `${leftOffset}px`;
    }
    document.body.appendChild(marker);
    document.body.appendChild(value);
}

export function placeMark(
    rect1: Rect,
    rect2: Rect,
    direction: Direction,
    value: string,
    edgeToEdge: boolean = false,
    iframeRect: any
): void {
    if (direction === "top") {
        const width: number = 1;
        let height: number = Math.abs(rect1.top - rect2.top);
        const left: number = Math.floor(
            (Math.min(rect1.right, rect2.right) +
                Math.max(rect1.left, rect2.left)) /
                2
        );
        let top: number = Math.min(rect1.top, rect2.top);
        if (edgeToEdge) {
            if (rect1.top < rect2.top) {
                return;
            }
            if (rect1.right < rect2.left || rect1.left > rect2.right) {
                return;
            }
            height = Math.abs(rect2.bottom - rect1.top);
            top = Math.min(rect2.bottom, rect1.top);
        }
        createLine(width, height, top, left, value, "y", iframeRect);
    } else if (direction === "right") {
        let width: number = Math.abs(rect1.right - rect2.right);
        const height: number = 1;
        const top: number = Math.floor(
            (Math.min(rect1.bottom, rect2.bottom) +
                Math.max(rect1.top, rect2.top)) /
                2
        );
        const left: number = Math.min(rect1.right, rect2.right);
        if (edgeToEdge) {
            if (rect1.left > rect2.right) {
                return;
            }
            if (rect1.bottom < rect2.top || rect1.top > rect2.bottom) {
                return;
            }
            width = Math.abs(rect1.right - rect2.left);
        }
        createLine(width, height, top, left, value, "y", iframeRect);
    } else if (direction === "bottom") {
        const width: number = 1;
        let height: number = Math.abs(rect1.bottom - rect2.bottom);
        const top: number = Math.min(rect1.bottom, rect2.bottom);
        const left: number = Math.floor(
            (Math.min(rect1.right, rect2.right) +
                Math.max(rect1.left, rect2.left)) /
                2
        );
        if (edgeToEdge) {
            if (rect2.bottom < rect1.top) {
                return;
            }
            if (rect1.right < rect2.left || rect1.left > rect2.right) {
                return;
            }
            height = Math.abs(rect1.bottom - rect2.top);
        }
        createLine(width, height, top, left, value, "x", iframeRect);
    }
}

export function removeMarks(): void {
    document
        .querySelectorAll<HTMLSpanElement>(".spacing-js-marker")
        .forEach((element) => element.remove());
    document
        .querySelectorAll<HTMLSpanElement>(".spacing-js-value")
        .forEach((element) => element.remove());
}
