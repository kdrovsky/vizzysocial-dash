import { useState, useEffect } from 'react';
import { supabase } from "../supabaseClient";
import Modal from 'react-modal';
import { IoClose } from 'react-icons/io5';
import "../../src/modalsettings.css"
import { getAccount, searchAccount, uploadImageFromURL } from '../helpers';
import { Spinner } from 'react-bootstrap';
import { TiTimes } from 'react-icons/ti';
import { useRef } from 'react';
import { useClickOutside } from 'react-click-outside-hook';
import { FaUser } from 'react-icons/fa';

Modal.setAppElement('#root');

const ModalAdd = ({ from, modalIsOpen, setIsOpen, title, subtitle, extraSubtitle, user, userId, setAddSuccess, addSuccess }) => {
  const [parentRef, isClickedOutside] = useClickOutside();
  const [showResultModal, setShowResultModal] = useState(false)
  const [selected, setSelected] = useState()
  const [searchedAccounts, setSearchedAccounts] = useState([])
  const [input, setInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState(input)

  const [loadingSpinner, setLoadingSpinner] = useState(false)
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef()

  useEffect(() => {
    if (isClickedOutside) {
      setShowResultModal(false)
    };
  }, [isClickedOutside]);

  useEffect(() => {
    var i = debouncedQuery;
    if (debouncedQuery.startsWith('@')) {
      i = debouncedQuery.substring(1)
    }
    const timer = setTimeout(() => setInput(i), 1000);
    return () => clearTimeout(timer)
  }, [debouncedQuery]);

  useEffect(() => {
    const fetch = async () => {
      setLoadingSpinner(true)
      const data = await searchAccount(input);
      const users = data?.users;
      if (users?.length > 0) {
        const filtered = users?.filter(user => {
          var x = (user?.username)?.toLowerCase()
          var y = input?.toLowerCase()
          return x?.startsWith(y)
        })
        // console.log(filtered);
        setSearchedAccounts(filtered)
        setShowResultModal(true)
      }
      setLoadingSpinner(false)
    }
    setSearchedAccounts([])
    fetch()
  }, [input])

  const add = async () => {
    if (!user) return alert("user not found");
    
    var filteredSelected = selected;
    if (filteredSelected.startsWith('@')) {
      filteredSelected = filteredSelected.substring(1)
    }
    if (filteredSelected) {
      setProcessing(true);
      setLoadingSpinner(true)
      const theAccount = await getAccount(filteredSelected);
      // console.log(theAccount);
      var profile_pic_url = '';
      const uploadImageFromURLRes = await uploadImageFromURL(filteredSelected, theAccount?.data?.[0]?.profile_pic_url)
      if (uploadImageFromURLRes?.status === 'success') {
        profile_pic_url = uploadImageFromURLRes?.data
      }
      
      const data = {
        account: filteredSelected,
        followers: theAccount.data[0].follower_count,
        avatar: profile_pic_url,
        user_id: userId,
        main_user_username: user.username
      }
      
      if (user?.first_account) {
        delete data.main_user_username
      }

      const res = await supabase.from(from).insert(data);
      res?.error && console.log(
        "🚀 ~ file: Whitelist.jsx:33 ~ const{error}=awaitsupabase.from ~ error",
        res.error
      );

      setSelected("");
      setDebouncedQuery('')
      setProcessing(false);
      setLoadingSpinner(false)
      setAddSuccess(!addSuccess);
      setIsOpen(!modalIsOpen);
    }
  };


  return (
    <Modal
      isOpen={modalIsOpen}
      className="modal_add_content"
      overlayClassName="modal_add_overlay"
      contentLabel="Modal"
    >
      <div className="modal_form_wrapper relative">
        <div className="flex justify-end">
          <IoClose
            className="text-[30px] text-[#8c8c8c]"
            onClick={() => {
              setIsOpen(!modalIsOpen);
            }}
          />
        </div>
        <div className="grid grid-cols-1 justify-center items-center">
          <h1 className='font-bold text-black text-[36px] md:text-[40px] text-center pb-3 font-MADEOKINESANSPERSONALUSE'>{title}</h1>
          <p className='font-bold font-MontserratSemiBold text-[#333] text-sm text-center lg:px-[100px]'>{subtitle}</p>
          <div className="flex items-center justify-center w-full mt-4">

            <div className="flex flex-col items-center w-[320px] relative" ref={parentRef}>
              <div className="flex items-center border rounded-md shadow-md w-[90%] mx-auto md:w-full py-3 px-4">
                <input
                  type="text"
                  className="w-full outline-none"
                  placeholder="@username"
                  value={debouncedQuery}
                  ref={inputRef}
                  onChange={(e) => {
                    setDebouncedQuery(e.target.value);
                  }}
                  onFocus={() => {
                    setShowResultModal(true)
                  }}
                />
                <div className="relative flex items-center justify-center">
                  <span className="absolute z-10">{loadingSpinner && (<Spinner animation="border" />)}</span>
                  {input && <TiTimes className='cursor-pointer' onClick={() => { setDebouncedQuery('') }} />}
                </div>
              </div>

              {showResultModal && !processing && <div className="absolute top-[60px] z-50 w-full h-[300px] overflow-auto shadow-md border rounded-md bg-white py-3 px-4 flex flex-col gap-4">
                {debouncedQuery && <div className="flex items-center gap-2 border-b pb-2 cursor-pointer"
                  onClick={() => {
                    setSelected(debouncedQuery);
                    // setInput(debouncedQuery)
                    setLoadingSpinner(false)
                    setShowResultModal(false);
                  }}
                >
                  <div className="p-3 rounded-full bg-black">
                    <FaUser size={14} color="white" />
                  </div>
                  <div className="">
                    <div className="">{debouncedQuery}</div>
                    <div className="mt-1 opacity-40 text-[.9rem]">click here to open account profile</div>
                  </div>
                </div>}
                {searchedAccounts.map((data, index) => {
                  return (<>
                    <div
                      key={index}
                      className='accounts w-full flex items-center cursor-pointer hover:bg-[#02a1fd]/20'
                      onClick={() => {
                        setDebouncedQuery(data?.username)
                        setSelected(data?.username);
                        // setInput(data?.username)
                        setLoadingSpinner(false)
                        setShowResultModal(false);
                      }}
                    >
                      <img
                        alt=''
                        src={data.profile_pic_url}
                        style={{
                          height: '40px',
                          marginRight: '10px',
                          width: '40px',
                          borderRadius: '9999px'
                        }}
                      />
                      <div className="flex flex-col" id={data.username}>
                        <p>{data.username}</p>
                        <span className="opacity-40">{data.full_name}</span>
                      </div>
                    </div>
                  </>)
                })}
              </div>}

              <button className={`bg-[#ef5f3c] mt-4 w-64 sm:w-80 py-[15px] rounded-[5px] text-[1.125rem] font-semibold text-white ${processing && 'cursor-wait bg-[#ffa58e]'}`}
                style={{
                  // backgroundColor: '#ef5f3c',
                  color: 'white',
                  boxShadow: '0 20px 30px -12px rgb(255 132 102 / 47%)'
                }}
                onClick={() => { !processing && add() }}
              >{processing ? <span className="animate-pulse">Processing your account…</span> : 'Select Account'}</button>
            </div>


            {/* <button className='bg-black w-32 md:w-40 py-[25px] font-semibold rounded text-white'
              onClick={() => add()}
            >{Processing ? "Processing..." : "Add"}</button> */}
          </div>
          <p className='font-bold font-MontserratRegular text-sm text-center lg:px-[120px] pt-8 pb-5'>{extraSubtitle}</p>
        </div>
      </div>
    </Modal>
  );
}

export default ModalAdd