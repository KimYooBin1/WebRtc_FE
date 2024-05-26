import {ChangeEvent, useEffect, useState} from "react";
import axios from "axios";
import {ChatRoomType} from "./mainPage.type";
import {useMoveToPage} from "../../src/commponent/useMoveToPage";
import {Modal} from "antd";

export default function mainPage():JSX.Element {

    const [chatRoomList, setChatRoomList] = useState([]);
    const [check, setCheck] = useState(true);
    const [title, setTitle] = useState("");
    const [password, setPassword] = useState("");
    const [checkDup, setCheckDup] = useState(true);
    const { onClickMoveToPage } = useMoveToPage();

    useEffect(()=>{
        axios.get("http://localhost:8080/chatroom")
            .then((result)=>{console.log(result.data)
                setChatRoomList(result.data);
                console.log(chatRoomList.length);
            })
            .catch(()=>{console.log("Error")})
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
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
                }
            )
            .catch(
                // TODO : error 처리
            )
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setTitle("");
        setPassword("");
        setCheckDup(false);
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
                }
                else{
                    setCheckDup(false);
                    alert("중복된 chatroom name 입니다")
                }
            })
            .catch(

            )
    }

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
            <button onClick={showModal}>계시글 등록</button>
            <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <input id = {"titleInput"} placeholder={"방이름"} value={title} onChange={changeTitle}/><button onClick={onClickDupBtn}>중복 체크</button><br/>
                <input type="checkbox" onChange={checkBox}/>비밀번호 여부<br/>
                <input id = {"passwordInput"} placeholder={"비밀번호"} disabled={check} value={password} onChange={changePW}/><br/>
                <div>인원수(2~10)</div>
                <input id = {"limitCnt"}  type="number" />
            </Modal>
        </div>

    )
}
