import {useRouter} from "next/router";
import {useEffect} from "react";
import {history} from "../../../src/commponent/history"
import {useStompConnect} from "../../../src/common/useStompConnect";
import {useErrorHook} from "../../../src/common/useErrorHook";

export default function chatRoom():JSX.Element{
    useEffect(() => {
        if(!checkLogin() || !checkConnect(roomId)){
            router.push("/mainPage");
            return;
        }
        connect();
        console.log("room join");
        const listenBackEvent = () => {
            // 뒤로가기 할 때 수행할 동작을 적는다
            alert("채팅방이 종료 됩니다")
            disconnect();
        };
        return history.listen(({action}) => {
            if (action === "POP") {
                listenBackEvent();
            }
        });
    }, []);

    const router = useRouter();
    const roomId = router.query.chatRoomId;
    const {sendMessage, connect, disconnect, checkLogin} = useStompConnect();
    const {checkConnect} = useErrorHook();



    return(
        <>
            <div>현재 방 : {roomId}</div>
            {/*유저 목록 칸은 red background color 로 구분*/}
            <div style={{border: '1px solid red'}}>
                <h1>현재 유저</h1>
                <p id = {'chatRoomUsers'}></p>
            </div>
            <div id = "messageArea" style={{border: '1px solid gray'}}></div>
            <div>
                <input id={"inputText"}/><button onClick={()=>sendMessage(roomId)}>전송</button>
            </div>
        </>
    )
}
