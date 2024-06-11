import {useRouter} from "next/router";
import {useEffect} from "react";

export default function WebrtcRoom () {
    const router = useRouter();
    //WebRTC stun server
    const peerConnectionConfig = {
        'iceServers': [
            {
                'urls': 'stun:stun.l.google.com:19302'
            },
            {
                'urls': 'stun:stun.stunprotocol.org:3478'
            }
        ]
    }
    // WebRTC media
    const mediaConstraints = {
        audio: true,
        video: true
    };
    // TODO : 지금 chatroom과 endpoint가 같은데, 같아도 되나?

    let socket = null;

    //webRtc variables
    let localStream: MediaStream;
    let localVideoTrack;
    let myPeerConnection: RTCPeerConnection;

    useEffect(() => {
        if(!router.isReady) return;
        socket = new WebSocket('https://localhost/webrtc');
        start();
    }, [router.isReady]);

    // use JSON format to send WebSocket message
    const sendToServer = (msg:any) => {
        let msgJSON = JSON.stringify(msg);
        socket.send(msgJSON);
    }

    // socket listener 설정
    const start = () => {
        // 해당 소켓을 사용해서 message를 받는다.
        socket.onmessage = (msg:any) =>{
            let message = JSON.parse(msg.data);
            switch (message.type) {
                case "text":
                    console.log("text message received: " + message.data);
                    break;
                case "offer":
                    console.log("offer message received: " + message.data);
                    // handleOfferMessage(message);
                    break;
                case "answer":
                    console.log("answer message received: " + message.data);
                    // handleAnswerMessage(message);
                    break;
                case "ice":
                    console.log("ice message received: " + message.data);
                    // handleIceMessage(message);
                    break;
                case "join":
                    console.log("join message received: " + message.data);
                    // handlePeerConnection(message);
                    break;
                default:
                    console.log("unknown message type: " + message.type);
                    // handleErrorMessage(message);
                    break;
            }
        }
        // add an event listener to get to know when a connection is open
        socket.onopen = () => {
            console.log("socket connection opened to Room: " + router.query.roomId);
            sendToServer({
                from: window.localStorage.getItem("name"),
                type: "join",
                data: router.query.roomId
            });
        }
        // a listener for the close event
        socket.onclose = () => {
            console.log("socket connection closed");
        }

        //a listener for the error event
        socket.onerror = (err) => {
            console.log("socket error: " + err);
        }

    }


    // offer 생성
    const createOffer = async () => {
        const peerConnection = new RTCPeerConnection();
        // option
        const option = {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
            iceRestart: true
        }
        const offer = await peerConnection.createOffer(option);

        await peerConnection.setLocalDescription(offer);
        console.log(offer.sdp);
    }


    // 카메라 켜기
    const startCam = async () => {
        const localStreamElement = document.getElementById("user-video");
        if (navigator.mediaDevices !== undefined) {
            //client 의 미디어 디바이스를 사용할 수 있는지 확인
            await navigator.mediaDevices.getUserMedia(mediaConstraints)
                .then(async (stream) => {
                    console.log('Stream found');

                    const localStream = stream;
                    //
                    stream.getAudioTracks()[0].enabled = true;
                    //@ts-ignore
                    localStreamElement.srcObject = stream;

                }).catch((error) => {
                    console.error('Error accessing media devices.', error);
                })
        }
    }
    const videoOn = () => {
        localVideoTrack = localStream.getVideoTracks();
        localVideoTrack.forEach((track) => {
            localStream.addTrack(track);
        });
        console.log("video off")
    }
    const videoOff = () => {
        localVideoTrack = localStream.getVideoTracks();
        localVideoTrack.forEach((track) => {
            localStream.removeTrack(track);
        });
        console.log("video off")
    }
    return (
        <>
            <div>현재 방 : {router.query.roomId}</div>
            <button onClick={startCam}>카메라 켜기</button>
            <div>
                <video id={"user-video"} autoPlay={true}></video>
                <button onClick={videoOn}>video on</button>
                <button onClick={videoOff}>video off</button>
                <video id={"peer-video"} autoPlay={true}></video>
            </div>
        </>
    )
}
