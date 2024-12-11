declare class Cropper {
    constructor(element: HTMLElement, options?: Cropper.Options);
    destroy(): void;

    static readonly DEFAULTS: Cropper.Options;
}

declare namespace Cropper {
    interface Options {
        aspectRatio?: number;
        autoCrop?: boolean;
        autoCropArea?: number;
        zoomOnTouch?: boolean;
        zoomOnWheel?: boolean;
        movable?: boolean;
        rotatable?: boolean;
        zoomable?: boolean;
        crop?(event: Cropper.Event): void;
        cropend?(event: Cropper.Event): void;
    }

    interface Event {
        detail: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }
}
