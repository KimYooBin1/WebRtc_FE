import {useRouter} from "next/router";

export default function WebrtcRoom () {
    const router = useRouter();
    const roomId = router.query.roomId;
    return (
        <>
            <div>현재 방 : {roomId}</div>
        </>
    )
}
