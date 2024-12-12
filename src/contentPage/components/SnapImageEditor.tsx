import {
    useEffect,
    useRef,
    useState,
    forwardRef,
    useImperativeHandle,
} from "react";
import "tui-color-picker/dist/tui-color-picker.css";
import "tui-image-editor/dist/tui-image-editor.css";
import ImageEditor from "tui-image-editor";
import { customTheme, localeCN } from "./imageOptions";
// import { FloatButton } from "antd";
// import styles from "./SnapImageEditor.module.less";

const options = {
    // 编辑器的配置
    includeUI: {
        // menu: ["draw", "text"], // 支持的菜单
        // initMenu: "draw", // 默认开启绘图的功能，初始化时显示的菜单
        menuBarPosition: "bottom", // 菜单栏的位置
        loadImage: { path: "", name: "预览图片" }, // 默认加载的图片
        locale: localeCN, // 文字汉化
        theme: customTheme, // 样式修改
    },
    cssMaxWidth: 700,
    cssMaxHeight: 500,
    selectionStyle: {
        cornerSize: 20,
        rotatingPointOffset: 70,
    },
};

interface LocalImg {
    [key: string]: string;
}
interface ImageEditorRef {
    downloadImg: () => void;
}

const SnapImageEditor: React.ForwardRefRenderFunction<
    ImageEditorRef,
    unknown
> = (_, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [img, setImg] = useState<string>("");
    const imgContent = useRef<ImageEditor | null>(null);
    const downloadImg = () => {
        const imgData = imgContent.current?.toDataURL() as string;
        const link = document.createElement("a");
        link.href = imgData;
        link.download = "snapshot-editor-image.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    useImperativeHandle(
        ref,
        () => {
            return {
                downloadImg,
            };
        },
        []
    );
    useEffect(() => {
        const getImg = async () => {
            const localImg: LocalImg = await chrome.storage.local.get("image");
            setImg(localImg.image);
            if (!editorRef.current) return;
            options.includeUI.loadImage.path = img;
            imgContent.current = new ImageEditor(editorRef.current, options);
        };
        getImg();
    }, [img]);
    return <div id="tui-image-editor" ref={editorRef}></div>;
};

export default forwardRef(SnapImageEditor);
