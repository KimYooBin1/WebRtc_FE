import {useRouter} from "next/router";
import {ChatRoomType} from "../../pages/mainPage/mainPage.type";
import SockJS from "sockjs-client";
import {CompatClient, Stomp} from "@stomp/stompjs";
import {useEffect} from "react";

export const useStompConnect = () =>{
    useEffect(() => {
        console.log("hook = {}", stompClient);
    }, []);
    const router = useRouter();
    var stompClient: CompatClient | null = null;

    const onMessageReceived = (payload: any) => {
        var chat = JSON.parse(payload.body);
        var messageElement = document.createElement("li");
        if (chat.type == "ENTER") {
            messageElement.innerText = "enter";
        } else if (chat.type == "TALK") {
            messageElement.innerText = chat.sender;
        } else if (chat.type == "LEAVE") {
            messageElement.innerText = "leave"
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
    function onConnected() {
        const roomId = router.query.chatRoomId;
        stompClient.subscribe('/topic/chatroom/' + roomId, onMessageReceived,{
            Authorization: "Bearer " +window.localStorage.getItem("access_token")});
        stompClient.publish({
            destination: `/app/chatroom/${roomId}/join`,
            body: JSON.stringify({
                roomId: roomId,
                sender: window.localStorage.getItem("name"),
                type: "ENTER"
            }),
            headers:{
                Authorization: "Bearer " +window.localStorage.getItem("access_token")
            }
        })
    }

    const connect = () => {
        const socket = new SockJS('http://localhost:8080/websocket');
        stompClient = Stomp.over(socket);
        stompClient.connect({
            Authorization: "Bearer " + window.localStorage.getItem("access_token")
        }, () => {
            console.log("main SC = {}", stompClient);
            // router.push({pathname: `/chatRoom/${chatroom.id}`, query: {stompClient: JSON.stringify(stompClient)}});
            //     window.localStorage.setItem("socket", JSON.stringify(socket));
            //     router.push({pathname:`/chatRoom/${chatroom.id}`,query: JSON.stringify(socket)
            // });
            // navigator(`/chatRoom/${chatroom.id}`, {state:{stompClient: stompClient}})

            onConnected();
        })

    };

    function sendMessage(roomId:string){
        const inputElement = (document.getElementById("inputText") as HTMLInputElement);
        const message = inputElement.value
        console.log("chatroom SC = {}",stompClient)
        stompClient.publish({
            destination: `/app/chatroom/${roomId}/send`,
            body: JSON.stringify({
                roomId: roomId,
                sender: window.localStorage.getItem("name"),
                type: "TALK",
                message
            }), headers: {
                Authorization: "Bearer " + window.localStorage.getItem("access_token"),
            },
        })
        inputElement.value = "";
    }
    const checkRoom = (chatroom: ChatRoomType) => {
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

    return {connect, sendMessage, checkRoom}
}
