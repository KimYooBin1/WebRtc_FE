import {useRouter} from "next/router";
import SockJS from "sockjs-client";
import {Stomp} from "@stomp/stompjs";
import {MouseEventHandler, useEffect, useRef} from "react";

export default function chatRoom():JSX.Element{

    const router = useRouter();
    // @ts-ignore
    const roomId = parseInt(router.query.chatRoomId, 10);

    var stompClient: any = null;
    function connect(){
        // @ts-ignore
        document.getElementById('joinArea').style.visibility = "hidden";

        var socket = new SockJS('http://localhost:8080/websocket');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, onConnected);
    }

    function onConnected(){
        stompClient.subscribe('/topic/chatroom/' + roomId, onMessageReceived);

        var json = JSON.stringify({
                sender: "sender",
                type: "ENTER"
            }
        );
        console.log(json);
        // stompClient.send('/app/chatroom/' + roomId + '/join',
        //     {},
        //     json
        // );
        stompClient.publish({
            destination: `/app/chatroom/${roomId}/join`,
            body: JSON.stringify({
                roomId: roomId,
                sender: "sender",
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
            // TODO : sender 제대로 표기하기
            body: JSON.stringify({
                roomId: roomId,
                sender: "sender",
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
            <div id = "messageArea"></div>
            <div>
                <input id={"inputText"}/><button onClick={sendMessage}>전송</button>
            </div>
        </>
    )
}
