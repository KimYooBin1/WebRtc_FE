import {useEffect, useState} from "react";
import axios from "axios";
import {ChatRoomType} from "./mainPage.type";
import {useMoveToPage} from "../../src/commponent/useMoveToPage";

export default function mainPage(): JSX.Element {

    const [chatRoomList, setChatRoomList] = useState([]);
    const { onClickMoveToPage } = useMoveToPage();

    useEffect(()=>{
        axios.get("http://localhost:8080/chatroom")
            .then((result)=>{console.log(result.data)
                setChatRoomList(result.data);
                console.log(chatRoomList.length);
            })
            .catch(()=>{console.log("Error")})
    }, []);
    function onclickBtn(id:number):void{

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
            <button onClick={() => {
                alert("게시글 등록 모달 띄우기")
            }}>계시글 등록</button>
        </div>
    )
}
