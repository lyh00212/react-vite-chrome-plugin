import { FC, useEffect, useState } from "react";
import styles from "./App.module.less";

interface LocalImg {
    [key: string]: string;
}

const App: FC = () => {
    const [img, setImg] = useState<string>("");
    useEffect(() => {
        const getImg = async () => {
            const localImg: LocalImg = await chrome.storage.local.get("image");
            setImg(localImg.image);
        };
        getImg();
    }, []);
    return (
        <div className={styles["snapshot-page"]}>
            <img src={img} />
        </div>
    );
};

export default App;
