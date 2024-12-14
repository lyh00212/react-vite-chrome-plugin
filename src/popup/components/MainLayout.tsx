import { FC } from "react";
import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.less";

const MainLayout: FC = () => {
    console.log("mainLayout");

    return (
        <div className={styles["popup-home"]}>
            <Outlet />
        </div>
    );
};

export default MainLayout;
