import {useMoveToPage} from "./useMoveToPage";
import {Button, Modal} from "antd";
import {ChangeEvent, useState} from "react";
import axios from "axios";
import {useRouter} from "next/router";

export const NavigationHeader = () => {
    const {onClickMoveToPage} = useMoveToPage()
    const [loginPW, setLoginPW] = useState("");
    const [signPW, setSignPW] = useState("");
    const [loginName, setLoginName] = useState("");
    const [signName, setSignName] = useState("");
    const [signUsername, setSignUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const [isModalOpen1, setIsModalOpen1] = useState(false);

    const router = useRouter();
    const changeInput = (e: ChangeEvent<HTMLInputElement>, type: String) => {
        if(type == "loginName"){
            setLoginName(e.target.value);
        }
        else if(type == "loginPW"){
            setLoginPW(e.target.value)
        }
        else if(type == "signName"){
            setSignName(e.target.value)
        }
        else if(type == "signPW"){
            setSignPW(e.target.value)
        }
        else if(type == "email"){
            setEmail(e.target.value)
        }
        else if(type == "phone"){
            setPhone(e.target.value)
        }
        else if(type == "username"){
            setSignUsername(e.target.value)
        }
    };

    const handleLogin = () => {
        const formData = new FormData();
        formData.append("username", loginName);
        formData.append("password", loginPW);
        axios.post("https://localhost/login", formData, {withCredentials:true}).then(()=>{
            // alert(`안녕하세요! ${result.data}님`)
            router.push("/loginSuccess");
        }).catch((e) =>{
            alert(e.response.data.message);
        })
        setIsModalOpen1(false);
    };
    const handleSign = () => {
        axios.post("https://localhost/user/sign", {
            username:signUsername,
            name:signName,
            password:signPW,
            phoneNumber:phone,
            email
        }).then(()=>{
            alert("회원가입이 정상적으로 진행되었습니다")
        }).catch((e) => {
            alert(e.response.data.message)
        })
        setIsModalOpen1(false);
    };

    const onNaverLogin = () => {
        window.location.href = "https://localhost/oauth2/authorization/naver";
        console.log("naver login")
    }
    const handleCancel1 = () => {
        setIsModalOpen1(false);
    };
    const showModal = () =>{
        setIsModalOpen1(true);
    }

    const logout = () => {
        axios.post("https://localhost/logout", {}, {withCredentials:true}).then(()=>{
            alert("로그아웃 되었습니다")
        }).catch((e) => {
            alert("이미 로그아웃 되었습니다")
        })
    }

    return (
        <>
            <Modal
                open={isModalOpen1}
                title="로그인"
                onCancel={handleCancel1}
                footer={(_, {  CancelBtn }) => (
                    <>
                        <Button onClick={onNaverLogin}>naver login</Button>
                        <Button onClick={handleLogin}>login</Button>
                        <Button onClick={handleSign}>sign up</Button>
                        <CancelBtn />
                    </>
                )}
            >
                name : <input value = {loginName} onChange={(e) => {changeInput(e, "loginName")}}/><br/>
                password : <input type="password" onChange={(e) => {changeInput(e, "loginPW")}} value={loginPW}/><br/>

                <h3>회원가입</h3>
                username : <input value={signUsername} onChange={(e) => {changeInput(e, "username")}}/><br/>
                name : <input value={signName} onChange={(e) => {changeInput(e, "signName")}}/><br/>
                password : <input type="password" value={signPW} onChange={(e) => {changeInput(e, "signPW")}}/><br/>
                email : <input value={email} onChange={(e) => {changeInput(e, "email")}}/><br/>
                phone_number : <input value={phone} onChange={(e) => {changeInput(e, "phone")}}/><br/>

            </Modal>
            <button onClick={onClickMoveToPage("/mainPage")}>채팅</button>
            <button onClick={onClickMoveToPage("/webrtc")}>화상 통화</button>
            <button onClick={showModal}>로그인</button>
            <button onClick={logout}>로그아웃</button>
        </>
    )
}
