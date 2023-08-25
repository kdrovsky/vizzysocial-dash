import React from "react";
// import { RxCaretRight } from "react-icons/rx"
// import CrispChat from "./CrispChat";
// import Nav from "./Nav";
// import SearchBox from "./search/SearchBox";
import OnboardingSearchBox from "./search/OnboardingSearchBox";
import { useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useState } from "react";
import { MdLogout } from "react-icons/md";
import { useClickOutside } from "react-click-outside-hook";
import { LOGO } from "../config";

export default function Search() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentUsername = urlParams.get("username");
  const [user, setUser] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [parentRef, isClickedOutside] = useClickOutside();

  useEffect(() => {
    if (isClickedOutside) {
      setShowMenu(false)
    };
  }, [isClickedOutside]);

  useEffect(() => {
    const getData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("users")
        .select()
        .eq("user_id", user.id);
      setUser(data?.[0]);
    };

    getData();
  }, []);

  // console.log(user);

  return (<>
    <div id="affiliateScript"></div>
    {/* <CrispChat /> */}

    <div className="text-[#757575] relative">
      <div className="max-w-[1600px] mx-auto">
        <div className="hidden lg:block absolute top-[14px] right-[14px] z-[1] cursor-pointer">
          <div className="flex items-center gap-3" onClick={() => {
            setShowMenu(!showMenu);
          }}>
            <span className=""> {user?.full_name} </span>
            <div className={`${showMenu && ' border-red-300'} border-2 rounded-full`}>
              <div className={`w-[32px] h-[32px] rounded-full bg-[#23DF85] text-white grid place-items-center`}>
                <span className="text-[22px] pointer-events-none select-none font-[400] uppercase">{user?.full_name && (user?.full_name)?.charAt(0)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden bg-white fixed top-0 left-0 z-[5] flex items-center justify-between w-full px-5 py-4 gap-2 font-[600] font-MontserratRegular shadow-[0_2px_4px_#00000026]" onClick={() => {
          showMenu && setShowMenu(false);
        }}>
          <div className="flex">
            <img alt="" className="w-[36px] h-[36px]" src={LOGO} />
          </div>
          <div className={`${showMenu && ' border-red-300'} border-2 rounded-full`}>
            <div className={`w-[32px] h-[32px] rounded-full bg-[#23DF85] text-white grid place-items-center cursor-pointer`} onClick={() => {
              setShowMenu(!showMenu);
            }}>
              <span className={`text-[22px] pointer-events-none select-none font-[400] uppercase`}>{user?.full_name && (user?.full_name)?.charAt(0)}</span>
            </div>
          </div>
        </div>

        <div className={`${!showMenu && 'opacity-0 pointer-events-none hidden'} absolute top-0 left-0 w-full h-screen z-10`}>
          <div className="absolute top-0 left-0 z-10 w-full h-screen cursor-pointer bg-black/0" onClick={() => {
            setShowMenu(!showMenu);
          }}></div>
          <div className={`${!showMenu && 'opacity-0 pointer-events-none hidden'} absolute top-0 lg:top-14 z-10 left-5 lg:left-[unset] right-5 bg-white w-[calc(100%-40px)] lg:w-[350px] lg:max-w-[400px] rounded-[10px] shadow-[0_5px_10px_#0a17530d] transition-all duration-150 ease-in`} ref={parentRef} tabIndex={0}>
            <div className="flex items-center gap-3 p-5">
              <div className="w-[50px] h-[50px] rounded-full bg-[#23DF85] text-white grid place-items-center">
                <span className="text-[22px] pointer-events-none select-none font-[400] uppercase">{user?.full_name && (user?.full_name)?.charAt(0)}</span>
              </div>
              <div className="">
                <div className="text-black font-bold font-MontserratSemiBold text-[14px]">{user?.full_name}</div>
                <div className="text-[12px]">{user?.email}</div>
              </div>
            </div>

            <div className="border-t border-[#f8f8f8] flex items-center gap-3 h-[53px] text-black px-5 cursor-pointer hover:bg-blue-gray-100" onClick={async () => {
              setShowMenu(!showMenu)
              await supabase.auth.signOut();
              window.onbeforeunload = function () {
                localStorage.clear();
              }
              window.location.pathname = "/login";
            }}>
              <MdLogout size={22} /> <span className="">Logout</span>
            </div>
          </div>
        </div>

        <OnboardingSearchBox user={user} currentUsername={currentUsername} />
      </div>
    </div>
  </>)
}
