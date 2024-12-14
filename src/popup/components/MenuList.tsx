import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import styles from "./MenuList.module.less";

interface MenuItem {
    title: string;
    shortcutKey: string;
    click: () => void;
}

const menuList: MenuItem[] = [
    {
        title: "截取所选区域",
        shortcutKey: "+Shift+X",
        click: () => screenShot("screenshot-selected-area"),
    },
    {
        title: "截取全屏",
        shortcutKey: "+Shift+X",
        click: () => screenShot("screenshot-full-screen"),
    },
];
const screenShot = (method: string) => {
    window.close();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id!, { type: method });
    });
};
const MenuList: FC = () => {
    const [isCommand, setIsCommand] = useState<string>();
    const nav = useNavigate();
    const settingPlugin = () => {
        chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
    };
    const loginOut = () => {
        nav("/login");
    };
    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        const shortKey = userAgent.indexOf("mac") > -1 ? "Command" : "Ctrl";
        setIsCommand(shortKey);
    }, []);
    return (
        <div className={styles["menu-list"]}>
            <div className={styles["menu-top"]}>
                {menuList.map((item) => (
                    <div className={styles["menu-item"]} onClick={item.click}>
                        <span className={styles.title}>{item.title}</span>
                        <span className={styles["shortcut-key"]}>
                            {isCommand + item.shortcutKey}
                        </span>
                    </div>
                ))}
            </div>
            <div className={styles["menu-footer"]}>
                <div className={styles["footer-item"]} onClick={settingPlugin}>
                    <SettingOutlined />
                    <span className={styles["footer-name"]}>设置</span>
                </div>
                <div className={styles["footer-item"]} onClick={loginOut}>
                    <LogoutOutlined />
                    <span className={styles["footer-name"]}>退出登录</span>
                </div>
            </div>
        </div>
    );
};

export default MenuList;
