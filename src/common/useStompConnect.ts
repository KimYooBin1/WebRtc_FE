import {useRouter} from "next/router";
import {ChatRoomType} from "../../pages/mainPage/mainPage.type";
import SockJS from "sockjs-client";
import {CompatClient, Stomp} from "@stomp/stompjs";
import axios from "axios";

export const useStompConnect = () =>{
    const router = useRouter();
    var stompClient: CompatClient | null = null;

    const errorMessageReceived = (payload: any) => {
        var chat = JSON.parse(payload.body);
        alert(chat.message);
        router.push("/mainPage");
        stompClient?.disconnect();
    }
    const onMessageReceived = (payload: any) => {
        var chat = JSON.parse(payload.body);
        var messageElement = document.createElement("li");
        var userListElement = document.getElementById("chatRoomUsers");
        if (chat.type == "ENTER" || chat.type == "LEAVE") {
            messageElement.innerText = chat.type == "ENTER"?"enter":"leave";
            axios.get('http://localhost:8080/chatroom/' + router.query.chatRoomId + "/users", {withCredentials: true})
                .then((result) => {
                        while(userListElement?.firstChild){
                            userListElement.removeChild(userListElement.firstChild);
                        }
                        const userList = result.data;
                        userList.forEach((user: any) => {
                            userListElement?.append(document.createElement('l1').innerText = user.name)
                        })
                    }
                );
        } else if (chat.type == "TALK") {
            messageElement.innerText = chat.sender;
        }
        var textElement = document.createElement('p');
        var messageText = document.createTextNode(chat.message);
        textElement.appendChild(messageText);

        messageElement.appendChild(textElement);

        setTimeout(() =>{
            console.log("Area", document.getElementById('messageArea'));
            document.getElementById('messageArea')?.appendChild(messageElement);
        }, 100);

    };
    const onConnected = () => {
        const roomId = router.query.chatRoomId;
        stompClient?.subscribe('/topic/chatroom/' + roomId, onMessageReceived);
        // TODO : MessageReceived 분리
        stompClient?.subscribe('/user/topic/error', errorMessageReceived);
        stompClient?.publish({
            destination: `/app/chatroom/${roomId}/join`,
            body: JSON.stringify({
                roomId: roomId,
                sender: window.localStorage.getItem("name"),
                type: "ENTER",
            })
        })
    }

    const connect = () => {
        const socket = new SockJS('http://localhost:8080/websocket');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, () => {
            onConnected();
        });
    };

    function sendMessage(roomId:string){
        const inputElement = (document.getElementById("inputText") as HTMLInputElement);
        const message = inputElement.value
        console.log("chatroom SC = {}",stompClient)
        stompClient?.publish({
            destination: `/app/chatroom/${roomId}/send`,
            body: JSON.stringify({
                roomId: roomId,
                sender: window.localStorage.getItem("name"),
                type: "TALK",
                message
            }, ),
        })
        inputElement.value = "";
    }
    const checkRoom = (chatroom: ChatRoomType) => {
        if(!checkLogin()) return ;
        if(chatroom.limitUserCnt <= chatroom.userCnt){
            alert("인원이 가득 찼습니다");
            return ;
        }
        if(chatroom.password != null){
            const result = prompt("비밀번호가 설정되어 있습니다","비밀번호를 입력해주세요");
            if(result != chatroom.password) {
                alert("비밀번호가 틀립니다!")
                return;
            }
        }
        router.push(`/chatRoom/${chatroom.id}`);
    }

    const disconnect = () => {
        if (stompClient !== null) {
            stompClient.disconnect();
        }
    }

    const checkLogin = (): Boolean =>{
        if(window.localStorage.getItem("name") == null){
            alert("로그인을 먼저 해주세요")
            return false;
        }
        return true;
    }

    return {connect, disconnect, sendMessage, checkRoom, checkLogin}
}
