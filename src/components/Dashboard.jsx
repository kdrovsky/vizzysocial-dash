import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { useClickOutside } from "react-click-outside-hook";
import { AiOutlineClockCircle } from "react-icons/ai";
import { BiMessageSquareDots } from "react-icons/bi";
import { CgDanger } from "react-icons/cg";
import { BsHeadset } from "react-icons/bs";
import { FaAngleDown, FaCaretDown, FaCaretUp, FaTimes, FaTrash, FaUser } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { RiUserSettingsFill } from "react-icons/ri";
import { TiTimes } from "react-icons/ti";
import { Spinner } from 'react-bootstrap';
import { Link, useNavigate, useParams } from "react-router-dom";
import { countDays, deleteAccount, getAccount, numFormatter, searchAccount, sumTotalInteractions, updateUserProfilePicUrl, uploadImageFromURL } from "../helpers";
import { supabase } from "../supabaseClient";
import Nav from "./Nav";
import TargetingFilterModal from './TargetingFilterModal'
import SettingsModal from './SettingsModal'
import GrowthChart from "./GrowthChart";
import ColumnChart from "./ColumnChart";
import AlertModal from "./AlertModal";
import { ANALYST_NAME, LOGO, SITENAME } from "../config";
// import WelcomeModal from "./WelcomeModal";

const Error = ({ value }) => {
  return (
    <aside style={{ color: "red" }} classNameName="px-3 py-4 px-sm-5">
      The account @{value} was not found on Instagram.
    </aside>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  let { username } = useParams();
  const currentUsername = username
  const [userData, setUserData] = useState([]);
  const [error, setError] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(false)
  const [sessionsData, setSessionsData] = useState([])
  const [showDateOptions, setShowDateOptions] = useState(false)
  const [selectedDate, setSelectedDate] = useState({ title: "Last 7 days", value: 7 })
  const [showMobileManager, setShowMobileManager] = useState(false)
  const [mobileAdd, setMobileAdd] = useState({ show: false, pageProp: {} })
  const [chart, setChart] = useState(1)
  const [processing, setProcessing] = useState(false)
  const [refreshUser, setRefreshUser] = useState(true)
  const [totalInteractions, setTotalInteractions] = useState(0)
  const [, setShowWelcomeModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState({ title: 'Alert', message: 'something went wrong' })
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [admin, setAdmin] = useState(false)

  !!!sessionsData && console.log(sessionsData)

  useEffect(() => {
    const getData = async () => {
      if (!currentUsername) {
        setIsModalOpen(true);
        setErrorMsg({ title: 'Alert', message: 'username not set!' });
        return;
      }

      const authUserRes = await supabase.auth.getUser()
      if (authUserRes.error) return navigate("/login")
      const authUser = authUserRes?.data?.user

      // admin mode
      const getSuperUser = await supabase.from('users').select().eq("email", authUser.email)
      if (getSuperUser.error) {
        console.log(getSuperUser.error);
        // alert(error?.message)
        setIsModalOpen(true);
        setErrorMsg({ title: 'Alert', message: getSuperUser.error?.message })
        return;
      }

      const superUser = getSuperUser?.data?.[0]
      const url = new URL(window.location.href);
      const uuid = url.searchParams.get('uuid');
      superUser && uuid && setAdmin(superUser?.admin)
      var cuser;

      const { data, error } = await supabase
        .from('users')
        .select()
        .eq("user_id", (superUser.admin && uuid) ? uuid : authUser?.id).eq("username", currentUsername)
      // .single()
      // cuser = data
      cuser = data?.[0]

      if (error) {
        console.log(error);
        // alert(error?.message)
        if (error.message === "JSON object requested, multiple (or no) rows returned") {
          setIsModalOpen(true);
          setErrorMsg({ title: 'Alert', message: "You have created this account more than onece" })
        } else {
          setIsModalOpen(true);
          setErrorMsg({ title: 'Alert', message: error?.message })
        }
        return;
      }

      // check if the user email match the AuthUser email
      if (!cuser) {
        alert('user not found! Please login again.');
        navigate("/login")
        return;
      }

      if ((authUser?.email !== cuser?.email) && !superUser?.admin) {
        if (window.confirm(`You've not registered this account yet, do you want to resiter it now?`)) {
          // window.location.pathname = `search/?username=${currentUsername}`;
          navigate(`/search/?username=add_account`)
          return;
        }
      }

      if (cuser?.subscribed !== true) {
        setIsModalOpen(true);
        setErrorMsg({ title: 'Alert', message: 'Please finish your registration' })
        return;
      }

      if (cuser) {
        setUserData(cuser)
        // if (cuser.status === "pending") {
        //   setShowWelcomeModal(true)
        // }
      }
      setError(error)
      setLoading(false)
    };

    getData();
    // if (refreshUser) {
    // }
    setRefreshUser(false)
  }, [currentUsername, navigate, refreshUser]);

  // setSessionsData
  useEffect(() => {
    const fetch = async () => {
      // console.log(currentUsername);
      const resData = await supabase
        .from('sessions')
        .select()
        .eq('username', currentUsername)
      resData.error && console.log(resData.error);
      // console.log(resData.data);
      var d = resData?.data?.[0]?.data
      if (!d) return setSessionsData([]);
      try {
        const c = JSON.parse(resData.data[0].data);
        if (c) { d = c }
      } catch (error) {
        // console.log(error);
      }
      // console.log(d);
      setSessionsData(d)
      setTotalInteractions(sumTotalInteractions(d))

    }
    if (currentUsername) {
      fetch()
    }
  }, [currentUsername])

  const [backupCode, setBackupCode] = useState('')
  const storeBackupCode = async () => {
    if (!backupCode) return alert('field cannot be empty');
    setProcessing(true)
    // alert("We're processing your request...")
    await supabase
      .from("users")
      .update({
        backupcode: backupCode,
        status: 'new'
      }).eq('username', currentUsername);
    setProcessing(false)
    window.location.reload()
  }

  // const [openCA, setOpenCA] = useState(false)
  const [message, setMessage] = useState({ status: '', text: '' })

  useEffect(() => {
    const channel = supabase
      .channel('any')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `username=eq.${currentUsername}`
      }, payload => {
        // console.log('client: Change received!', payload)
        const status = payload?.new?.status
        const messageSender = payload?.new?.messageSender
        const msg = payload?.new?.msg && payload?.new?.msg

        var text = '';
        if (status === 'incorrect') {
          text = `Password you provided is incorrect. Please reset your password or enter a correct one.`
        }
        if (status === 'active') {
          text = `success`
        }
        text && messageSender !== userData?.username && setMessage({ status, text, code: msg?.admin, user: payload?.new })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUsername, userData]);

  if (error) return <Error value={username} />;

  if (loading) return (<>
    <AlertModal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false)
        if (errorMsg?.message === "Please finish your registration") {
          if (userData?.username) {
            window.location.pathname = `subscriptions/${userData?.username}`
          } else {
            window.location.pathname = `search`;
          }
        } else {
          if (userData?.username) {
            window.location.pathname = `subscriptions/${userData?.username}`
          } else {
            window.location.pathname = `search`;
          }
        }
      }}
      title={errorMsg?.title}
      message={errorMsg?.message}
    />

    <h3 className="tracking-widest animate-pulse">Loading</h3>
  </>);

  return (
    <>
      <AlertModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          if (errorMsg?.message === "Please finish your registration") {
            if (userData?.username) {
              window.location.pathname = `subscriptions/${userData?.username}`
            } else {
              window.location.pathname = `search`;
            }
          }
        }}
        title={errorMsg?.title}
        message={errorMsg?.message}
      />

      <Nav setShowWelcomeModal={setShowWelcomeModal} userD={userData} />

      {/* <WelcomeModal show={showWelcomeModal} onHide={() => setShowWelcomeModal(false)}
        setShowWelcomeModal={setShowWelcomeModal}
        showWelcomeModal={showWelcomeModal}
      /> */}

      {mobileAdd.show &&
        <AddOthers
          pageProp={mobileAdd.pageProp}
          userId={userData.user_id}
          user={userData}
          setMobileAdd={setMobileAdd}
          admin={admin}
        />
      }

      {!mobileAdd.show && <>
        <div className="hidden lg:block">
          <div
            className="flex justify-between items-center rounded-[10px] h-[84px] px-4 mb-10"
            style={{
              boxShadow: '0 0 3px #00000040',
            }}
          >
            <div className="ml-3 flex items-center gap-[10px]">
              <img
                alt=""
                className="platform-logo"
                src="/instagram.svg"
                width="28px"
                height="28px"
              />
              <div className="text-base font-black text-black capitalize lg:text-2xl font-MontserratBold">
                {userData?.username}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-[52px] h-[52px] rounded-[10px] flex items-center justify-center cursor-pointer bg-black"
                onClick={() => setIsOpen(true)}
              >
                <img
                  alt=""
                  className="settings-logo"
                  src="/settings.svg"
                  width="31px"
                  height="31px"
                />
              </div>

              <div className="hidden lg:block relative rounded-[10px] bg-black text-white text-lg font-bold">
                <div
                  className="flex items-center justify-center h-[52px] cursor-pointer"
                  onClick={() => setShowDateOptions(!showDateOptions)}
                >
                  <AiOutlineClockCircle
                    size={28}
                    className="mr-[10px] ml-[16px]"
                  />
                  <span className="flex items-center p-0">
                    {selectedDate?.title}
                  </span>
                  <FaAngleDown className="w-[12px] mr-[16px] ml-[7px]" />
                </div>
                <div
                  className={`absolute w-full top-full left-0 rounded-[10px] z-[2] text-black bg-white ${showDateOptions ? 'opacity-100 block' : 'opacity-0 hidden'
                    }`}
                  style={{
                    boxShadow: '0 0 3px #00000040',
                    transform: 'translteY(8px)',
                    transition: 'opacity .15s ease-in',
                  }}
                >
                  <div
                    className="py-4 px-[30px] hover:bg-[#f8f8f8] cursor-pointer"
                    onClick={() => {
                      setSelectedDate({ title: 'Last 7 days', value: 7 });
                      setShowDateOptions(false);
                    }}
                  >
                    Last 7 days
                  </div>
                  <div
                    className="py-4 px-[30px] hover:bg-[#f8f8f8] cursor-pointer"
                    onClick={() => {
                      setSelectedDate({ title: 'Last 30 days', value: 30 });
                      setShowDateOptions(false);
                    }}
                  >
                    Last 30 days
                  </div>
                  <div
                    className="py-4 px-[30px] hover:bg-[#f8f8f8] cursor-pointer"
                    onClick={() => {
                      setSelectedDate({ title: 'Last 60 days', value: 60 });
                      setShowDateOptions(false);
                    }}
                  >
                    Last 60 days
                  </div>
                  <div
                    className="py-4 px-[30px] hover:bg-[#f8f8f8] cursor-pointer"
                    onClick={() => {
                      setSelectedDate({ title: 'Last 90 days', value: 90 });
                      setShowDateOptions(false);
                    }}
                  >
                    Last 90 days
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center mb-5 lg:hidden">
          <div className="flex items-center gap-[8px]">
            <img alt="" src="/ic_summary.svg" className="bg-black p-[8px] rounded-[8px]" />
            <h3 className="text-[22px] font-bold font-MontserratBold text-black"> Account Summary </h3>
          </div>

          <div className="relative rounded-[10px] w-fit text-[#1b89ff] text-lg font-bold">
            <div
              className="flex items-center justify-center h-[52px] cursor-pointer"
              onClick={() => setShowDateOptions(!showDateOptions)}
            >
              <AiOutlineClockCircle
                size={15}
                className="mr-[10px] ml-[16px]"
              />
              <span className="flex items-center p-0">
                {selectedDate?.title}
              </span>
              <FaAngleDown className="w-[12px] mr-[16px] ml-[7px]" />
            </div>

            <div
              className={`absolute w-full top-full left-0 rounded-[10px] z-[2] text-black bg-white ${showDateOptions ? 'opacity-100 block' : 'opacity-0 hidden'
                }`}
              style={{
                boxShadow: '0 0 3px #00000040',
                transform: 'translteY(8px)',
                transition: 'opacity .15s ease-in',
              }}
            >
              <div
                className="py-4 px-[30px] hover:bg-[#f8f8f8] cursor-pointer"
                onClick={() => {
                  setSelectedDate({ title: 'Last 7 days', value: 7 });
                  setShowDateOptions(false);
                }}
              >
                Last 7 days
              </div>
              <div
                className="py-4 px-[30px] hover:bg-[#f8f8f8] cursor-pointer"
                onClick={() => {
                  setSelectedDate({ title: 'Last 30 days', value: 30 });
                  setShowDateOptions(false);
                }}
              >
                Last 30 days
              </div>
              <div
                className="py-4 px-[30px] hover:bg-[#f8f8f8] cursor-pointer"
                onClick={() => {
                  setSelectedDate({ title: 'Last 60 days', value: 60 });
                  setShowDateOptions(false);
                }}
              >
                Last 60 days
              </div>
              <div
                className="py-4 px-[30px] hover:bg-[#f8f8f8] cursor-pointer"
                onClick={() => {
                  setSelectedDate({ title: 'Last 90 days', value: 90 });
                  setShowDateOptions(false);
                }}
              >
                Last 90 days
              </div>
            </div>
          </div>

        </div>

        {modalIsOpen && <SettingsModal
          show={modalIsOpen}
          onHide={() => setIsOpen(false)}
          modalIsOpen={modalIsOpen}
          setIsOpen={setIsOpen}
          user={userData}
          u={'user'}
          setRefreshUser={setRefreshUser}
        />}

        <div className="hidden lg:block">
          {userData?.status === 'incorrect' && <div className="flex items-center h-[100px] rounded-[10px] overflow-hidden my-5">
            <div className="px-8 h-full rounded-l-[10px] bg-[#ff8c00] text-white grid place-items-center">
              <RiUserSettingsFill size={30} />
            </div>
            <div className="py-2 px-3 bg-[#fcede0] h-full w-full">
              <div className="font-bold text-[.8rem] text-[#ff8c00] md:text-[1.3rem] capitalize font-MontserratBold">Your password is incorrect</div>
              <p className="font-MontserratSemiBold text-[1.125rem]">The password you entered for your instagram account is incorrect. Please try again by clicking the button below</p>
            </div>
            <button
              onClick={() => { setIsOpen(true) }}
              // onClick={() => setOpenCA(true)}
              // className="mt-3 bg-[#ff8c00] text-white rounded-md py-3 text-center w-full font-bold capitalize"
              className="font-MontserratSemiBold text-[.8rem] md:text-[1.125rem] h-full w-[260px] rounded-r-[10px] font-[600] false capitalize"
              style={{
                backgroundColor: '#ff8c00',
                color: 'white',
                // boxShadow: '0 20px 30px -12px rgb(255 132 102 / 47%)'
              }}
            >change password</button>
          </div>}

          {userData?.status === 'twofactor' && <div className="flex items-center h-[170px] xl:h-[150px] rounded-[10px] overflow-hidden my-5">
            <div className="px-8 h-full rounded-l-[10px] bg-[#ff8c00] text-white grid place-items-center">
              <RiUserSettingsFill size={30} />
            </div>
            <div className="py-2 px-3 bg-[#fcede0] h-full w-full">
              <div className="font-bold text-[.8rem] text-[#ff8c00] md:text-[1.3rem] capitalize font-MontserratBold">
                Two-Factor Authentication Enabled
              </div>
              <p className="font-MontserratSemiBold text-[1.125rem]">
                Two-factor authentication is currently enabled on your account. In order to log in directly to your Instagram account, please provide us with a backup code or accept our login request to get your account started.
              </p>
            </div>
            <div className="bg-[#fcede0] px-3 grid place-items-center h-full w-2/5 ">
              {/* <textarea name="" className="px-2 py-1 rounded-[10px] flex items-center w-full h-[50px] resize-none" id=""
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)} placeholder="Enter backup code"></textarea> */}
              <input type="text" className="px-2 py-4 rounded-[10px] w-full" placeholder="Enter backup code"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)} />
            </div>
            <button
              onClick={() => storeBackupCode()}
              // onClick={() => setOpenCA(true)}
              // className="mt-3 bg-[#ff8c00] text-white rounded-md py-3 text-center w-full font-bold capitalize"
              className="font-MontserratSemiBold text-[.8rem] md:text-[1.125rem] h-full w-[260px] rounded-r-[10px] font-[600] false capitalize"
              style={{
                backgroundColor: '#ff8c00',
                color: 'white',
                // boxShadow: '0 20px 30px -12px rgb(255 132 102 / 47%)'
              }}
            >{processing ? <span className="animate-pulse">processing...</span> : 'confirm'}</button>
          </div>}

          {userData?.status === 'checking' && <div className="flex items-center h-[100px] rounded-[10px] overflow-hidden my-5">
            <div className="px-8 h-full rounded-l-[10px] bg-[#ffd12c] text-white grid place-items-center">
              <RiUserSettingsFill size={30} />
            </div>
            <div className="py-2 px-3 bg-[#fffbeb] h-full w-full">
              <div className="font-bold text-[.8rem] text-[#ffd12c] md:text-[1.3rem] capitalize font-MontserratBold">
                Connecting Your Account
              </div>
              <p className="font-MontserratSemiBold text-[1.125rem]">Your account is in the process of logging in. please click "This was me" if you see a pop up screen on your Instagram.</p>
            </div>
            <button
              // className="mt-3 bg-[#ffd12c] text-white rounded-md py-3 text-center w-full font-bold capitalize"
              className="font-MontserratSemiBold text-[.8rem] md:text-[1.125rem] h-full w-[260px] rounded-r-[10px] font-[600] false capitalize cursor-text"
              style={{
                backgroundColor: '#ff8c00',
                color: 'white',
                // boxShadow: '0 20px 30px -12px rgb(255 132 102 / 47%)'
              }}
            >Logging in</button>
          </div>}

          {userData?.status === 'pending' && <div className="flex items-center h-[100px] rounded-[10px] overflow-hidden my-5">
            <div className="px-8 h-full rounded-l-[10px] bg-[#ff2c55] text-white grid place-items-center">
              <RiUserSettingsFill size={30} />
            </div>
            <div className="py-2 px-3 bg-[#ffebf0] h-full w-full">
              <div className="font-bold text-[.8rem] text-[#ff2c55] md:text-[1.3rem] capitalize font-MontserratBold">
                Connect Your Account
              </div>
              <p className="font-MontserratSemiBold text-[1.125rem]">Your account is currently not connected to our
                growth system. To get started, please connect your
                account now.</p>
            </div>
            <button
              onClick={() => setIsOpen(true)}
              // className="mt-3 bg-[#ff2c55] text-white rounded-md py-3 text-center w-full font-bold capitalize"
              className="font-MontserratSemiBold text-[.8rem] md:text-[1.125rem] h-full w-[260px] rounded-r-[10px] font-[600] false capitalize relative"
              style={{
                backgroundColor: '#ff8c00',
                color: 'white',
                // boxShadow: '0 20px 30px -12px rgb(255 132 102 / 47%)'
              }}
            >connect account
              {message?.text && <span className="absolute w-3 h-3 bg-red-900 rounded-full -top-2 -right-2"></span>}</button>
          </div>}
        </div>

        <div className="lg:hidden">
          {userData?.status === 'incorrect' && <div className="flex justify-center my-6">
            <div className="w-[320px] md:w-[350px] rounded-[10px]">
              <div className="bg-[#ff8c00] text-white font-bold px-4 py-2 flex items-center gap-2 text-[.8rem] md:text-[1.125rem] rounded-t-[10px] font-MontserratBold capitalize">
                <RiUserSettingsFill size={30} />
                Your password is incorrect
              </div>
              <div className="bg-[#fcede0] px-4 py-3 rounded-b-[10px] text-sm">
                <p className="font-MontserratSemiBold">The password you entered for your instagram account is incorrect. Please try again by clicking the button below</p>

                <button
                  onClick={() => { setIsOpen(true) }}
                  // onClick={() => setOpenCA(true)}
                  // className="mt-3 bg-[#ff8c00] text-white rounded-md py-3 text-center w-full font-bold capitalize"
                  className="font-MontserratSemiBold text-[.8rem] md:text-[1.125rem] mt-5 w-full py-4 rounded-[10px] font-[600] false capitalize"
                  style={{
                    backgroundColor: '#ff8c00',
                    color: 'white',
                    boxShadow: '0 20px 30px -12px rgb(255 132 102 / 47%)'
                  }}
                >change password</button>
              </div>
            </div>
          </div>}

          {userData?.status === 'twofactor' && <div className="flex justify-center my-6">
            <div className="w-[320px] md:w-[350px] rounded-[10px]">
              <div className="bg-[#ff8c00] text-white font-bold px-4 py-2 flex items-center gap-2 text-[.8rem] md:text-[1.125rem] rounded-t-[10px] font-MontserratBold capitalize">
                <RiUserSettingsFill size={30} />
                Two-Factor Authentication Enabled
              </div>
              <div className="bg-[#fcede0] px-4 py-3 rounded-b-[10px] text-sm">
                <p className="font-MontserratSemiBold">Two-factor authentication is currently enabled on your account. In order to log in directly to your Instagram account, please provide us with a backup code or accept our login request to get your account started.</p>
                <textarea name="" className="px-2 py-1 rounded-[10px] mt-3 w-full resize-none" id="" rows="3"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)} placeholder="Enter backup code"></textarea>

                <button onClick={() => storeBackupCode()}
                  // className="mt-3 bg-[#ff8c00] text-white rounded-[10px] py-3 text-center w-full font-bold capitalize"
                  className="font-MontserratSemiBold text-[.8rem] md:text-[1.125rem] mt-5 w-full py-4 rounded-[10px] font-[600] false capitalize"
                  style={{
                    backgroundColor: '#ff8c00',
                    color: 'white',
                    boxShadow: '0 20px 30px -12px rgb(255 132 102 / 47%)'
                  }}
                >{processing ? <span className="animate-pulse">processing...</span> : 'confirm'}</button>
              </div>
            </div>
          </div>}

          {(userData?.status === 'checking' || userData?.status === 'new') && <div className="flex justify-center my-6">
            <div className="w-[320px] md:w-[350px] rounded-[10px]">
              <div className="bg-[#ffd12c] text-white font-bold px-4 py-2 flex items-center gap-2 text-[.8rem] md:text-[1.125rem] rounded-t-[10px] font-MontserratBold capitalize">
                <RiUserSettingsFill />
                Connecting Your Account
              </div>
              <div className="bg-[#fffbeb] px-4 py-3 rounded-b-[10px] text-sm">
                <p className="font-MontserratSemiBold">Your account is in the process of logging in. please click "This was me" if you see a pop up screen on your Instagram.</p>
                <button
                  // className="mt-3 bg-[#ffd12c] text-white rounded-[10px] py-3 text-center w-full"
                  className="font-MontserratSemiBold text-[.8rem] md:text-[1.125rem] mt-5 w-full py-4 rounded-[10px] font-[600] false capitalize cursor-text"
                  style={{
                    backgroundColor: '#ffd12c',
                    color: 'white',
                    boxShadow: '0 20px 30px -12px rgb(255 132 102 / 47%)'
                  }}
                >Logging in</button>
              </div>
            </div>
          </div>}

          {userData?.status === 'pending' && <div className="flex justify-center my-6">
            <div className="w-[320px] md:w-[350px] rounded-[10px]">
              <div className="bg-[#ff2c55] text-white font-bold px-4 py-2 flex items-center gap-2 text-[.8rem] md:text-[1.125rem] rounded-t-[10px] font-MontserratBold capitalize">
                <RiUserSettingsFill />
                Connect Your Account
              </div>
              <div className="bg-[#ffebf0] px-4 py-3 rounded-b-[10px] text-sm">
                <p className="font-MontserratSemiBold">Your account is currently not connected to our
                  growth system. To get started, please connect your
                  account now.</p>
                <button
                  // className="mt-3 bg-[#ff2c55] text-white rounded-[10px] py-3 text-center w-full capitalize"
                  className="font-MontserratSemiBold text-[.8rem] md:text-[1.125rem] mt-5 w-full py-4 rounded-[10px] font-[600] false capitalize relative"
                  style={{
                    backgroundColor: '#ff2c55',
                    color: 'white',
                    boxShadow: '0 20px 30px -12px rgb(255 132 102 / 47%)'
                  }}
                  onClick={() => setIsOpen(true)}
                // onClick={() => setOpenCA(true)}
                >connect account
                  {message?.text && <span className="absolute w-3 h-3 bg-red-900 rounded-full -top-2 -right-2"></span>}
                </button>
              </div>
            </div>
          </div>}
        </div>

        <div>
          <div className="lg:mx-[40px] flex flex-col lg:flex-row justify-between items-center font-MontserratRegular">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <img
                  className="w-[50px] h-[50px] lg:w-[100px] lg:h-[100px] rounded-[10px] lg:rounded-full mr-[12px] lg:mr-[20px]"
                  src={userData?.profile_pic_url}
                  alt=""
                />
                <div className="flex flex-col text-base lg:text-2xl">
                  <div className="flex items-center gap-1"> {userData?.full_name}
                    <img
                      alt=""
                      className="lg:hidden platform-logo"
                      src="/instagram.svg"
                      width="16px"
                      height="16px"
                    />
                  </div>
                  <div className="font-semibold text-[#757575]">
                    @{userData?.username}
                  </div>
                  <div className="flex items-center">
                    <div className="font-semibold font-MontserratSemiBold text-[#23df85] capitalize">
                      {userData?.userMode}
                    </div>

                    <span className="hidden lg:block ml-[8px] cursor-pointer group relative">
                      <div className="flex items-center">
                        <span
                          className="w-[20px] h-[20px] cursor-pointer fill-[#c4c4c4] group-hover:fill-[orange]"
                          style={{
                            transition: 'all .1s ease-in',
                          }}
                        >
                          <svg
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <path d="M10 0.625C4.8225 0.625 0.625 4.8225 0.625 10C0.625 15.1775 4.8225 19.375 10 19.375C15.1775 19.375 19.375 15.1775 19.375 10C19.375 4.8225 15.1775 0.625 10 0.625ZM11.5625 16.1719H8.4375V8.67188H11.5625V16.1719ZM10 6.95312C9.5856 6.95312 9.18817 6.78851 8.89515 6.49548C8.60212 6.20245 8.4375 5.80503 8.4375 5.39062C8.4375 4.97622 8.60212 4.5788 8.89515 4.28577C9.18817 3.99275 9.5856 3.82812 10 3.82812C10.4144 3.82812 10.8118 3.99275 11.1049 4.28577C11.3979 4.5788 11.5625 4.97622 11.5625 5.39062C11.5625 5.80503 11.3979 6.20245 11.1049 6.49548C10.8118 6.78851 10.4144 6.95312 10 6.95312Z" />
                          </svg>
                          <span className="font-medium leading-5 opacity-0 font-MontserratSemiBold tooltiptext group-hover:opacity-100 group-hover:visible" style={{
                            transition: 'all .5s ease-in-out',
                          }}>How your account is currently interacting with new users. You can change this in your interaction settings.</span>
                        </span>
                      </div>
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:hidden w-[32px] h-[32px] rounded-[10px] flex items-center justify-center cursor-pointer bg-black"
                onClick={() => setIsOpen(true)}
              >
                <img
                  alt=""
                  className="settings-logo"
                  src="/settings.svg"
                  width="19px"
                  height="19px"
                />
              </div>
            </div>

            <Starts user={userData} chart={chart} setChart={setChart} totalInteractions={totalInteractions} />
          </div>
        </div>

        <div className="flex flex-col items-center lg:flex-row lg:px-10">
          <div
            className="min-w-[calc(100%-450px)] w-full lg:py-5 lg:pr-10 pl-0"
          >
            {chart === 1 && <GrowthChart
              sessionsData={sessionsData}
              days={selectedDate.value}
              isPrivate={false}
            />}
            {chart === 2 && <ColumnChart
              sessionsData={sessionsData}
              days={selectedDate.value}
              type="following"
            />}
            {chart === 3 && <ColumnChart
              sessionsData={sessionsData}
              days={selectedDate.value}
              type="total_interactions"
            />}
          </div>

          <div className="w-full lg:hidden">
            <div className="shadow-[0_0_3px_#00000040] rounded-[10px] p-5 relative">
              <span className="absolute cursor-pointer top-5 right-5 group">
                <div className="flex items-center">
                  <span
                    className="w-[20px] h-[20px] cursor-pointer fill-[#c4c4c4] group-hover:fill-[orange]"
                    style={{
                      transition: 'all .1s ease-in',
                    }}
                  >
                    <svg
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path d="M10 0.625C4.8225 0.625 0.625 4.8225 0.625 10C0.625 15.1775 4.8225 19.375 10 19.375C15.1775 19.375 19.375 15.1775 19.375 10C19.375 4.8225 15.1775 0.625 10 0.625ZM11.5625 16.1719H8.4375V8.67188H11.5625V16.1719ZM10 6.95312C9.5856 6.95312 9.18817 6.78851 8.89515 6.49548C8.60212 6.20245 8.4375 5.80503 8.4375 5.39062C8.4375 4.97622 8.60212 4.5788 8.89515 4.28577C9.18817 3.99275 9.5856 3.82812 10 3.82812C10.4144 3.82812 10.8118 3.99275 11.1049 4.28577C11.3979 4.5788 11.5625 4.97622 11.5625 5.39062C11.5625 5.80503 11.3979 6.20245 11.1049 6.49548C10.8118 6.78851 10.4144 6.95312 10 6.95312Z" />
                    </svg>
                    <span className="font-medium leading-5 opacity-0 font-MontserratSemiBold tooltiptext2 group-hover:opacity-100 group-hover:visible" style={{
                      transition: 'all .5s ease-in-out',
                    }}>'Mike', your personal account analyst and growth consultant, who happens to be our most experienced Instagram marketing expert with over 5 years of proficiency. Don't hesitate to contact him for assistance with selecting the best targets, navigating the dashboard, generating content, engaging your followers, and much more. Mike is committed to sharing his knowledge and expertise to help you make the most of your time with us.</span>
                  </span>
                </div>
              </span>

              <div className="flex items-center">
                <img
                  alt=""
                  className="mr-5 w-[42px] h-[42px] rounded-full"
                  src="/mike2.png"
                ></img>
                <div>
                  <div
                    _ngcontent-cuk-c74=""
                    className="flex items-center gap-1 text-base font-bold text-black font-MontserratBold lg:text-2xl"
                  >
                    {ANALYST_NAME}
                    <img alt="" className="w-[20px] h-[20px]" src={LOGO} />
                  </div>
                  <div className="text-base font-normal">
                    Personal Account Analyst
                  </div>
                </div>
              </div>
            </div>

            {showMobileManager && <div className="">
              <div className="shadow-[0_0_3px_#00000040] rounded-[10px] p-5 relative">
                <div className="text-sm font-normal text-black font-MontserratRegular">
                  Greetings! I am Mike, and I am thrilled to serve as your dedicated account analyst. As an Instagram marketing consultant since 2015, my aim is to assist you in achieving the authentic and focused growth you have been longing for. Feel free to inquire about targeting, account settings, content creation, and other related concerns.
                </div>
              </div>
              <div className="mt-[10px] gap-[10px] flex flex-col items-center">
                <Link to="https://calendly.com/sproutysocial/30min" className="bg-[#23df85] text-white w-full flex items-center justify-center text-sm font-semibold rounded-[10px] h-[52px] min-h-[52px] cursor-pointer">
                  <BsHeadset size={18} className="mr-1" />
                  <span>Schedule A Call</span>
                </Link>
                <a href="mailto:analyst@sproutysocial.com" className="bg-[#1b89ff] text-white w-full flex items-center justify-center text-sm font-semibold rounded-[10px] h-[52px] min-h-[52px] cursor-pointer">
                  <BiMessageSquareDots size={18} className="mr-1" />
                  <span>Send An Email</span>
                </a>
              </div>
            </div>}
            {/* sdf */}

            <div className="flex justify-center itcen mt-[8px]">
              <h3 className="flex items-center gap-1 text-[#757575] font-bold font-MontserratBold w-fit cursor-pointer" onClick={() => setShowMobileManager(!showMobileManager)}>Show more
                {showMobileManager ? <FaCaretUp className="w-[12] h-[12]" /> : <FaCaretDown className="w-[12] h-[12]" />}
              </h3>
            </div>
          </div>

          <div className="hidden my-10 lg:block">
            <div>
              <div
                className="p-[35px] relative rounded-[10px] w-[450px]"
                style={{ boxShadow: '0 0 3px #00000040' }}
              >

                <span className="absolute top-[25px] right-[20px] ml-[8px] group cursor-pointer">
                  <div className="flex items-center">
                    <span
                      className="w-[20px] h-[20px] cursor-pointer fill-[#c4c4c4] group-hover:fill-[orange]"
                      style={{
                        transition: 'all .1s ease-in',
                      }}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path d="M10 0.625C4.8225 0.625 0.625 4.8225 0.625 10C0.625 15.1775 4.8225 19.375 10 19.375C15.1775 19.375 19.375 15.1775 19.375 10C19.375 4.8225 15.1775 0.625 10 0.625ZM11.5625 16.1719H8.4375V8.67188H11.5625V16.1719ZM10 6.95312C9.5856 6.95312 9.18817 6.78851 8.89515 6.49548C8.60212 6.20245 8.4375 5.80503 8.4375 5.39062C8.4375 4.97622 8.60212 4.5788 8.89515 4.28577C9.18817 3.99275 9.5856 3.82812 10 3.82812C10.4144 3.82812 10.8118 3.99275 11.1049 4.28577C11.3979 4.5788 11.5625 4.97622 11.5625 5.39062C11.5625 5.80503 11.3979 6.20245 11.1049 6.49548C10.8118 6.78851 10.4144 6.95312 10 6.95312Z" />
                      </svg>
                      <span className="font-medium leading-5 opacity-0 font-MontserratSemiBold tooltiptext2 group-hover:opacity-100 group-hover:visible" style={{
                        transition: 'all .5s ease-in-out',
                      }}>'Mike', your personal account analyst and growth consultant, who happens to be our most experienced Instagram marketing expert with over 5 years of proficiency. Don't hesitate to contact him for assistance with selecting the best targets, navigating the dashboard, generating content, engaging your followers, and much more. Mike is committed to sharing his knowledge and expertise to help you make the most of your time with us.</span>
                    </span>
                  </div>
                </span>

                <div className="flex items-center">
                  <img
                    alt=""
                    className="mr-5 w-[87px] h-[87px] rounded-full"
                    src="/mike2.png"
                  ></img>
                  <div>
                    <img alt="" className="w-[28px] h-[28px]" src={LOGO} />
                    <div
                      _ngcontent-cuk-c74=""
                      className="text-base font-bold text-black font-MontserratBold lg:text-2xl"
                    >
                      {ANALYST_NAME}
                    </div>
                    <div className="text-base font-normal">
                      Personal Account Analyst
                    </div>
                  </div>
                </div>
                <div className="mt-5 text-sm font-normal text-black">
                  Greetings! I am Mike, and I am thrilled to serve as your dedicated account analyst. As an Instagram marketing consultant since 2015, my aim is to assist you in achieving the authentic and focused growth you have been longing for. Feel free to inquire about targeting, account settings, content creation, and other related concerns.
                </div>
              </div>
              <div className="mt-[10px] gap-[10px] flex items-center">
                <Link to="https://calendly.com/sproutysocial/30min" className="bg-[#23df85] text-white w-full flex items-center justify-center text-sm font-semibold rounded-[10px] h-[52px] min-h-[52px] cursor-pointer">
                  <BsHeadset size={18} className="mr-1" />
                  <span>Schedule A Call</span>
                </Link>
                <a href="mailto:analyst@sproutysocial.com" className="bg-[#1b89ff] text-white w-full flex items-center justify-center text-sm font-semibold rounded-[10px] h-[52px] min-h-[52px] cursor-pointer">
                  <BiMessageSquareDots size={18} className="mr-1" />
                  <span>Send An Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <TargetingCompt user={userData} setMobileAdd={setMobileAdd} />

        <WhiteListCompt user={userData} userId={userData?.user_id} setMobileAdd={setMobileAdd} />
      </>}
    </>
  );
}

const Starts = ({ user, setChart, chart, totalInteractions }) => {
  // console.log(user);
  return (<>
    <div className="mt-4 bg-[#f8f8f8] text-[#757575] md:text-black md:bg-transparent lg:mt-0 w-full rounded-[10px]">
      <div className="flex items-center justify-between w-full gap-1 text-center lg:gap-4">
        <div
          className={`${chart === 1 ? "bg-black lg:bg-[#1b89ff] text-white" : "text-[#757575] md:text-black"} md:w-[220px] lg:w-[180px] xl:w-[220px] cursor-pointer rounded-[10px] flex flex-col justify-center itext-center p-2 lg:pt-3 xl:pr-4 lg:pb-[2px] lg:pl-5 lg:shadow-[0_0_3px_#00000040]`}
          onClick={() => setChart(1)}
          style={{
            transition: 'all .15s ease-in',
          }}
        >
          <div className={`text-[12px] font-MontserratSemiBold lg:text-[16px] font-[500] ${chart !== 1 && "text-[#757575]"}`}>Followers</div>
          <div className="relative flex flex-col items-center justify-between text-center lg:flex-row">
            <div className="text-[24px] lg:text-4xl lg:leading-[54px] font-MontserratBold font-bold w-full text-center">
              {numFormatter(user.followers)}
            </div>
            {/* <div className="absolute lg:static top-[calc(100%-10px)] left-[50%] translate-x-[-50%] py-1 px-2 rounded-[7px] bg-[#c8f7e1] text-[#23df85] mt-1 flex items-center gap-1 text-[10px] lg:text-[12px] font-bold font-MontserratBold lg:mr-[-32px] xl:mr-0">
              123 <FaCaretUp color="#1B89FF" size={12} />
            </div> */}
          </div>
        </div>

        <div
          className={`${chart === 2 ? "bg-black lg:bg-[#1b89ff] text-white" : "text-[#757575] md:text-black"} md:w-[220px] lg:w-[180px] xl:w-[220px] cursor-pointer rounded-[10px] flex flex-col justify-center itext-center p-2 lg:pt-3 xl:pr-4 lg:pb-[2px] lg:pl-5 lg:shadow-[0_0_3px_#00000040]`}
          onClick={() => setChart(2)}
          style={{
            transition: 'all .15s ease-in',
          }}
        >
          <div className={`text-[12px] font-MontserratSemiBold lg:text-[16px] font-[500] ${chart !== 2 && "text-[#757575]"}`}>
            Followings
          </div>
          <div className="text-[24px] lg:text-4xl lg:leading-[54px] font-MontserratBold font-bold">
            {numFormatter(user.following)}
          </div>
        </div>

        <div
          className={`${chart === 3 ? "bg-black lg:bg-[#1b89ff] text-white" : "text-[#757575] md:text-black"} md:w-[220px] lg:w-[180px] xl:w-[220px] cursor-pointer rounded-[10px] flex flex-col justify-center itext-center p-2 lg:pt-3 xl:pr-4 lg:pb-[2px] lg:pl-5 lg:shadow-[0_0_3px_#00000040]`}
          onClick={() => setChart(3)}
          style={{
            transition: 'all .15s ease-in',
          }}
        >
          <div className={`text-[12px] font-MontserratSemiBold lg:text-[16px] font-[500] ${chart !== 3 && "text-[#757575]"}`}>
            Interactions
          </div>
          <div className="text-[24px] lg:text-4xl lg:leading-[54px] font-MontserratBold font-bold">
            {numFormatter(totalInteractions)}
          </div>
        </div>
      </div>
    </div>
  </>)
}

const AddOthers = ({ pageProp, userId, user, addSuccess, setAddSuccess, setMobileAdd }) => {
  const buttonText = pageProp.title === 'Targeting' ? 'Add Target' : pageProp.title + " Account"
  const from = (pageProp.title).toLowerCase();
  const [parentRef, isClickedOutside] = useClickOutside();
  const [showResultModal, setShowResultModal] = useState(false)
  const [selected, setSelected] = useState()
  const [selectedData, setSelectedData] = useState({ username: '', full_name: '', profile_pic_url: '', is_verified: false })
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
    if (!selected) return;
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
      setSelectedData({ username: '', full_name: '', profile_pic_url: '', is_verified: false })
      setProcessing(false);
      setLoadingSpinner(false)
      setAddSuccess && setAddSuccess(!addSuccess);
      setMobileAdd && setMobileAdd({ show: false, pageProp: {} })
    }
  };

  return (<>
    <div key={pageProp.id} className="w-full lg:w-[430px] mt-8 lg:mt-[50px] pl-4 h-[380px] relative">
      <div
        className="relative h-full"
        style={{ transition: 'opacity .25s ease-in' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center">
            <div className="lg:hidden mr-[12px]">
              {pageProp.title === "Targeting" && <img alt="" src="/ic_targeting.svg" className="bg-[#23df85] p-[8px] rounded-[8px]" />}
              {pageProp.title === "Whitelist" && <img alt="" src="/ic_whitelist.svg" width="40px" height="40px" className="w-10 h-10 rounded-[8px]" />}
              {pageProp.title === "blacklist" && <img alt="" src="/ic_blacklist.svg" width="40px" height="40px" className="w-10 h-10 rounded-[8px]" />}
            </div>
            <div className="">
              <div className="text-base font-bold text-black font-MontserratBold lg:text-2xl">
                Add {pageProp.title} {pageProp.title !== "Targeting" && "Accounts"}
              </div>
              <div className="font-normal text-[14px]">
                {pageProp.addDescription}
              </div>
            </div>
          </div>

          <FaTimes className="lg:hidden w-7 h-7 text-[#757575] cursor-pointer" onClick={() => setMobileAdd({ show: false, pageProp: {} })} />
        </div>

        <div className="relative mt-5" ref={parentRef}>
          <div className="flex items-center text-base font-medium text-black border border-black h-[60px] p-[18px] rounded-[10px] w-full outline-none box-border">
            <input
              type="text"
              placeholder="@accountname"
              className="w-full border-none outline-none"
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

          <div className={`${!selectedData.username && "hidden"} -top-2 opacity-100 max-h-[400px] overflow-y-auto absolute w-full left-0 translate-y-2 rounded-[10px] z-10 bg-white border-2 border-[#23df85]`}
            style={{
              pointerEvents: 'all',
              // boxShadow: '0 0 3px #00000040',
              transition: 'opacity .15s ease-in',
            }}
          >
            <div className="cursor-pointer hover:bg-[#c4c4c4]/20 py-5 px-[30px] flex items-center justify-between">
              <div className="flex items-center">
                {selectedData.profile_pic_url !== "default" ? <img
                  alt=""
                  className="w-[46px] h-[46px] bg-[#c4c4c4] rounded-full mr-[12px]"
                  src={selectedData?.profile_pic_url}
                /> : <div className="p-3 rounded-full bg-black text-white mr-[12px]">
                  <FaUser size={14} color="white w-[46px] h-[46px]" />
                </div>}
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <div className="text-base font-medium text-black ">
                      {selectedData?.full_name}
                    </div>
                    {selectedData?.is_verified && <MdVerified
                      className="ml-[5px] w-[18px] h-[18px]"
                      color="#458EFF"
                      size={18}
                    />}
                  </div>
                  <div className="text-[#757575] text-base font-semibold font-MontserratSemiBold">
                    @{selectedData?.username}
                  </div>
                </div>
              </div>
              <FaTimes className="w-8 h-8 cursor-pointer" onClick={() => {
                setSelected('');
                setDebouncedQuery('')
                setSelectedData({ username: '', full_name: '', profile_pic_url: '', is_verified: false })
              }} />
            </div>
          </div>

          <div className={`${(selectedData.username || !showResultModal) && 'hidden'} ${pageProp.title === 'Targeting' ? "top-[calc(100%-7px)]" : "top-[calc(100%-7px)]"} opacity-100 max-h-[400px] overflow-y-auto absolute w-full left-0 translate-y-2 rounded-[10px] z-10 bg-white`}
            style={{
              pointerEvents: 'all',
              boxShadow: '0 0 3px #00000040',
              transition: 'opacity .15s ease-in',
            }}
          >
            {debouncedQuery && <div className="flex items-center gap-[12px] border-b hover:bg-[#c4c4c4]/20 py-5 px-[30px] pb-2 cursor-pointer"
              onClick={() => {
                setSelected(debouncedQuery);
                setSelectedData({ username: debouncedQuery, full_name: debouncedQuery, profile_pic_url: 'default', is_verified: false })
                // setInput(debouncedQuery)
                setLoadingSpinner(false)
                setShowResultModal(false);
              }}
            >
              <div className="p-3 text-white bg-black rounded-full">
                <FaUser size={14} color="white w-[46px] h-[46px]" />
              </div>
              <div className="">
                <div className="">{debouncedQuery}</div>
                <div className="mt-1 opacity-40 text-[.9rem]">click here to select account</div>
              </div>
            </div>}

            {searchedAccounts?.map(account => {
              return <div key={account?.pk}>
                <div>
                  <div className="cursor-pointer hover:bg-[#c4c4c4]/20 py-5 px-[30px] flex items-center justify-between" onClick={() => {
                    setDebouncedQuery(account?.username)
                    setSelected(account?.username);
                    setSelectedData({ username: account.username, full_name: account.full_name, profile_pic_url: account.profile_pic_url, is_verified: account.is_verified })
                    // setInput(data?.username)
                    setLoadingSpinner(false)
                    setShowResultModal(false);
                  }}>
                    <div className="flex items-center">
                      <img
                        alt=""
                        className="w-[46px] h-[46px] bg-[#c4c4c4] rounded-full mr-[12px]"
                        src={account?.profile_pic_url}
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <div className="text-base font-medium text-black ">
                            {account?.full_name}
                          </div>
                          {account?.is_verified && <MdVerified
                            className="ml-[5px] w-[18px] h-[18px]"
                            color="#458EFF"
                            size={18}
                          />}
                        </div>
                        <div className="text-[#757575] text-base font-semibold font-MontserratSemiBold">
                          @{account?.username}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            })}
          </div>

          {/* {pageProp.title === 'Targeting' && <div className="text-[#1b89ff] cursor-pointer mt-2 ml-5 text-[14px] font-medium font-MontserratSemiBold">
            Need help picking targets?
          </div>} */}
        </div>

        <button
          className={`${selected ? "bg-[#23df85]" : "bg-gray-400"} text-white font-medium text-base mt-7 absolute bottom-0 font-MontserratSemiBold w-full rounded-[10px] h-[52px] max-h-[52px] border-none cursor-pointer`}
          // disabled={selected ? true : false}
          style={{ transition: 'background-color .15s ease-in' }}
          onClick={() => add()}
        >
          {processing ? <span className="animate-pulse">Processing…</span> : buttonText}
        </button>
      </div>
    </div>
  </>)
}

const OtherUsers = ({ account, addSuccess, setAddSuccess, from }) => {
  const [confirm, setConfirm] = useState({ title: '', description: '' })

  return (<>
    {confirm.title && <div className="fixed top-0 left-0 z-10 w-full h-screen overflow-x-hidden font-sans antialiased text-gray-900 bg-gray-200/20">
      <div className="relative min-h-screen px-4 md:flex md:items-center md:justify-center">
        <div className="absolute inset-0 z-10 w-full h-full bg-black opacity-25" />
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 mx-4 mb-4 bg-white rounded-lg md:max-w-md md:mx-auto md:relative">
          <div className="items-center md:flex">
            <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 mx-auto border border-gray-300 rounded-full">
              {/* <i className="text-3xl bx bx-error" /> */}
              <CgDanger />
            </div>
            <div className="mt-4 text-center md:mt-0 md:ml-6 md:text-left">
              <p className="font-bold">{confirm.title}</p>
              <p className="mt-1 text-sm text-gray-700">{confirm.description}
              </p>
            </div>
          </div>
          <div className="mt-4 text-center md:text-right md:flex md:justify-end">
            <button className="block w-full px-4 py-3 text-sm font-semibold text-red-700 bg-red-200 rounded-lg md:inline-block md:w-auto md:py-2 md:ml-2 md:order-2"
              onClick={async () => {
                await deleteAccount(from, account.id);
                setAddSuccess(!addSuccess)
                setConfirm({ title: "", description: "" })
              }}
            >Delete
              Account</button>
            <button className="block w-full px-4 py-3 mt-4 text-sm font-semibold bg-gray-200 rounded-lg md:inline-block md:w-auto md:py-2 md:mt-0 md:order-1"
              onClick={() => {
                setConfirm({ title: "", description: "" })
              }}
            >Cancel</button>
          </div>
        </div>
      </div>
    </div>}

    <div
      className="bg-[#f8f8f8] text-[#757575] flex rounded-[10px] items-center w-full h-[64px] min-h-[64px] text-[14px] font-medium font-MontserratSemiBold px-[5px] md:px-[10px]"
      style={{ transition: 'all .1s ease-in' }}
    >
      <div className="w-[60%] flex items-center whitespace-nowrap overflow-hidden text-ellipsis justify-start md:pl-5">
        <div className="w-[40px] h-[40px] mr-[10px] relative">
          <img alt="click" className="h-[40px] w-[40px] rounded-full" src={account?.avatar || "/icons/default_user.png"} onClick={async () => {
            await updateUserProfilePicUrl(account, from)
            setAddSuccess(!addSuccess)
          }} />
        </div>
        <div className="font-normal text-[12px] md:text-base text-black whitespace-nowrap overflow-hidden text-ellipsis">
          @{account?.account}
        </div>
      </div>
      <div className="w-[35%] md:w-[15%] flex items-center justify-end text-[#757575] text-[12px] md:text-base font-normal">
        {numFormatter(account?.followers)}
      </div>
      <div className="w-[21%] hidden md:flex items-center justify-end text-[12px]">
        {countDays(account?.created_at)}
      </div>
      <div className="w-[4%] md:w-[4%] ml-2 md:ml-0 flex items-center justify-end">
        <FaTrash className="cursor-pointer" onClick={async () => {
          setConfirm({ title: "Delete account", description: `Do you want to remove ${account.account}?` })
        }} />
      </div>
    </div>
  </>)
}

const TargetingCompt = ({ user, setMobileAdd }) => {
  const userId = user?.user_id
  const pageProp = { id: 1, title: "Targeting", addDescription: 'Set up your targeting by adding relevant Usernames and Hashtags.' }
  const [targetingAccounts, setTargetingAccounts] = useState([]);
  const [addSuccess, setAddSuccess] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  const [followerMinValue, setFollowerMinValue] = useState(1);
  const [followerMaxValue, setFollowerMaxValue] = useState(20000);
  const [followingMinValue, setFollowingMinValue] = useState(1);
  const [followingMaxValue, setFollowingMaxValue] = useState(10000);
  const [mediaMinValue, setMediaMinValue] = useState(1);
  const [mediaMaxValue, setMediaMaxValue] = useState(1000);
  const [margic, setMargic] = useState(true);
  const [privacy, setPrivacy] = useState('All');
  const [gender, setGender] = useState('All');
  const [lang, setLang] = useState('All');

  useEffect(() => {
    const getTargetingAccounts = async () => {
      if (!user || !user?.user_id) return;
      const { data, error } = await supabase
        .from("targeting")
        .select()
        .eq(user?.first_account ? "user_id" : "main_user_username", user?.first_account ? user?.user_id : user?.username)
        .eq(user?.first_account ? "main_user_username" : "", user?.first_account ? 'nil' : '')
        .order('id', { ascending: false });

      if (error) return console.log(error);

      // console.log(data);
      setTargetingAccounts(data);
    };

    getTargetingAccounts();
  }, [user, addSuccess]);

  useEffect(() => {
    if (user) {
      setFollowerMinValue(user?.targetingFilter?.followersMin);
      setFollowerMaxValue(user?.targetingFilter?.followersMax);
      setFollowingMinValue(user?.targetingFilter?.followingMin);
      setFollowingMaxValue(user?.targetingFilter?.followingMax);
      setMediaMinValue(user?.targetingFilter?.mediaMin);
      setMediaMaxValue(user?.targetingFilter?.mediaMax);

      setMargic(user?.targetingFilter?.margicFilter || true);
      setPrivacy(user?.targetingFilter?.privacy || 'All');
      setGender(user?.targetingFilter?.gender || 'All');
      setLang(user?.targetingFilter?.lang || 'All');
    }
  }, [user])

  return (<>
    <div>
      <div>
        <div className="hidden lg:flex justify-between items-center rounded-[10px] h-[84px] px-4 mb-10"
          style={{
            boxShadow: '0 0 3px #00000040',
          }}
        >
          <div className="flex items-center">
            <div className="bg-[#f8f8f8] font-bold font-MontserratBold text-[26px] flex items-center relatve h-[60px] rounded-[10px] px-6">
              Targeting
              <span className="bg-[#23df85] text-white rounded-[10px] h-9 leading-9 px-[10px] ml-[12px]">
                {targetingAccounts.length}
              </span>
            </div>

            <span className="ml-[8px] cursor-pointer group relative">
              <div className="flex items-center">
                <span
                  className="w-[20px] h-[20px] cursor-pointer fill-[#c4c4c4] group-hover:fill-[orange]"
                  style={{
                    transition: 'all .1s ease-in',
                  }}
                >
                  <svg
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M10 0.625C4.8225 0.625 0.625 4.8225 0.625 10C0.625 15.1775 4.8225 19.375 10 19.375C15.1775 19.375 19.375 15.1775 19.375 10C19.375 4.8225 15.1775 0.625 10 0.625ZM11.5625 16.1719H8.4375V8.67188H11.5625V16.1719ZM10 6.95312C9.5856 6.95312 9.18817 6.78851 8.89515 6.49548C8.60212 6.20245 8.4375 5.80503 8.4375 5.39062C8.4375 4.97622 8.60212 4.5788 8.89515 4.28577C9.18817 3.99275 9.5856 3.82812 10 3.82812C10.4144 3.82812 10.8118 3.99275 11.1049 4.28577C11.3979 4.5788 11.5625 4.97622 11.5625 5.39062C11.5625 5.80503 11.3979 6.20245 11.1049 6.49548C10.8118 6.78851 10.4144 6.95312 10 6.95312Z" />
                  </svg>
                  <span className="font-medium leading-5 opacity-0 font-MontserratSemiBold tooltiptext group-hover:opacity-100 group-hover:visible" style={{
                    transition: 'all .5s ease-in-out',
                  }}>Once you've added your targets, you can monitor their progress and make modifications, as all of them will be displayed here. To achieve maximum outcomes, aim to achieve a follow-back rate of 15% or higher for all targets.</span>
                </span>
              </div>
            </span>
          </div>

          <button className="bg-[#1b89ff] text-white font-bold font-MontserratBold text-[12px] lg:text-[16px] flex items-center px-6 rounded-[10px] h-[52px] min-h-[52px] border-none cursor-pointer" onClick={() => setFilterModal(true)}>
            Targeting Filters
            <img alt="" className="ml-2" src="/ic_filters.svg" />
          </button>
        </div>

        <div className="lg:hidden mt-[30px] mb-[12px]">
          <div className="flex items-center justify-center gap-[8px]">
            <img alt="" src="/ic_targeting.svg" className="bg-[#23df85] p-[8px] rounded-[8px]" />
            <h3 className="text-[24px] font-bold font-MontserratBold text-black"> Targeting </h3>
            <span className="ml-[8px] cursor-pointer group relative">
              <div className="flex items-center">
                <span
                  className="w-[20px] h-[20px] cursor-pointer fill-[#c4c4c4] group-hover:fill-[orange]"
                  style={{
                    transition: 'all .1s ease-in',
                  }}
                >
                  <svg
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M10 0.625C4.8225 0.625 0.625 4.8225 0.625 10C0.625 15.1775 4.8225 19.375 10 19.375C15.1775 19.375 19.375 15.1775 19.375 10C19.375 4.8225 15.1775 0.625 10 0.625ZM11.5625 16.1719H8.4375V8.67188H11.5625V16.1719ZM10 6.95312C9.5856 6.95312 9.18817 6.78851 8.89515 6.49548C8.60212 6.20245 8.4375 5.80503 8.4375 5.39062C8.4375 4.97622 8.60212 4.5788 8.89515 4.28577C9.18817 3.99275 9.5856 3.82812 10 3.82812C10.4144 3.82812 10.8118 3.99275 11.1049 4.28577C11.3979 4.5788 11.5625 4.97622 11.5625 5.39062C11.5625 5.80503 11.3979 6.20245 11.1049 6.49548C10.8118 6.78851 10.4144 6.95312 10 6.95312Z" />
                  </svg>
                  <span className="font-medium leading-5 opacity-0 font-MontserratSemiBold tooltiptext group-hover:opacity-100 group-hover:visible" style={{
                    transition: 'all .5s ease-in-out',
                  }}>Once you've added your targets, you can monitor their progress and make modifications, as all of them will be displayed here. To achieve maximum outcomes, aim to achieve a follow-back rate of 15% or higher for all targets.</span>
                </span>
              </div>
            </span>
          </div>
          <div className="mt-[30px] flex items-center">
            <div className="w-full flex justify-center bg-[#f8f8f8]">
              <div className="font-bold font-MontserratBold text-[16px] flex items-center relatve h-[60px] rounded-[10px] px-6">
                Targeting
                <span className="bg-[#23df85] text-white rounded-[10px] h-9 leading-9 px-[10px] ml-[12px]">
                  {targetingAccounts.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center mt-0 lg:m-10 lg:flex-row">
        <div className="w-full grow lg:w-auto">
          <div className="text-[#757575] flex items-center justify-between w-full h-[50px] text-[14px] font-medium font-MontserratSemiBold md:pr-[30px]">
            <div className="w-[60%] flex items-center justify-start md:pl-5">
              <span className="ml-[60px]">Account</span>
            </div>
            <div className="w-[35%] md:w-[15%] flex items-center justify-end">
              Followers
            </div>
            <div className="w-[20%] hidden md:flex items-center justify-end">Added</div>
            <div className="w-[4%] md:w-[5%]"></div>
          </div>

          <div className="max-h-[380px] lg:h-[380px] overflow-y-auto flex flex-col gap-[11px] lg:pr-4">
            {targetingAccounts.map(account => {
              return <OtherUsers
                key={account?.id}
                account={account}
                addSuccess={addSuccess}
                setAddSuccess={setAddSuccess}
                from={'targeting'}
              />
            })}
          </div>
        </div>

        <div className="flex items-center w-full gap-2 mt-4 lg:hidden">
          <button className={`bg-[#23df85] text-white font-medium text-base font-MontserratSemiBold w-full rounded-[10px] h-[50px] max-h-[50px] border-none cursor-pointer`}
            onClick={() => setMobileAdd({ show: true, pageProp })}
          >
            Add New Source
          </button>
          <button className="bg-[#1b89ff] w-fit text-white font-bold font-MontserratBold text-[12px] lg:text-[16px] flex items-center px-6 rounded-[10px] h-[50px] min-h-[50px] border-none cursor-pointer" onClick={() => setFilterModal(true)}>
            <img alt="" className="" src="/ic_filters.svg" />
          </button>
        </div>

        <div className="hidden lg:block">
          <AddOthers
            pageProp={pageProp}
            userId={userId}
            user={user}
            addSuccess={addSuccess}
            setAddSuccess={setAddSuccess}
          />
        </div>
      </div>
    </div>

    <TargetingFilterModal
      show={filterModal}
      onHide={() => setFilterModal(false)}
      setFilterModal={setFilterModal}
      filtermodal={filterModal}
      user={user}
      user_id={userId}
      followerMinValued={followerMinValue}
      followerMaxValued={followerMaxValue}
      followingMinValued={followingMinValue}
      followingMaxValued={followingMaxValue}
      mediaMinValued={mediaMinValue}
      mediaMaxValued={mediaMaxValue}
      margicd={margic}
      privacyd={privacy}
      genderd={gender}
      langd={lang}
    />
  </>)
}

const WhiteListCompt = ({ user, userId, setMobileAdd }) => {
  const [total, setTotal] = useState({ whitelist: 0, blacklist: 0 })
  const [pageProp, setPageProp] = useState({ id: 2, title: "Whitelist", addDescription: `Add users you wish to continue following that were followed by ${SITENAME}. We will never unfollow anyone you manually followed.` })
  const [showPageModal, setShowPageModal] = useState(false)
  const [targetingAccounts, setTargetingAccounts] = useState([]);
  const [addSuccess, setAddSuccess] = useState(false);

  useEffect(() => {
    const getTargetingAccounts = async () => {
      if (!userId) return;
      const whiteList = await supabase
        .from('whitelist')
        .select()
        // .eq("user_id", userId)
        .eq(user?.first_account ? "user_id" : "main_user_username", user?.first_account ? user?.user_id : user?.username)
        .eq(user?.first_account ? "main_user_username" : "", user?.first_account ? 'nil' : '')
        .order('id', { ascending: false });
      const blackList = await supabase
        .from('blacklist')
        .select()
        // .eq("user_id", userId)
        .eq(user?.first_account ? "user_id" : "main_user_username", user?.first_account ? user?.user_id : user?.username)
        .eq(user?.first_account ? "main_user_username" : "", user?.first_account ? 'nil' : '')
        .order('id', { ascending: false });
      setTotal({ whitelist: whiteList?.data?.length, blacklist: blackList?.data?.length })

      pageProp?.title === 'Whitelist' ? setTargetingAccounts(whiteList.data) : setTargetingAccounts(blackList.data);
      if (blackList.error) console.log(blackList.error);
      if (whiteList.error) console.log(whiteList.error);
    };

    getTargetingAccounts();
  }, [user, userId, addSuccess, pageProp]);

  return (<>
    <div>
      <div>
        <div className="hidden lg:flex justify-between items-center rounded-[10px] h-[84px] px-4 mb-10"
          style={{
            boxShadow: '0 0 3px #00000040',
          }}
        >
          <div className="flex items-center">
            <div className="relative">
              <div className="bg-[#f8f8f8] font-bold font-MontserratBold text-[26px] flex items-center h-[60px] rounded-[10px] px-6 cursor-pointer relative z-[2]"
                onClick={() => setShowPageModal(true)}
              >
                {pageProp.title}
                <span className={`${pageProp.title === "Whitelist" ? "bg-[#1b89ff]" : "bg-[#000]"} text-white rounded-[10px] h-9 leading-9 px-[10px] ml-[12px]`}>
                  {total[(pageProp.title).toLowerCase()]}
                </span>
                <FaCaretDown className="w-[30px] h-[26px] ml-2" color="#C4C4C4" />
              </div>
              <div className={`${showPageModal ? 'opacity-100 z-10' : 'opacity-0 -z-10'} absolute top-0 left-0 w-full bg-white rounded-[10px]`} style={{
                boxShadow: "0 0 3px #00000040",
                transform: 'translteY(8px)',
                transition: 'opacity .15s ease-in',
              }}>
                <div className="font-bold font-MontserratBold text-[26px] flex items-center cursor-pointer h-[60px] rounded-[10px] px-6 hover:bg-[#f8f8f8]"
                  onClick={() => {
                    setPageProp({ id: 2, title: "Whitelist", addDescription: `Add users you wish to continue followingthat were followed by ${SITENAME}. We will never unfollow anyone you manually followed.` })
                    setShowPageModal(false)
                  }}>
                  Whitelist
                  <span className="bg-[#1b89ff] text-white rounded-[10px] h-9 leading-9 px-[10px] ml-[12px]">
                    {total?.whitelist}
                  </span>
                  <FaCaretDown className="w-[30px] h-[26px] ml-2" color="#C4C4C4" />
                </div>
                <div className="font-bold font-MontserratBold text-[26px] flex items-center cursor-pointer h-[60px] rounded-[10px] px-6 hover:bg-[#f8f8f8]"
                  onClick={() => {
                    setPageProp({
                      id: 3, title: "Blacklist", addDescription: "Blacklist users that you would not like to interact with and we won't follow them when growing your account."
                    })
                    setShowPageModal(false)
                  }}>
                  Blacklist
                  <span className="bg-[#000] text-white rounded-[10px] h-9 leading-9 px-[10px] ml-[12px]">
                    {total?.blacklist}
                  </span>
                </div>
              </div>
            </div>

            <span className="ml-[8px] cursor-pointer group relative">
              <div className="flex items-center">
                <span
                  className="w-[20px] h-[20px] cursor-pointer fill-[#c4c4c4] group-hover:fill-[orange]"
                  style={{
                    transition: 'all .1s ease-in',
                  }}
                >
                  <svg
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M10 0.625C4.8225 0.625 0.625 4.8225 0.625 10C0.625 15.1775 4.8225 19.375 10 19.375C15.1775 19.375 19.375 15.1775 19.375 10C19.375 4.8225 15.1775 0.625 10 0.625ZM11.5625 16.1719H8.4375V8.67188H11.5625V16.1719ZM10 6.95312C9.5856 6.95312 9.18817 6.78851 8.89515 6.49548C8.60212 6.20245 8.4375 5.80503 8.4375 5.39062C8.4375 4.97622 8.60212 4.5788 8.89515 4.28577C9.18817 3.99275 9.5856 3.82812 10 3.82812C10.4144 3.82812 10.8118 3.99275 11.1049 4.28577C11.3979 4.5788 11.5625 4.97622 11.5625 5.39062C11.5625 5.80503 11.3979 6.20245 11.1049 6.49548C10.8118 6.78851 10.4144 6.95312 10 6.95312Z" />
                  </svg>
                  <span className="font-medium leading-5 opacity-0 font-MontserratSemiBold tooltiptext group-hover:opacity-100 group-hover:visible" style={{
                    transition: 'all .5s ease-in-out',
                  }}>{pageProp.title === "Whitelist" ? "If you wish to continue following a user that we automatically followed for you, add them here and we won’t unfollow them. Remember, we will never unfollow anyone you manually followed before or after using our service - this only applies to users we followed for you." : "Add accounts that you never want us to follow. Our system will ensure to avoid interacting with every user you blacklist."}</span>
                </span>
              </div>
            </span>
          </div>
        </div>

        <div className="lg:hidden mt-[30px] mb-[12px]">
          <div className="flex items-center justify-center gap-[8px]">
            <img alt="" src={`/ic_${(pageProp.title).toLowerCase()}.svg`} className="rounded-[8px]" />
            <h3 className="text-[24px] font-bold font-MontserratBold text-black"> {pageProp.title} </h3>
            <span className="ml-[8px] cursor-pointer group relative">
              <div className="flex items-center">
                <span
                  className="w-[20px] h-[20px] cursor-pointer fill-[#c4c4c4] group-hover:fill-[orange]"
                  style={{
                    transition: 'all .1s ease-in',
                  }}
                >
                  <svg
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M10 0.625C4.8225 0.625 0.625 4.8225 0.625 10C0.625 15.1775 4.8225 19.375 10 19.375C15.1775 19.375 19.375 15.1775 19.375 10C19.375 4.8225 15.1775 0.625 10 0.625ZM11.5625 16.1719H8.4375V8.67188H11.5625V16.1719ZM10 6.95312C9.5856 6.95312 9.18817 6.78851 8.89515 6.49548C8.60212 6.20245 8.4375 5.80503 8.4375 5.39062C8.4375 4.97622 8.60212 4.5788 8.89515 4.28577C9.18817 3.99275 9.5856 3.82812 10 3.82812C10.4144 3.82812 10.8118 3.99275 11.1049 4.28577C11.3979 4.5788 11.5625 4.97622 11.5625 5.39062C11.5625 5.80503 11.3979 6.20245 11.1049 6.49548C10.8118 6.78851 10.4144 6.95312 10 6.95312Z" />
                  </svg>
                  <span className="font-medium leading-5 opacity-0 font-MontserratSemiBold tooltiptext group-hover:opacity-100 group-hover:visible" style={{
                    transition: 'all .5s ease-in-out',
                  }}>{pageProp.title === "Whitelist" ? "If you wish to continue following a user that we automatically followed for you, add them here and we won’t unfollow them. Remember, we will never unfollow anyone you manually followed before or after using our service - this only applies to users we followed for you." : "Add accounts that you never want us to follow. Our system will ensure to avoid interacting with every user you blacklist."}</span>
                </span>
              </div>
            </span>
          </div>

          <div className="mt-[30px] flex items-center">
            <div className={`${pageProp.title === "Whitelist" && "bg-[#f8f8f8]"} w-full flex justify-center cursor-pointer`} onClick={() => setPageProp({ ...pageProp, title: "Whitelist" })}>
              <div className="font-bold font-MontserratBold text-[16px] flex items-center relatve h-[60px] rounded-[10px] px-2 md:px-6">
                Whitelist
                <span className="bg-[#23df85] text-white rounded-[10px] h-9 leading-9 px-[10px] ml-[12px]">
                  {total.whitelist}
                </span>
              </div>
            </div>
            <div className={`${pageProp.title === "Blacklist" && "bg-[#f8f8f8]"} w-full flex justify-center cursor-pointer`} onClick={() => setPageProp({ ...pageProp, title: "Blacklist" })}>
              <div className="font-bold font-MontserratBold text-[16px] flex items-center relatve h-[60px] rounded-[10px] px-2 md:px-6">
                Blacklist
                <span className="bg-[#23df85] text-white rounded-[10px] h-9 leading-9 px-[10px] ml-[12px]">
                  {total.blacklist}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center mt-0 lg:m-10 lg:flex-row">
        <div className="w-full grow lg:w-auto">
          <div className="text-[#757575] flex items-center justify-between w-full h-[50px] text-[14px] font-medium font-MontserratSemiBold md:pr-[30px]">
            <div className="w-[60%] flex items-center justify-start md:pl-5">
              <span className="ml-[60px]">Account</span>
            </div>
            <div className="w-[35%] md:w-[15%] flex items-center justify-end">
              Followers
            </div>
            <div className="w-[20%] hidden md:flex items-center justify-end">Added</div>
            <div className="w-[4%] md:w-[5%]"></div>
          </div>

          <div className="max-h-[380px] lg:h-[380px] overflow-y-auto flex flex-col gap-[11px] lg:pr-4">
            {targetingAccounts.map(account => {
              return <OtherUsers
                key={account?.id}
                account={account}
                addSuccess={addSuccess}
                setAddSuccess={setAddSuccess}
                from={(pageProp.title).toLowerCase()}
              />
            })}
          </div>
        </div>

        <div className="flex items-center w-full gap-2 my-4 lg:hidden">
          <button className={`bg-[#23df85] text-white font-medium text-base font-MontserratSemiBold w-full rounded-[10px] h-[50px] max-h-[50px] border-none cursor-pointer`}
            onClick={() => setMobileAdd({ show: true, pageProp })}
          >
            {pageProp.title} Account
          </button>
        </div>

        <div className="hidden lg:block">
          <AddOthers
            pageProp={pageProp}
            userId={userId}
            user={user}
            addSuccess={addSuccess}
            setAddSuccess={setAddSuccess}
          />
        </div>
      </div>
    </div>
  </>)
}