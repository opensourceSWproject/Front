import React, { useEffect, useRef } from 'react';
import { useState, useLocation} from 'react';
import './Header.css'
import { useNavigate, useParams } from 'react-router-dom';
import Modal from '../../Tools/Modal';
import api from '../../apis/api';

function Header(props){
  const navigate=useNavigate();
  const uid=window.sessionStorage.getItem('user')
  const [modalOpen, setModalOpen]=useState(false)
  const [init,setInit]=useState(false)
  const [menuOpen, setMenuOpen]=useState(true)
  const [chatroomlist, setChatroomlist]=useState([]);
  const [roomIdlist, setRoomIdlist]=useState([])
  //console.log(uid)

  const openModal=()=>{
    setModalOpen(true)
  }
  const closeModal=()=>{
    setModalOpen(false)
  }

  const clickMenu=()=>{
    setMenuOpen(!menuOpen)
    props.sidebarAction();
  }

  const Postlogout=async()=>{
    try{
      const res = await api.post('/user/logout');
      return res;
    }
    catch(error){
      console.log(error)
    }  
  }

  const handlelogout=async()=>{
    const res= await Postlogout();
    console.log(res)
    if(res.data === "로그아웃" || res.data===""){
      alert("로그아웃")
      window.sessionStorage.removeItem('user')
      navigate('/');
    }
    else{
      alert(res.data);
    }
  }

  //참여하고 있는 채팅방 표시
  const Getlist=async()=>{
    try{
      console.log(uid);
      const res= await api.get('/chatroom?userId='+uid);
      let namelist=[]
      let idlist=[]
      for(var i=0; i< res.data.length;++i){
        namelist.push(res.data[i].roomName);
        idlist.push(res.data[i].roomId);
      }
      setChatroomlist(namelist);
      setRoomIdlist(idlist);
    }
    catch(error){
      console.log(error);
    }
  }

  useEffect(()=>{
    Getlist();
  },[init]);

  const initChatholder=()=>{
    //wait(3000)
    Getlist();
    setInit(!init)
  }
  //

  const gotofeedback=()=>{
    navigate(`/App/feedback`);
  }

  return(
    <div>
      <div className='Header'>
        <button className='menu_btn' onClick={clickMenu}>☰</button>
        <button className='header_btn'>Chatclips</button>
        <div></div>
        <button className='header_btn' onClick={handlelogout}>Logout</button>
      </div>
      <div className={menuOpen ? 'menu_unfold' : 'menu_fold'}>
        <React.Fragment>
          <button className='btn' onClick={openModal}>{menuOpen ? '✉ new chat' : '✉'}</button>
          <Modal uid={uid} open={modalOpen} close={closeModal} enter={initChatholder} header="new chat">
          </Modal>
        </React.Fragment>
        <button className='btn' onClick={gotofeedback}>{menuOpen ? '✔ feedback' : '✔'}</button>
        <div className='chatholder'>
          <Chatroomlist open={modalOpen} list={chatroomlist} clickevent={props.getinfo} idlist={roomIdlist}/>
        </div>
      </div>
    </div>
  );

}

function Chatroomlist(props){
  const navigate=useNavigate();
  const [title, setTitle]=useState(null)
  const [key, setKey]=useState(null)
  
  useEffect(()=>{
    if(title!==null && props.idlist!==null){
      props.clickevent(title, props.idlist[key])
      navigate(`/App/chat/${props.idlist[key]}`)
    }
    //console.log(title,props.idlist[key])
    },[title,key])

  return(
    props.list.map((name,i)=>{
      return(
        <div className='gotochatroom' style={{listStyleType:'none'}} onClick={()=>{setTitle(name);setKey(i)}} key={i}>
          {name}
        </div>
      );
    })
  );
}

export default Header;