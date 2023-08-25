import { useEffect, useState } from 'react';
import Modal from "react-bootstrap/Modal";
import { IoClose } from 'react-icons/io5';
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai"
import flashImg from "../images/flash.svg"
import "../../src/modalsettings.css"
import { supabase } from '../supabaseClient';
import { FaLock } from 'react-icons/fa';
import axios from 'axios';

axios.defaults.headers.post['accept'] = 'application/json';
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
axios.defaults.headers.post['x-access-key'] = 'e1GKaU1YPsJNZlY1qTyj9i4J4yTIM7r1';
axios.defaults.headers.post['x-lama-reqid'] = 'e1GKaU1YPsJNZlY1qTyj9i4J4yTIM7r1';

const SettingsModal = (props) => {
  const { modalIsOpen, setIsOpen, user, setRefreshUser, u } = props

  const [instagramPassword, setInstagramPassword] = useState("");
  const [mode, setMode] = useState('auto');
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggleValue = (newValue) => {
    setMode(newValue);
  }

  useEffect(() => {
    setMode(user?.userMode);
    setInstagramPassword(user?.instagramPassword);
  }, [user])

  const handleSave = async () => {
    setLoading(true)
    var d = { instagramPassword, userMode: mode }
    if (user?.instagramPassword !== instagramPassword && u !== "admin") {
      // try {
      //   fetch("https://api.lamadava.com/s1/auth/login", {
      //     body: `username=${user?.username}&password=${instagramPassword}&verification_code=&proxy=&locale=&timezone=&user_agent=`,
      //     headers: {
      //       Accept: "application/json",
      //       "Content-Type": "application/x-www-form-urlencoded",
      //       // 'x-access-key': 'e1GKaU1YPsJNZlY1qTyj9i4J4yTIM7r1',
      //     },
      //     method: "POST"
      //   }).then(res => res.json()).then((data) => {
      //     console.log(data);          
      //   })
      // } catch (error) {
      //   console.log(error);
      // }
      d = { ...d, status: 'new' }
    }

    const { error } = await supabase
      .from('users')
      .update(d)
      .eq("user_id", user?.user_id).eq("username", user?.username);
    error && console.log(error);
    setLoading(false)
    if (u === 'admin') {
      setIsOpen(!modalIsOpen);
      return;
    }

    setLoading(false)
    // window.location.reload()
    setIsOpen(!modalIsOpen);
    setRefreshUser(true);
  }

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      // dialogClassName="modal-90w"
      // className="modal-90w"
      size="xl"
      fullscreen={"xl-down"}
      aria-labelledby="example-custom-modal-styling-title"
      centered
    >
      <div className="relative h-screen xl:h-full overflow-auto">
        <div className="modal_nav absolute top-2 right-2">
          <IoClose
            className="modal_close_icon text-[30px]"
            onClick={() => {
              setIsOpen(!modalIsOpen);
            }}
          />
        </div>

        <div className="flex flex-col xl:flex-row justify-between gap-2 p-7 md:p-10">
          <div className="flex flex-col justify-center md:justify-start items-center md:mt-[39px]">
            <div className="relative w-[100px] h-[100px] md:w-[140px] md:h-[140px] rounded-full">
              <img className='h-full w-full mb-1 rounded-full' src={user?.profile_pic_url} alt="" />
              <div className="w-5 h-5 rounded-full bg-green-600 absolute bottom-[10px] right-[10px]"></div>
            </div>
            <h2 className='font-bold text-[#757575] text-[24px] my-1 font-MontserratBold'>{user?.full_name}</h2>
            <h2 className='font-bold text-[#1b89ff] text-[20px] my-1 font-MontserratBold'>@{user?.username}</h2>
            <div className="relative w-full md:w-[403px] flex justify-center mt-4">
              <div className="flex items-center justify-center gap-2 rounded-[10px] py-4 px-4 text-[1.25rem] border shadow-[inset_0_0px_2px_rgba(0,0,0,0.4)] ">
                <input
                  className='w-full md:w-80 placeholder:text-center text-center outline-none'
                  // className='bg-white text-center rounded-[10px] shadow-md w-full placeholder:text-center py-3 outline-none'
                  type={showPassword ? "text" : "password"}
                  placeholder='Instagram Password'
                  autoComplete='new-password'
                  value={instagramPassword}
                  onChange={(e) => {
                    setInstagramPassword(e.target.value)
                  }}
                />
                {showPassword ? <AiOutlineEyeInvisible onClick={() => setShowPassword(!showPassword)} className="cursor-pointer" /> :
                  <AiOutlineEye onClick={() => setShowPassword(!showPassword)} className="cursor-pointer" />}
              </div>
            </div>

            <p className="font-normal text-xs md:text-sm font-MontserratLight opacity-90 mt-1">
              <span className="">Your password is 100% protected and encrypted.</span> <FaLock className='inline' />
            </p>
          </div>

          <div className="w-full">
            <div className="flex flex-col gap-5">
              <div className="xl:mb-[10px] mt-4 xl:mt-0 text-[18px] xl:font-bold xl:font-MontserratBold">Interaction settings</div>

              <div className={`${mode === "auto" ? "border-[4px] border-[#1b89ff] h-[230px] md:h-[110px] lg:h-[200px]" : "h-[52px]"} overflow-hidden py-[14px] md:py-5 px-[14px] md:px-10 cursor-pointer shadow-[0_0_3px_#00000040] rounded-[10px] flex items-center gap-2 md:gap-5`} style={{
                transition: 'all .3s ease-in,border .1s ease-in'
              }} onClick={() => toggleValue("auto")}>
                <img className={`${mode === "auto" ? "w-[60px] h-[60px] lg:w-[100px] lg:h-[100px]" : "w-[20px] h-[20px] lg:w-[30px] lg:h-[30px]"}`} src={flashImg} alt="" style={{
                  transition: "all .3s linear"
                }} />
                <div className="">
                  <h3 className={`${mode === "auto" ? "text-[18px] lg:text-[24px]" : "text-[16px] lg:text-[18px]"} font-bold font-MontserratBold`}>Auto Mode</h3>
                  <p className={`${mode === "auto" ? "opacity-100" : "opacity-0 max-h-0"} text-[12px] lg:text-base font-MontserratRegular`} style={{
                    transition: "all .3s linear .2s"
                  }}>
                    This setting will follow and unfollow relevant users using the targets you have selected. We will automatically unfollow users after 3 days to keep your following number low and healthy. We will never unfollow anyone that you manually followed yourself.
                  </p>
                </div>
              </div>

              <div className={`${mode === "follow" ? "border-[4px] border-[#1b89ff] h-[270px] sm:h-[200px] md:h-[110px] lg:h-[200px]" : "h-[52px]"} overflow-hidden py-[14px] md:py-5 px-[14px] md:px-10 cursor-pointer shadow-[0_0_3px_#00000040] rounded-[10px] flex items-center gap-2 md:gap-5`} style={{
                transition: 'all .3s ease-in,border .1s ease-in'
              }} onClick={() => toggleValue("follow")}>
                <span className={`${mode === "follow" ? "min-w-[40px] lg:min-w-[100px] h-[40px] lg:h-[100px]" : "min-w-[20px] lg:min-w-[30px] h-[20px] lg:h-[30px]"} fill-black font-[none] ng-tns-c112-40`} style={{
                  transition: "all .3s linear"
                }}>
                  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M10.5985 10.0375C10.9767 9.83438 11.4095 9.71875 11.8704 9.71875H11.872C11.9188 9.71875 11.9407 9.6625 11.9064 9.63125C11.427 9.20106 10.8794 8.85361 10.286 8.60312C10.2798 8.6 10.2735 8.59844 10.2673 8.59531C11.2376 7.89062 11.8688 6.74531 11.8688 5.45312C11.8688 3.3125 10.1376 1.57812 8.00166 1.57812C5.86572 1.57812 4.13604 3.3125 4.13604 5.45312C4.13604 6.74531 4.76729 7.89062 5.73916 8.59531C5.73291 8.59844 5.72666 8.6 5.72041 8.60312C5.02198 8.89844 4.39541 9.32188 3.85635 9.8625C3.3204 10.3975 2.89372 11.0317 2.6001 11.7297C2.31121 12.4132 2.15531 13.1456 2.14073 13.8875C2.14031 13.9042 2.14323 13.9208 2.14933 13.9363C2.15542 13.9518 2.16456 13.966 2.17621 13.9779C2.18786 13.9899 2.20178 13.9993 2.21716 14.0058C2.23253 14.0123 2.24904 14.0156 2.26573 14.0156H3.20166C3.26885 14.0156 3.3251 13.9609 3.32666 13.8938C3.35791 12.6875 3.84073 11.5578 4.69541 10.7016C5.57823 9.81563 6.75323 9.32812 8.00323 9.32812C8.88916 9.32812 9.73916 9.57344 10.472 10.0328C10.4908 10.0446 10.5124 10.0513 10.5346 10.0521C10.5568 10.0529 10.5789 10.0479 10.5985 10.0375ZM8.00323 8.14062C7.2876 8.14062 6.61416 7.86094 6.10635 7.35313C5.8565 7.10392 5.65842 6.80774 5.52354 6.48165C5.38865 6.15557 5.31962 5.80601 5.32041 5.45312C5.32041 4.73594 5.6001 4.06094 6.10635 3.55312C6.6126 3.04531 7.28604 2.76562 8.00323 2.76562C8.72041 2.76562 9.39229 3.04531 9.9001 3.55312C10.15 3.80233 10.348 4.09851 10.4829 4.4246C10.6178 4.75068 10.6868 5.10024 10.686 5.45312C10.686 6.17031 10.4064 6.84531 9.9001 7.35313C9.39229 7.86094 8.71885 8.14062 8.00323 8.14062ZM13.7501 11.8594H12.4376V10.5469C12.4376 10.4781 12.3814 10.4219 12.3126 10.4219H11.4376C11.3688 10.4219 11.3126 10.4781 11.3126 10.5469V11.8594H10.0001C9.93135 11.8594 9.8751 11.9156 9.8751 11.9844V12.8594C9.8751 12.9281 9.93135 12.9844 10.0001 12.9844H11.3126V14.2969C11.3126 14.3656 11.3688 14.4219 11.4376 14.4219H12.3126C12.3814 14.4219 12.4376 14.3656 12.4376 14.2969V12.9844H13.7501C13.8189 12.9844 13.8751 12.9281 13.8751 12.8594V11.9844C13.8751 11.9156 13.8189 11.8594 13.7501 11.8594Z"></path>
                  </svg>
                </span>
                <div className="">
                  <h3 className={`${mode === "follow" ? "text-[18px] lg:text-[24px]" : "text-base lg:text-[18px]"} font-bold font-MontserratBold`}>Follow Mode</h3>
                  <p className={`${mode === "follow" ? "opacity-100" : "opacity-0 max-h-0"} text-[12px] lg:text-base xl:text-[14px] font-MontserratRegular`} style={{
                    transition: "all .3s linear .2s"
                  }}>
                    In ‘Follow Mode,’ your account will continue following
                    users until it reaches Instagram's maximum ‘Following’
                    limit (which is 7500). From there, interactions on our end
                    will stop and you will have to manually change your
                    interaction settings to continue experiencing results (to
                    either ‘Recommended’ or ‘Unfollow Mode’)
                  </p>
                </div>
              </div>

              <div className={`${mode === "unfollow" ? "border-[4px] border-[#1b89ff] h-[230px] md:h-[110px] lg:h-[200px]" : "h-[52px]"} overflow-hidden py-[14px] md:py-5 px-[14px] md:px-10 cursor-pointer shadow-[0_0_3px_#00000040] rounded-[10px] flex items-center gap-2 md:gap-5`} style={{
                transition: 'all .3s ease-in,border .1s ease-in'
              }} onClick={() => toggleValue("unfollow")}>
                <span className={`${mode === "unfollow" ? "min-w-[40px] lg:min-w-[100px] h-[40px] lg:h-[100px]" : "min-w-[20px] lg:min-w-[30px] h-[20px] lg:h-[30px]"} fill-black font-[none] ng-tns-c112-40`} style={{
                  transition: "all .3s linear"
                }}>
                  <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M10.5984 10.2406C10.9765 10.0375 11.4094 9.92188 11.8703 9.92188H11.8719C11.9187 9.92188 11.9406 9.86563 11.9062 9.83438C11.4269 9.40419 10.8793 9.05673 10.2859 8.80625C10.2797 8.80312 10.2734 8.80156 10.2672 8.79844C11.2375 8.09375 11.8687 6.94844 11.8687 5.65625C11.8687 3.51562 10.1375 1.78125 8.00154 1.78125C5.8656 1.78125 4.13592 3.51562 4.13592 5.65625C4.13592 6.94844 4.76717 8.09375 5.73904 8.79844C5.73279 8.80156 5.72654 8.80312 5.72029 8.80625C5.02185 9.10156 4.39529 9.525 3.85623 10.0656C3.32028 10.6006 2.89359 11.2348 2.59998 11.9328C2.31109 12.6163 2.15518 13.3487 2.1406 14.0906C2.14019 14.1073 2.14311 14.1239 2.14921 14.1394C2.1553 14.1549 2.16444 14.1691 2.17609 14.181C2.18774 14.193 2.20166 14.2025 2.21703 14.2089C2.23241 14.2154 2.24892 14.2188 2.2656 14.2188H3.20154C3.26873 14.2188 3.32498 14.1641 3.32654 14.0969C3.35779 12.8906 3.8406 11.7609 4.69529 10.9047C5.5781 10.0188 6.7531 9.53125 8.0031 9.53125C8.88904 9.53125 9.73904 9.77656 10.4719 10.2359C10.4907 10.2478 10.5123 10.2544 10.5345 10.2553C10.5567 10.2561 10.5788 10.251 10.5984 10.2406ZM8.0031 8.34375C7.28748 8.34375 6.61404 8.06406 6.10623 7.55625C5.85638 7.30705 5.6583 7.01087 5.52342 6.68478C5.38853 6.35869 5.31949 6.00914 5.32029 5.65625C5.32029 4.93906 5.59998 4.26406 6.10623 3.75625C6.61248 3.24844 7.28592 2.96875 8.0031 2.96875C8.72029 2.96875 9.39217 3.24844 9.89998 3.75625C10.1498 4.00545 10.3479 4.30163 10.4828 4.62772C10.6177 4.95381 10.6867 5.30336 10.6859 5.65625C10.6859 6.37344 10.4062 7.04844 9.89998 7.55625C9.39217 8.06406 8.71873 8.34375 8.0031 8.34375ZM13.75 12.0625H9.99998C9.93123 12.0625 9.87498 12.1187 9.87498 12.1875V13.0625C9.87498 13.1313 9.93123 13.1875 9.99998 13.1875H13.75C13.8187 13.1875 13.875 13.1313 13.875 13.0625V12.1875C13.875 12.1187 13.8187 12.0625 13.75 12.0625Z"></path>
                  </svg>
                </span>
                <div className="">
                  <h3 className={`${mode === "unfollow" ? "text-[18px] lg:text-[24px]" : "text-base lg:text-[18px]"} font-bold font-MontserratBold`}>Unfollow Mode</h3>
                  <p className={`${mode === "unfollow" ? "opacity-100" : "opacity-0 max-h-0"} text-[12px] lg:text-base font-MontserratRegular`} style={{
                    transition: "all .3s linear .2s"
                  }}>
                    In ‘Unfollow Mode,’ your account will unfollow all of the
                    users we automatically followed for you. This will not
                    unfollow users that you personally followed, before or
                    after joining us. If you want to unfollow every account,
                    please contact your account manager.
                  </p>
                </div>
              </div>

              <div className={`${mode === "off" ? "border-[4px] border-[#1b89ff] h-[230px] md:h-[110px] lg:h-[200px]" : "h-[52px]"} overflow-hidden py-[14px] md:py-5 px-[14px] md:px-10 cursor-pointer shadow-[0_0_3px_#00000040] rounded-[10px] flex items-center gap-2 md:gap-5`} style={{
                transition: 'all .3s ease-in,border .1s ease-in'
              }} onClick={() => toggleValue("off")}>
                <span className={`${mode === "off" ? "min-w-[40px] lg:min-w-[100px] h-[40px] lg:h-[100px]" : "min-w-[20px] lg:min-w-[30px] h-[20px] lg:h-[30px]"} fill-black font-[none] ng-tns-c112-40`} style={{
                  transition: "all .3s linear"
                }}>
                  <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M31.25 4.22656C36.1719 7.74219 39.375 13.4922 39.375 20C39.375 30.6875 30.7188 39.3516 20.0391 39.375C9.37501 39.3984 0.640639 30.7031 0.625014 20.0312C0.617202 13.5234 3.82033 7.75781 8.73439 4.23437C9.64845 3.58594 10.9219 3.85937 11.4688 4.83594L12.7031 7.03125C13.1641 7.85156 12.9453 8.89062 12.1875 9.45312C8.94533 11.8594 6.87501 15.6719 6.87501 19.9922C6.8672 27.2031 12.6953 33.125 20 33.125C27.1563 33.125 33.1719 27.3281 33.125 19.9141C33.1016 15.8672 31.1953 11.9609 27.8047 9.44531C27.0469 8.88281 26.8359 7.84375 27.2969 7.03125L28.5313 4.83594C29.0781 3.86719 30.3438 3.57812 31.25 4.22656ZM23.125 20.625V1.875C23.125 0.835937 22.2891 0 21.25 0H18.75C17.711 0 16.875 0.835937 16.875 1.875V20.625C16.875 21.6641 17.711 22.5 18.75 22.5H21.25C22.2891 22.5 23.125 21.6641 23.125 20.625Z"></path>
                  </svg>
                </span>
                <div className="">
                  <h3 className={`${mode === "off" ? "text-[18px] lg:text-[24px]" : "text-base lg:text-[18px]"} font-bold font-MontserratBold`}>Off Mode</h3>
                  <p className={`${mode === "off" ? "opacity-100" : "opacity-0 max-h-0"} text-[12px] lg:text-base font-MontserratRegular`} style={{
                    transition: "all .3s linear .2s"
                  }}>
                    In ‘off Mode,’ your account will off all of the
                    users we automatically followed for you. This will not
                    off users that you personally followed, before or
                    after joining us. If you want to off every account,
                    please contact your account manager.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center my-4">
              <button className='rounded-[10px] mx-auto font-MontserratSemiBold font-bold text-base py-4 w-full xl:w-[300px] h-[72px] bg-[#1b89ff] text-white' onClick={(e) => {
                e.preventDefault()
                !loading && handleSave();
              }}>{loading ? 'Saving...' : 'Apply and Close'}</button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default SettingsModal
