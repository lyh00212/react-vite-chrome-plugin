import { FC, useEffect, useState } from "react";
import "./App.css";

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
        <div id="app">
            <img src={img} />
        </div>
    );
};

export default App;
