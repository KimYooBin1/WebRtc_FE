import {useRouter} from "next/router";
import SockJS from "sockjs-client";
import {Stomp} from "@stomp/stompjs";
import {MouseEventHandler, useEffect} from "react";

export default function chatRoom():JSX.Element{
    // useEffect(() => {
    //     connect();
    // }, [])
    const router = useRouter();
    // @ts-ignore
    const roomId = parseInt(router.query.chatRoomId, 10);

    var stompClient: any = null;
    function connect(){
        var socket = new SockJS('http://localhost:8080/websocket');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, onConnected);
    }

    function onConnected(){
        stompClient.subscribe('/topic/chatroom/' + roomId,  () => {
            console.log('sub');
        });

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

    return(
        <>
            <div>현재 방 : {roomId}</div>
            <button onClick={connect}>방 참가</button>
        </>
    )
}
