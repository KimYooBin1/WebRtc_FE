import {useRouter} from "next/router";

export default function chatRoom():JSX.Element{
    const router = useRouter();
    return(
        <div>현재 방 : {router.query.chatRoomId}</div>
    )
}
