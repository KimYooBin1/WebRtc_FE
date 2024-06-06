import {useRouter} from "next/router";

export const useErrorHook = () =>{
    const router = useRouter();
    const checkConnect = (roomId:number) => {
        console.log("roomId = ",roomId)
        if(roomId == undefined){
            alert("비정상적인 접근이 감지되었습니다");
            router.push("/mainPage");
            return false;
        }
        return true;
    }
    return {checkConnect}
}
