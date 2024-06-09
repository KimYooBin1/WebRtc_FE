import {ChangeEvent, useEffect, useState} from "react";
import axios from "axios";
import {ChatRoomType} from "./mainPage.type";
import {Modal} from "antd";
import {useRouter} from "next/router";
import {useStompConnect} from "../../src/common/useStompConnect";
import {NavigationHeader} from "../../src/commponent/NavigationHeader";

export default function MainPage():JSX.Element {

    const [chatRoomList, setChatRoomList] = useState([]);
    const [check, setCheck] = useState(true);
    const [title, setTitle] = useState("");
    const [password, setPassword] = useState("");
    const [checkDup, setCheckDup] = useState(true);

    const {checkRoom, checkLogin} = useStompConnect();

    const router = useRouter();
    useEffect(()=>{
        axios.get("https://localhost/chatroom")
            .then((result)=>{console.log(result.data)
                setChatRoomList(result.data);
                console.log(chatRoomList.length);
            })
            .catch(()=>{console.log("Error")})
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        if(checkLogin()){
            setIsModalOpen(true);
        }
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
        axios.post("https://localhost/chatroom", {
            roomName:title,
            limitUserCnt:(document.getElementById("limitCnt") as HTMLInputElement).value,
            password
        }, {withCredentials:true})
            .then((result) =>{
                    console.log("Data = ", result.data)
                    router.push(`/chatRoom/${result.data.id}`);
                }
            )
            .catch((e) =>{
                    console.log("error")
                    alert(e.response.data.message)
                }
            )
    };


    const handleCancel = () => {
        setIsModalOpen(false);
        setTitle("");
        setPassword("");
        setCheckDup(false);
        //@ts-ignore
        document.getElementById("titleInput").removeAttribute("disabled");
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
        axios.post("https://localhost/chatroom/duplication", {roomName: title}, {withCredentials: true})
            .then((result) => {
                console.log(result.data)
                if (result.data) {
                    setCheckDup(true);
                    alert("사용 가능한 chatroom name 입니다")
                    // @ts-ignore
                    document.getElementById("titleInput").setAttribute("disabled", "true");
                } else {
                    setCheckDup(false);
                    alert("중복된 chatroom name 입니다")
                }
            })
            .catch((e) => {
                    alert(e.response.data.message)
                }
            );
    }
    const onClickTest = () =>{
        axios.get("https://localhost/test", {withCredentials : true}).then((result) => {
                console.log(result);
            }
        ).catch((e) => {
                console.log(e)
                alert(e.response.data.message);
            }
        );
    }
    function onClickUser() {
        axios.get("https://localhost/user", {withCredentials: true}).then((result) => {
            alert("현재 유저이름은 " + result.data.name);
        }).catch((e) => {
            alert(e.response.data.message)
        })
    }

    return (
        <div>
            <NavigationHeader/>
            <h1>chatRoom 목록</h1>
            <div style={{border:"1px solid blue"}}>
                {
                    chatRoomList.length != 0 ?
                    chatRoomList.map((chatroom:ChatRoomType) => {
                        return <div key={chatroom.id} onClick={() => checkRoom(chatroom)}>
                            <span>room name : {chatroom.roomName}</span>
                            <span>count : {chatroom.userCnt}/{chatroom.limitUserCnt}</span>
                        </div>;}) : "방이 없습니다"
                }
            </div>
            <button onClick={showModal}>계시글 등록</button>
            <button onClick={onClickTest}>Error Response test</button>
            <button onClick={onClickUser}>user정보 확인</button>
            <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <input id = {"titleInput"} placeholder={"방이름"} value={title} onChange={changeTitle}/><button onClick={onClickDupBtn}>중복 체크</button><br/>
                <input type="checkbox" onChange={checkBox}/>비밀번호 여부<br/>
                <input id = {"passwordInput"} placeholder={"비밀번호"} disabled={check} value={password} onChange={changePW}/><br/>
                <div>인원수(2~10)</div>
                <input id = {"limitCnt"} defaultValue={2} type="number" />
            </Modal>
        </div>

    )
}
