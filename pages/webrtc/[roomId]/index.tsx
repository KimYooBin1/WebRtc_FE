import {useRouter} from "next/router";
import {useEffect} from "react";
import {history} from "../../../src/commponent/history";

export default function WebrtcRoom () {
    // @ts-ignore
    let socket = null;

    //webRtc variables
    let localStream: MediaStream;
    let remoteVideo: any = null;
    let localVideo: any = null;
    let myPeerConnection: RTCPeerConnection;

    const router = useRouter();

    useEffect(() => {
        if(!router.isReady) return;
        socket = new WebSocket('https://localhost/webrtc');
        localVideo = document.getElementById("user-video");
        remoteVideo = document.getElementById("peer-video");
        start();
    }, [router.isReady]);

    useEffect(() => {
        const listenBackEvent = () => {
            // 뒤로가기 할 때 수행할 동작을 적는다
            alert("채팅방이 종료 됩니다")
            // TODO : listener들이 종료되기 전에 page move가 발생해 error가 발생할 수 있음, element 를 전역으로 생성해서 해결?
            stop();
        };
        return history.listen(({action}) => {
            if (action === "POP") {
                listenBackEvent();
            }
        });
    },[]);
    //공공 ip를 얻어오기 위한 stun server 설정(google에서 제공)
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


    // use JSON format to send WebSocket message
    const sendToServer = (msg:any) => {
        let msgJSON = JSON.stringify(msg);
        socket.send(msgJSON);
    }
    // 상대가 join 요철을 했을떄 실행
    const handlePeerConnection = (message: any) => {
        createPeerConnection();
        getMedia(mediaConstraints);
        if(message.data === "true"){
            // myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
        }
    }

    const createPeerConnection = () => {
        myPeerConnection = new RTCPeerConnection(peerConnectionConfig);
        // 각각이 이벤트 listener
        // 현재 내 peer 에서 ice candidate 가 생성되면 서버로 전송
        myPeerConnection.onicecandidate = handleICECandidateEvent;
        // 상대방의 stream 이 생성되면 이벤트 발생, 상대방의 stream을 listen
        myPeerConnection.ontrack = handleTrackEvent;
    }

    //ICE candidate 생성후 server로 전달
    const handleICECandidateEvent = (event:any) => {
        console.log("ice candidate event: ", event.candidate);
        if(event.candidate){
            sendToServer({
                from: window.localStorage.getItem("name"),
                type: "ice",
                data: event.candidate
            });
        }
    }
    const handleTrackEvent = (event:any) => {
        console.log("track event: ", event);
        remoteVideo.srcObject = event.streams[0];
    };
    const getMedia = (mediaConstraints: { audio: boolean; video: boolean }) => {
        // stop the existing stream
        if(localStream){
            localStream.getTracks().forEach((track) => {
                track.stop();
            });
        }
        navigator.mediaDevices.getUserMedia(mediaConstraints).then(getLocalMediaStream).catch(handleGetUserMediaError);
    }
    const getLocalMediaStream = (mediaStream:MediaStream) => {
        localStream = mediaStream;
        localVideo.srcObject = mediaStream;
        console.log("mediaStream = ",mediaStream)
        localStream.getTracks().forEach((track) => {
            // track은 audio, video track으로 나뉜다.
            console.log("track = ",track)
            // addTrack을 통해 각각의 track을 peer connection에 추가
            myPeerConnection.addTrack(track, localStream);
        });
    }
    const handleGetUserMediaError = (e) => {
        switch (e.name) {
            case "NotFoundError":
                alert("Unable to open your call because no camera and/or microphone" +
                    "were found.");
                break;
            case "SecurityError":
            case "PermissionDeniedError":
                // Do nothing; this is the same as the user canceling the call.
                break;
            default:
                alert("Error opening your camera and/or microphone: " + e.message);
                break;
        }
        stop();
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
                    console.log('Client is starting to ' + (message.data === "true)" ? 'negotiate' : 'wait for a peer'));
                    handlePeerConnection(message);
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
        socket.onerror = (err:any) => {
            console.log("socket error: " + err);
        }
    }

    function stop() {
        // send a message to the server to remove this client from the room clients list
        console.log("Send 'leave' message to server");
        sendToServer({
            from: window.localStorage.getItem("name"),
            type: 'leave',
            data: router.query.roomId
        });
        // event listener를 제거
        if (myPeerConnection) {
            console.log('Close the RTCPeerConnection');

            // disconnect all our event listeners
            myPeerConnection.onicecandidate = null;
            myPeerConnection.ontrack = null;
            myPeerConnection.onnegotiationneeded = null;
            myPeerConnection.oniceconnectionstatechange = null;
            myPeerConnection.onsignalingstatechange = null;
            myPeerConnection.onicegatheringstatechange = null;
            // TODO : 이제 사용되지 않아서 없나?
            myPeerConnection.onnotificationneeded = null;
            myPeerConnection.onremovetrack = null;

            // Stop the videos
            if (remoteVideo.srcObject) {
                remoteVideo.srcObject.getTracks().forEach(track => track.stop());
                remoteVideo.srcObject = null;
            }
            if (localVideo.srcObject) {
                localVideo.srcObject.getTracks().forEach(track => track.stop());
                localVideo.srcObject = null;
            }

            // close the peer connection
            myPeerConnection.close();
            myPeerConnection = null;

            console.log('Close the socket');
            if (socket != null) {
                socket.close();
            }
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

    const videoOn = () => {
        // TODO : 왜 videoOff 를 하고 On을 하면 작동을 안하는지
        console.log("localStream = ",localStream.getVideoTracks())
        localStream.getVideoTracks().forEach((track) => {
            localStream.addTrack(track);
        });
        console.log("video on")
    }
    const videoOff = () => {
        console.log("localStream = ",localStream)
        localStream.getVideoTracks().forEach((track) => {
            localStream.removeTrack(track);
        });
        console.log("video off")
    }

    const onClickLeave = () => {
        alert("나가기")
        stop();
        router.push("/webrtc");
    }

    return (
        <>
            <div>현재 방 : {router.query.roomId}</div>
            <div>
                <video id={"user-video"} autoPlay={true}></video>
                <button onClick={videoOn}>video on</button>
                <button onClick={videoOff}>video off</button>
                <video id={"peer-video"} autoPlay={true}></video>
            </div>
            <button onClick={onClickLeave}>나기기</button>
        </>
    )
}
