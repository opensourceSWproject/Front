import { useEffect, useState, useRef } from 'react';
import './Modal.css'
import axios from 'axios';
import SockJS from 'sockjs-client';
import * as StompJs from '@stomp/stompjs';
import dayjs from 'dayjs';
import { connectStomp, disconnectStomp } from '../Chat/ws';
import { useLocation } from 'react-router-dom';

function Modal(props){
    const uid=props.uid;
    const {open, close, enter, header }=props
    const [roomname, setRoomname]=useState("")
    const [roomId, setRoomId]=useState(null)
    const [client , setClient]=useState(null);
    
    const handleclickclosebtn=()=>{
        {close()}
        setRoomId("")
        setRoomname("")
    }
    
    //createChatroom
    const PostcreateRoom = async()=>{
        try{
            const res= await axios.post('/chatroom/createRoom?roomName='+roomname);
            //console.log(res);
            return res;
        }
        catch(error){console.log(error)}        
    }

    const handlecreateRoom = async() => {
        const res=await PostcreateRoom();
        if(res.status===200){
            alert("새로운 채팅방의 룸ID: "+res.data);
            setRoomId(res.data);
            setRoomname("")
        }
        else{
            alert('error')
            setRoomname("")
        }
    }
    //
    
    //EnterChatroom
    useEffect(()=>{
        if(open){
            setClient(connectStomp(uid, null));    
        }

        return()=>disconnectStomp(client)
    },[open])

    const userenter=()=>{
        console.log(client);
        const currentTime=dayjs();
        client.publish({
            destination: "/pub/enterUser",
            body: JSON.stringify({
                type: "ENTER",
                roomId: roomId,
                sender: uid,
                message: '입장',
                time : currentTime
            }),
        });
    }
    
    const handlejoinRoom =() => {
        userenter();
        {enter()}
        handleclickclosebtn();
    }
    //

    return(
        <div className={open ? "openModal modal" : "modal"}>
            {open ? (
                <section>
                    <header>
                        <div>{header}</div>
                        <button className="close" onClick={handleclickclosebtn}>
                            &times;
                        </button>
                    </header>
                    <main className='grid'>
                        <form onSubmit={handlecreateRoom}>
                            <input type='text' placeholder='채팅방 이름' value={roomname} required onChange={event => setRoomname(event.currentTarget.value)}></input>
                            <input type='submit' value='채팅방 만들기'></input>
                        </form>
                        <div></div>
                        <form onSubmit={handlejoinRoom}>
                            <input type='text' value={roomId} placeholder='룸 ID 입력' required onChange={event => setRoomId(event.currentTarget.value)}></input>
                            <input type='submit' value='채팅방 참여하기'></input>
                        </form>
                        </main>
                    <footer>
                        <button className="close" onClick={handleclickclosebtn}>
                            close
                        </button>
                    </footer>
                </section>
            ) : null }
        </div>
    );
}

export default Modal;