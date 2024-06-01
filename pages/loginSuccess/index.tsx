import {useEffect} from "react";
import {useRouter} from "next/router";
import axios from "axios";

export default function LoginSuccess():JSX.Element {
    const router = useRouter();
    useEffect(()=>{
        axios.get("http://localhost:8080/user", {withCredentials : true}).then((result) => {
            console.log(result.data)
            alert(result.data.name + "님 환영합니다.")
            window.localStorage.setItem("name", result.data.name);
        }).catch((e) => {
            console.log(e)
        })
        router.push("/mainPage");
    }, []);
    return (
        <div>
        </div>
    )
}
