import { FC } from "react";
import { useNavigate } from "react-router-dom";

const Register: FC = () => {
    const nav = useNavigate();
    return <div onClick={() => nav("/")}>Register</div>;
};

export default Register;
