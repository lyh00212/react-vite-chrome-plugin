import { createBrowserRouter } from "react-router-dom";
import Login from "../components/Login";
import Register from "../components/Register";
import MainLayout from "../components/MainLayout";
import MenuList from "../components/MenuList";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                path: "",
                element: <MenuList />,
            },
            // 插件第一次进入页面的路由是这个
            {
                path: "/popup/index.html",
                element: <MenuList />,
            },
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "register",
                element: <Register />,
            },
            {
                path: "*",
                element: <Login />,
            },
        ],
    },
]);
export default router;

// 常用的路由常量
export const HOME_PATH = "/";
export const LOGIN_PATH = "/login";
export const REGISTER_PATH = "/register";
