import {ChangeEvent, useEffect, useState} from "react";
import axios from "axios";
import {ChatRoomType} from "./mainPage.type";
import {useMoveToPage} from "../../src/commponent/useMoveToPage";
import {Button, Modal} from "antd";
import {useRouter} from "next/router";

export default function mainPage():JSX.Element {

    const [chatRoomList, setChatRoomList] = useState([]);
    const [check, setCheck] = useState(true);
    const [title, setTitle] = useState("");
    const [password, setPassword] = useState("");
    const [checkDup, setCheckDup] = useState(true);
    const [loginPW, setLoginPW] = useState("");
    const [signPW, setSignPW] = useState("");
    const [loginName, setLoginName] = useState("");
    const [signName, setSignName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");


    const { onClickMoveToPage } = useMoveToPage();
    const router = useRouter();

    useEffect(()=>{
        axios.get("http://localhost:8080/chatroom")
            .then((result)=>{console.log(result.data)
                setChatRoomList(result.data);
                console.log(chatRoomList.length);
            })
            .catch(()=>{console.log("Error")})
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen1, setIsModalOpen1] = useState(false);

    const showModal = (index:number) => {
        if(index==1){
            setIsModalOpen(true);
        }
        else{
            setIsModalOpen1(true);
        }
    };
    const showModal1 = () => {
        setIsModalOpen1(true);
    };
    const handleOk = () => {
        if(!checkDup){
            alert("chatroom 중복체크 먼제 해주세요")
            return
        }
        setIsModalOpen(false);
        console.log(title, password);
        setTitle("");
        setPassword("");
        setCheckDup(false);
        axios.post("http://localhost:8080/chatroom", {
            roomName:title,
            limitUserCnt:(document.getElementById("limitCnt") as HTMLInputElement).value,
            password
        })
            .then((result) =>{
                    console.log(result.data)
                    router.push(`/chatRoom/${result.data.id}`);
                }
            )
            .catch(
                // TODO : error 처리
            )
    };
    const handleLogin = () => {
        axios.post("http://localhost:8080/user/login", {
            name:loginName,
            password:loginPW
        }).then((result)=>{
            alert(`안녕하세요! ${result.data.name}님`)
            window.localStorage.setItem("name", result.data.name);
        }).catch((e) =>{
            alert(e.message);
        })
        setIsModalOpen1(false);
    };
    const handleSign = () => {
        axios.post("http://localhost:8080/user/sign", {
            name:signName,
            password:signPW,
            phoneNumber:phone,
            email
        }).then((result)=>{
            alert("회원가입이 정상적으로 진행되었습니다")
        }).catch((e) => {
            alert(e.message)
        })
        setIsModalOpen1(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setTitle("");
        setPassword("");
        setCheckDup(false);
    };
    const handleCancel1 = () => {
        setIsModalOpen1(false);
    };
    const checkBox = (e:ChangeEvent<HTMLInputElement>) =>{
        console.log(e.target.value);
        setCheck((prop) => !prop);
        setPassword("");
    }

    function changeTitle(e: ChangeEvent<HTMLInputElement>) {
        setTitle(e.target.value);
    }
    function changePW(e: ChangeEvent<HTMLInputElement>) {
        setPassword(e.target.value);
    }


    function onClickDupBtn() {
        console.log(title)
        axios.post("http://localhost:8080/chatroom/duplication", {roomName : title})
            .then((result) =>{
                console.log(result.data)
                if(result.data){
                    setCheckDup(true);
                    alert("사용 가능한 chatroom name 입니다")
                }
                else{
                    setCheckDup(false);
                    alert("중복된 chatroom name 입니다")
                }
            })
            .catch(

            )
    }

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

    };
    return (
        <div>
            <h1>chatRoom 목록</h1>
            <div>
                {
                    chatRoomList.length != 0 ?
                    chatRoomList.map((chatroom:ChatRoomType) => {
                        return <div key={chatroom.id} onClick={onClickMoveToPage(`/chatRoom/${chatroom.id}`)}>{chatroom.roomName}</div>;}) : "방이 없습니다"
                }
            </div>
            <button onClick={() => showModal(1)}>계시글 등록</button>
            <button onClick={() => showModal(2)}>login</button>
            <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <input id = {"titleInput"} placeholder={"방이름"} value={title} onChange={changeTitle}/><button onClick={onClickDupBtn}>중복 체크</button><br/>
                <input type="checkbox" onChange={checkBox}/>비밀번호 여부<br/>
                <input id = {"passwordInput"} placeholder={"비밀번호"} disabled={check} value={password} onChange={changePW}/><br/>
                <div>인원수(2~10)</div>
                <input id = {"limitCnt"} defaultValue={2} type="number" />
            </Modal>
            <Modal
                open={isModalOpen1}
                title="로그인"
                onCancel={handleCancel1}
                footer={(_, { OkBtn, CancelBtn }) => (
                    <>
                        <Button onClick={handleLogin}>login</Button>
                        <Button onClick={handleSign}>sign up</Button>
                        <CancelBtn />
                    </>
                )}
            >
                name : <input value = {loginName} onChange={(e) => {changeInput(e, "loginName")}}/><br/>
                password : <input type="password" onChange={(e) => {changeInput(e, "loginPW")}} value={loginPW}/><br/>

                <h3>회원가입</h3>
                name : <input value={signName} onChange={(e) => {changeInput(e, "signName")}}/><br/>
                password : <input type="password" value={signPW} onChange={(e) => {changeInput(e, "signPW")}}/><br/>
                email : <input value={email} onChange={(e) => {changeInput(e, "email")}}/><br/>
                phone_number : <input value={phone} onChange={(e) => {changeInput(e, "phone")}}/><br/>

            </Modal>
        </div>

    )
}
