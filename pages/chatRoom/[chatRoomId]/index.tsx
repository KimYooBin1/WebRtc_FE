import {useRouter} from "next/router";
import SockJS from "sockjs-client";
import {Stomp} from "@stomp/stompjs";
import axios from "axios";

export default function chatRoom():JSX.Element{

    const router = useRouter();
    // @ts-ignore
    const roomId = parseInt(router.query.chatRoomId, 10);

    var stompClient: any = null;
    function connect(){
        // @ts-ignore
        document.getElementById('joinArea').style.visibility = "hidden";

        var socket = new SockJS('http://localhost:8080/websocket');
        var userListElement = document.getElementById("chatRoomUsers");
        stompClient = Stomp.over(socket);
        stompClient.connect({}, () => {
            onConnected()
            axios.get('http://localhost:8080/chatroom/' + roomId + "/users", {headers:{
                    Authorization: "Bearer " +window.localStorage.getItem("access_token"),
                }})
                .then((result) => {
                        console.log("getUsers start")
                        const userList = result.data;
                        userList.forEach((user: any) => {
                            console.log(user);
                            userListElement?.append(document.createElement('l1').innerText = user.name)
                        })
                        // console.log("result = " + result.data);
                    }
                )
                .catch(
                    // TODO : 인원이 없을떄?
                );
        });
    }

    function onConnected() {
        stompClient.subscribe('/topic/chatroom/' + roomId, onMessageReceived);
        stompClient.publish({
            destination: `/app/chatroom/${roomId}/join`,
            body: JSON.stringify({
                roomId: roomId,
                sender: window.localStorage.getItem("name"),
                type: "ENTER"
            }),
        })
    }

    function onMessageReceived(payload:any){
        var chat = JSON.parse(payload.body);
        var messageElement = document.createElement("li");
        if(chat.type == "ENTER"){
            messageElement.innerText = "enter";
        }
        else if(chat.type == "TALK"){
            messageElement.innerText = chat.sender;
        }
        var textElement = document.createElement('p');
        var messageText = document.createTextNode(chat.message);
        textElement.appendChild(messageText);

        messageElement.appendChild(textElement);

        console.log("Area", document.getElementById('messageArea'));
        document.getElementById('messageArea')?.appendChild(messageElement);
        // @ts-ignore 채팅방의 스크롤을 최하단으로 배치
        messageArea?.current?.scrollTop = messageArea?.current?.scrollHeight;
    }

    function sendMessage(){
        const inputElement = (document.getElementById("inputText") as HTMLInputElement);
        const message = inputElement.value
        stompClient.publish({
            destination: `/app/chatroom/${roomId}/send`,
            body: JSON.stringify({
                roomId: roomId,
                sender: window.localStorage.getItem("name"),
                type: "TALK",
                message
            }),
        })
        inputElement.value = "";
    }

    return(
        <>
            <div>현재 방 : {roomId}</div>
            <button onClick={connect} id={"joinArea"}>방 참가</button>
            {/*유저 목록 칸은 red background color 로 구분*/}
            <div style={{border: '1px solid red'}}>
                <h1>현재 유저</h1>
                <p id = {'chatRoomUsers'}></p>
            </div>
            <div id = "messageArea" style={{border: '1px solid gray'}}></div>
            <div>
                <input id={"inputText"}/><button onClick={sendMessage}>전송</button>
            </div>
        </>
    )
}
