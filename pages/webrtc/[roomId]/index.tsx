import {useRouter} from "next/router";
import {useEffect} from "react";
import {history} from "../../../src/commponent/history";
import {message} from "antd";

export default function WebrtcRoom () {
    // @ts-ignore, socket을 전역으로 사용하기 위해
    // TODO : next에서 해당 방식으로 전역변수를 다루는게 맞는가
    let socket: any = null;

    //webRtc variables
    let localStream: MediaStream;
    //상대 영상이 나올 element 설정
    let remoteVideo: any = null;
    //내 영상이 나올 element 설정
    let localVideo: any = null;

    //각 peer들의 WebRTC connection 연결 종점
    let myPeerConnection: RTCPeerConnection;
    // media track store : video on/off
    // TODO : 하지만 실제로 stream 전송되는것을 막고 싶다.
    let localVideoTracks: any = null;

    const router = useRouter();

    useEffect(() => {
        // start 단계에서 router.query.roomId 가 필요하기 때문에 if 조건을 통해 해결
        if(!router.isReady) return;
        socket = new WebSocket('https://localhost/webrtc');
        localVideo = document.getElementById("user-video");
        remoteVideo = document.getElementById("peer-video");
        start();
    }, [router.isReady]);

    //뒤로가기 event 인식
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

    // JSON format으로 server로 전송
    const sendToServer = (msg:any) => {
        let msgJSON = JSON.stringify(msg);
        socket.send(msgJSON);
    }
    // 상대가 join 요철을 했을떄 실행
    const handlePeerConnection = (message: any) => {
        createPeerConnection();
        getMedia(mediaConstraints);
        if(message.data === "true"){
            //local description 은 만들고 remote peer에게 전달하기 위한 event handler
            // remote peer에게 연결할건지 물어보는 이벤트
            myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
        }
    }

    //기존에 한 peer가 room에 있고 다른 peer가 join 요청을 했을때 실행
    const handleNegotiationNeededEvent = () => {
        //offer 생성수 localDescription에 저장
        myPeerConnection.createOffer().then((offer) => {
            return myPeerConnection.setLocalDescription(offer);
        }).then(() => {
            //서버에 offer 전달
            sendToServer({
                from: window.localStorage.getItem("name"),
                type: "offer",
                sdp: myPeerConnection.localDescription
            });
        }).catch((e) => {
            //TODO : error handling을 해야되는데 어떻게 해야할지 모르겠다.
            console.log("error", e);
        });
    }

    const createPeerConnection = () => {
        myPeerConnection = new RTCPeerConnection(peerConnectionConfig);
        // 각각이 이벤트 listener
        // 현재 내 peer 에서 ice candidate 가 생성되면 서버로 전송
        myPeerConnection.onicecandidate = handleICECandidateEvent;
        // 상대방의 stream 이 생성되면 이벤트 발생, 상대방의 stream을 listen
        // myPeerConnection에 remote stream의 track 이 추가됨
        myPeerConnection.ontrack = handleTrackEvent;
    }

    //ICE candidate 생성후 server로 전달
    const handleICECandidateEvent = (event:any) => {
        console.log("ice candidate event: ", event.candidate);
        if(event.candidate){
            sendToServer({
                from: window.localStorage.getItem("name"),
                type: "ice",
                candidate: event.candidate
            });
        }
    }
    const handleTrackEvent = (event:any) => {
        console.log("track event: ", event);
        console.log("remoteVideo = ",remoteVideo)
        remoteVideo.srcObject = event.streams[0];
    };
    const getMedia = (mediaConstraints: { audio: boolean; video: boolean }) => {
        // stop the existing stream
        if(localStream){
            localStream.getTracks().forEach((track) => {
                track.stop();
            });
        }
        //기기의 미디어를 가져온다
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

    const handleOfferMessage = (message:any) => {
        console.log("Accepting offer");
        console.log("message", message);
        //caller 의 session description을 나타내는 RTCSessionDescription 객체를 생성
        let desc = new RTCSessionDescription(message.sdp);
        if(desc != null && message.sdp != null){
            console.log("RTC Signalling state: ", myPeerConnection.signalingState);
            // setRemoteDescription을 통해 상대방의 offer를 받아들인 후 local stream을 생성
            myPeerConnection.setRemoteDescription(desc).then(() =>{
                console.log("Set up local media stream");
                return navigator.mediaDevices.getUserMedia(mediaConstraints);
            })
                // 각각의 track을 <video>에 mapping 하고 peer connection에 추가
                .then((stream) => {
                    console.log("-- Local video stream obtained");
                    localStream = stream;
                    try{
                        localVideo.srcObject = localStream;
                    }catch (error){
                        localVideo.src = window.URL.createObjectURL(stream);
                    }
                    console.log("-- Adding stream to the RTCPeerConnection");
                    localStream.getTracks().forEach((track) => {
                        myPeerConnection.addTrack(track, localStream);
                    });
                }).then(() =>{
                    //answer 생성
                    console.log("-- Creating answer");
                    return myPeerConnection.createAnswer()
                //setLocalDescription을 통해 local description을 저장
            }).then((answer) => {
                console.log("-- Setting local description after creating answer");
                return myPeerConnection.setLocalDescription(answer);
            }).then(() => {
                // answer를 caller에게 전송
                console.log("-- Sending answer to caller");
                sendToServer({
                    from: window.localStorage.getItem("name"),
                    type: "answer",
                    sdp: myPeerConnection.localDescription
                });
            })
        }
    }

    const handleNewIceCandidateMessage = (message:any) =>{
        let candidate = new RTCIceCandidate(message.candidate);
        console.log("Adding received ICE candidate: " + JSON.stringify(candidate));
        // local ICE layer에 candidate를 전달
        myPeerConnection.addIceCandidate(candidate).catch((e) => {
            console.log(e);
        });
    }

    const handleAnswerMessage = (message:any) => {
        const sdp = new RTCSessionDescription(message.sdp);
        myPeerConnection.setRemoteDescription(sdp).catch((e) => {
            console.log("error", e);
        })
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
                    handleOfferMessage(message);
                    break;
                case "answer":
                    console.log("answer message received: " + message.data);
                    handleAnswerMessage(message);
                    break;
                case "ice":
                    console.log("ice message received: " + message.data);
                    handleNewIceCandidateMessage(message);
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
            //상태 변화를 알리기 위한 listener 3가지
            // 커넥션 state가 변경되면(예를 들어 상대쪽에서 call을 끊었을때)
            myPeerConnection.oniceconnectionstatechange = null;
            // signaling state가 'closed'로 변경되면
            myPeerConnection.onicegatheringstatechange = null;
            //
            myPeerConnection.onsignalingstatechange = null;
            // TODO : 이제 사용되지 않아서 없나?
            myPeerConnection.onnotificationneeded = null;
            myPeerConnection.onremovetrack = null;

            // Stop the videos
            if (remoteVideo.srcObject) {
                remoteVideo.srcObject.getTracks().forEach(track => track.stop());
                //stream 에 대한 참조 해제
                remoteVideo.srcObject = null;
            }
            if (localVideo.srcObject) {
                localVideo.srcObject.getTracks().forEach(track => track.stop());
                //stream 에 대한 참조 해제
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

    const videoOn = () => {
        // TODO : 왜 videoOff 를 하고 On을 하면 작동을 안하는지
        console.log("localStream = ",localVideoTracks)
        localVideoTracks.forEach((track) => {
            localStream.addTrack(track);
        });
        console.log("video on")
    }
    const videoOff = () => {
        localVideoTracks = localStream.getVideoTracks();
        console.log("localStream = ",localVideoTracks)
        localVideoTracks.forEach((track: any) => {
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
                <video id={"user-video"} autoPlay={true} muted={true}></video>
                <button onClick={videoOn}>video on</button>
                <button onClick={videoOff}>video off</button>
                <video id={"peer-video"} autoPlay={true}></video>
            </div>
            <button onClick={onClickLeave}>나기기</button>
        </>
    )
}
