import { FC, useRef } from "react";
import styles from "./App.module.less";
import SnapImageEditor from "./components/SnapImageEditor";
import { FloatButton } from "antd";
import { VerticalAlignBottomOutlined, StopOutlined } from "@ant-design/icons";
interface ImageEditorRef {
    downloadImg: () => void;
}
const App: FC = () => {
    const imageEditorRef = useRef<ImageEditorRef>(null);
    const downLoadImg = () => {
        imageEditorRef.current?.downloadImg();
    };
    const closeImageEditor = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id!, {
                type: "destroy-screenshot-iframe",
            });
        });
    };
    return (
        <div className={styles["snapshot-page"]}>
            <SnapImageEditor ref={imageEditorRef} />
            <FloatButton.Group shape="circle">
                <FloatButton
                    icon={<VerticalAlignBottomOutlined />}
                    tooltip={<div>下载图片</div>}
                    onClick={downLoadImg}
                />
                <FloatButton
                    icon={<StopOutlined />}
                    tooltip={<div>关闭编辑器</div>}
                    onClick={closeImageEditor}
                />
            </FloatButton.Group>
        </div>
    );
};

export default App;
