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
        setIsModalOpen(false);
        console.log(title, password);
        setTitle("");
        setPassword("");
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
                <input id = {"titleInput"} placeholder={"방이름"} value={title} onChange={changeTitle}/><br/>
                <input type="checkbox" onChange={checkBox}/>비밀번호 여부<br/>
                <input id = {"passwordInput"} placeholder={"비밀번호"} disabled={check} value={password} onChange={changePW}/><br/>
                <div>인원수(2~10)</div>
                <input id = {"limitCnt"}  type="number" />
            </Modal>
        </div>

    )
}
