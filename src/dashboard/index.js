/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react'
import { supabase, supabaseAdmin } from "../supabaseClient";
import { AiOutlineDashboard, AiOutlineSetting, AiOutlineSortAscending } from 'react-icons/ai'
import { BiLogOutCircle, BiUserCircle } from 'react-icons/bi'
import { FaTimes, FaTrash, FaUserCheck, FaUserClock, FaUserTimes } from 'react-icons/fa'
import Datepicker from 'flowbite-datepicker/Datepicker';
import axios from 'axios';
import { useClickOutside } from 'react-click-outside-hook';
import { Link, useNavigate } from 'react-router-dom';
import copy from 'copy-to-clipboard';
import { deleteUserDetails, updateUserProfilePicUrl } from '../helpers';
import { TbRefresh } from 'react-icons/tb'

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const urlEncode = function (data) {
  var str = [];
  for (var p in data) {
    if (data.hasOwnProperty(p) && (!(data[p] === undefined || data[p] == null))) {
      str.push(encodeURIComponent(p) + "=" + (data[p] ? encodeURIComponent(data[p]) : ""));
    }
  }
  return str.join("&");
}

export default function DashboardApp() {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState()
  const [originalUsers, setOriginalUsers] = useState()
  const [selectedUser, setSelectedUser] = useState()
  const [showChargebee, setShowChargebee] = useState(false)
  const [sortByStatus, setSortByStatus] = useState('All')
  const [showStatusOptions, setShowStatusOptions] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [openRefreshModal, setOpenRefreshModal] = useState(false)
  const navigate = useNavigate()

  // verify user
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return navigate("/dashboard/login")
        // console.log(user);

        const { data, error } = await supabase
          .from('users')
          .select()
          .eq("user_id", user.id).eq('first_account', true).order('created_at', { ascending: false })

        error && console.console.log(error);
        // console.log(data[0]);
        setUser(data[0]);
        if (!data[0]?.admin) {
          alert("You are not allowed to access this page.")
          window.location = "/login"
        }
      } catch (error) {
        console.log("fetchUser: ", error)
      }
    }
    fetch()
  }, [navigate])

  // init datepicker
  useEffect(() => {
    try {
      if (user?.admin) {
        const datepickerEl = document.getElementById('datepickerId');
        if (datepickerEl) {
          new Datepicker(datepickerEl, {
            title: "Sort by date added",
            // date: new Date(),
            placement: 'bottom',
            triggerType: 'click',
            offsetSkidding: 0,
            offsetDistance: 10,
            delay: 300,
            onHide: () => {
              console.log('dropdown has been hidden');
            },
            onShow: () => {
              console.log('dropdown has been shown');
            },
            onToggle: () => {
              console.log('dropdown has been toggled');
            }
          });

        } else {
          console.log(datepickerEl);
        }
      }
    } catch (error) {
      console.log("datePicker: ", error)
    }
  }, [user])

  // add changeDate eventlisterner to datepicker
  useEffect(() => {
    try {
      if (user?.admin && originalUsers) {
        const sidenav = document.getElementById("datepickerId");
        if (sidenav) {
          sidenav.addEventListener("changeDate", (event) => {
            if (event?.target?.value) {
              // var filtered = users.filter(user => new Date(user.created_at).getTime() === new Date(event.target.value).getTime())
              var filtered = originalUsers?.filter(user => {
                var d1 = new Date(user.created_at).getDate()
                var m1 = new Date(user.created_at).getMonth() + 1
                var y1 = new Date(user.created_at).getFullYear()
                const a = (d1 + m1 + y1);
                var d2 = new Date(event.target.value).getDate()
                var m2 = new Date(event.target.value).getMonth() + 1
                var y2 = new Date(event.target.value).getFullYear()
                const b = (d2 + m2 + y2);
                return a === b
              })
              setUsers(filtered)
            }
          });
        }
        return sidenav.removeEventListener("changeDate", () => { })
      }
    } catch (error) {
      console.log("datepickerEventListener: ", error)
    }
  }, [originalUsers, user])

  // get all users
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .limit(3000)
        // .limit(900)
        // .eq('status', 'active')
        error && console.log(error);
        if (error) return;

        console.log("all user: ", data.length);

        // const filtered = data.filter(user => user.username !== '')
        // setUsers(filtered);
        // setOriginalUsers(filtered);
        setUsers(data);
        setOriginalUsers(data);
        var active = data.filter(user => (user.status).toLowerCase() === 'active')
        var pending = data.filter(user => (user.status).toLowerCase() === 'pending')
        var cancelled = data.filter(user => (user.status).toLowerCase() === 'cancelled')
        document.querySelector('#Tactive').textContent = active.length
        document.querySelector('#Tpending').textContent = pending.length
        document.querySelector('#Tcancelled').textContent = cancelled.length
        // console.log(data[0]);        
      } catch (error) {

      }
    }
    fetch()
  }, [user])

  const filterByStatus = async (status) => {
    try {
      document.getElementById("datepickerId").value = ''
      document.getElementById("table-search").value = ''
      // var a = originalUsers.filter(user => (user.status).toLowerCase() === status.toLowerCase())
      // console.log("a.length",a.length);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq("status", status.toLowerCase())
        .limit(3000)
      error && console.log(error);
      if (error) return;
      // console.log("data.length", data.length);

      setUsers()
      setTimeout(() => {
        setUsers(data)
      }, 10);
    } catch (error) {
      console.log("filterByStatus: ", error)
    }
  }

  // handle search
  useEffect(() => {
    try {
      if (searchTerm) {
        setTimeout(async () => {
          // const { data, error } = await supabase
          //   .from('users')
          //   .select()
          //   .like('username', `%${searchTerm}%`)

          const delAuth = await supabaseAdmin.auth.admin.deleteUser('b43949fb-b2ed-4a96-bd1a-7ea7fc1fa514')
          console.log(delAuth);
          const delUser = await deleteUserDetails('b43949fb-b2ed-4a96-bd1a-7ea7fc1fa514')
          console.log(delUser);
          
          const second = await supabase
            .from('users')
            .select()
            .like('email', `%${searchTerm.toLowerCase()}%`)

          // error && console.log(error);
          second.error && console.log(second.error);
          // if(error) return;
          if (second.error) return;

          setUsers([...second.data])
          // if (data) {
          // } else {
          //   setUsers(originalUsers)
          // }
        }, 500);
      }
    } catch (error) {
      console.log("handleSearch: ", error)
    }
  }, [originalUsers, searchTerm])

  // useEffect(() => {
  //   const wrapper1 = document.querySelector('.wrapper1')
  //   const wrapper2 = document.querySelector('.wrapper2')
  //   if (!wrapper1 && !wrapper2) return;

  //   const handleScroll1 = () => {
  //     var wrapper1scrollLeftOffset = wrapper1.scrollLeft
  //     console.log(wrapper1scrollLeftOffset);
  //     wrapper2.scrollLeft = wrapper1scrollLeftOffset
  //   };
  //   const handleScroll2 = () => {
  //     console.log('scrolled2');
  //     var wrapper2scrollLeftOffset = wrapper2.scrollLeft
  //     wrapper1.scrollLeft = wrapper2scrollLeftOffset
  //   };

  //   wrapper1.addEventListener('scroll', handleScroll1);
  //   wrapper2.addEventListener('scroll', handleScroll2);

  //   return () => {
  //     wrapper1.removeEventListener('scroll', handleScroll1);
  //     wrapper2.removeEventListener('scroll', handleScroll2);
  //   };
  // }, []);

  const [showModes, setshowModes] = useState(false)
  const [modeChgCaller, setModeChgCaller] = useState()

  const changeMode = async (mode) => {
    try {
      await supabase
        .from("users")
        .update({ userMode: mode }).eq('username', modeChgCaller);
      window.location.reload();
    } catch (error) {
      console.log("changeMode: ", error)
    }
  }

  const [showStatus, setshowStatus] = useState(false)
  const [statusChgCaller, setStatusChgCaller] = useState()

  const changeStatus = async (status) => {
    try {
      // console.log(status, statusChgCaller);
      const { data, error } = await supabase
        .from("users")
        // .select()
        .update({ status })
        .eq('username', statusChgCaller);
        // .match({ username: statusChgCaller });

      console.log(data, error)
      !error && window.location.reload();
    } catch (error) {
      console.log("changeStatus: ", error)
    }
  }

  if (user?.admin) {
    return (<>
      <div className="bg-[#F8F8F8]">
        <div className="max-w-[1600px] mx-auto flex gap-2 md:gap-6 h-screen">
          <div className="flex-1 px-3 py-10 bg-white">
            <img src="/sprouty.svg" alt="" className="mx-auto" />
            <div className="flex flex-col mt-10 font-semibold gap-9 lg:gap-4">
              <Link to="/dashboard" className="flex flex-col lg:flex-row items-center gap-3 py-2 px-4 bg-[#F8F8F8] hover:bg-[#F8F8F8]/70 cursor-pointer rounded-lg">
                <AiOutlineDashboard size={30} className="w-[24px] md:w-[30px]" />
                <span className="hidden md:block text-md">Dashboard</span>
              </Link>
              <button className="flex flex-col lg:flex-row items-center gap-3 py-2 px-4 bg-[#F8F8F8] hover:bg-[#F8F8F8]/70 cursor-pointer rounded-lg" onClick={() => setOpenRefreshModal(true)}>
                <TbRefresh size={30} className="w-[24px] md:w-[30px]" />
                <span className="hidden md:block text-md">Refresh</span>
              </button>
              <div className="flex flex-col lg:flex-row items-center gap-3 py-2 px-4 hover:bg-[#F8F8F8]/70 cursor-pointer rounded-lg" onClick={async () => {
                await supabase.auth.signOut();
                window.onbeforeunload = function () {
                  localStorage.clear();
                }
                window.location.pathname = "/login";
              }}>
                <BiLogOutCircle size={30} className="w-[24px] md:w-[30px]" />
                <span className="hidden md:block text-md">Logout</span>
              </div>
            </div>
          </div>
          <div className="flex-[5] pb-4 h-screen overflow-auto">
            <div className="">
              <div className="flex flex-wrap items-center gap-2 py-6 overflow-auto bg-white justify-evenly lg:px-2">
                <div className="w-[30%] lg:w-[260px] py-[8px] lg:py-[20px] px-[10px] md:px-[14px] lg:px-[32px] bg-[#314796] text-white rounded-[8px]">
                  <div className="flex items-center gap-1 md:gap-3">
                    <FaUserCheck
                      color="white"
                      size={37}
                      className="w-[20px] md:w-[37px]"
                    />
                    <span className="font-semibold md:font-black lg:text-xl" id="Tactive">0</span>
                  </div>
                  <p className="font-semibold md:font-black text-[10px] lg:text-xl">
                    Total active users
                  </p>
                </div>
                <div className="w-[30%] lg:w-[260px] py-[8px] lg:py-[20px] px-[10px] md:px-[14px] lg:px-[32px] bg-[#763196] text-white rounded-[8px]">
                  <div className="flex items-center gap-1 md:gap-3">
                    <FaUserClock
                      color="white"
                      size={37}
                      className="w-[20px] md:w-[37px]"
                    />
                    <span className="font-semibold md:font-black lg:text-xl" id="Tpending">0</span>
                  </div>
                  <p className="font-semibold md:font-black text-[10px] lg:text-xl">
                    Total pending users
                  </p>
                </div>
                <div className="w-[30%] lg:w-[260px] py-[8px] lg:py-[20px] px-[10px] md:px-[14px] lg:px-[32px] bg-[#96317A] text-white rounded-[8px]">
                  <div className="flex items-center gap-1 md:gap-3">
                    <FaUserTimes
                      color="white"
                      size={37}
                      className="w-[20px] md:w-[37px]"
                    />
                    <span className="font-semibold md:font-black lg:text-xl" id="Tcancelled">0</span>
                  </div>
                  <p className="font-semibold md:font-black text-[10px] lg:text-xl">
                    Total inactive users
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white text-[#626262] pr-5">
              <div className="wrapper2 max-h-[calc(100vh-200px)] relative overflow-auto shadow-md sm:rounded-lg">
                <div className="flex justify-between gap-4 px-4 py-4 bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-4">
                    <div className="">
                      <label htmlFor="table-search" className="sr-only">Search</label>
                      <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                        </div>
                        <input type="text" id="table-search" className="block w-40 p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg md:w-60 lg:w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search by email"
                          onChange={(e) => {
                            setSearchTerm(e.target.value)
                          }}
                        />
                      </div>
                    </div>

                    <div className="relative max-w-sm">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                      </div>
                      <input datepicker-title="Date added" id='datepickerId' type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-32 pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Date added" onChange={(e) => {
                        // console.log(e.target.value);
                      }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-1 text-red-700 rounded-md cursor-pointer bg-gray-50" onClick={() => {
                    document.getElementById("datepickerId").value = ''
                    document.getElementById("table-search").value = ''
                    setUsers(originalUsers)
                    setSortByStatus("All")
                  }}>
                    <FaTrash />
                    <span>Clear&nbsp;filters</span>
                  </div>

                </div>
                {/* <div className="wrapper1 h-5 w-[300px] overflow-x-auto">
                  <div className="div1 h-5 w-[30000px]">ddd
                  </div>
                </div> */}
                {/* <div className="wrapper2 h-5 w-[300px] overflow-x-auto">
                  <div className="div1 h-5 w-[30000px]">ddd
                  </div>
                </div> */}

                <table className="w-full overflow-x-auto text-[0.7rem] text-left text-gray-500 dark:text-gray-400 mr-2">
                  <thead className="text-gray-700 uppercase bg-white dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center gap-1">
                          Email
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center gap-1">
                          Users
                          <a href="#" onClick={(e) => {
                            e.preventDefault()
                            const sorted = users.sort(function (a, b) {
                              const nameA = a.username.toUpperCase(); // ignore upper and lowercase
                              const nameB = b.username.toUpperCase(); // ignore upper and lowercase
                              if (nameA > nameB) {
                                return 1;
                              }
                              if (nameA < nameB) {
                                return -1;
                              }

                              // names must be equal
                              return 0;
                            });
                            // console.log(sorted)
                            setUsers()
                            setTimeout(() => {
                              setUsers(sorted)
                            }, 10);
                          }}>
                            <AiOutlineSortAscending size={16} className="" />
                          </a>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="relative flex items-center">
                          <div className="flex flex-col">
                            <span>Status</span>
                            <span className='text-[10px] font-extralight'>{sortByStatus}</span>
                          </div>
                          <a href="#" onClick={() => {
                            setShowStatusOptions(!showStatusOptions)
                          }}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3 h-3 ml-1"
                              aria-hidden="true"
                              fill="currentColor"
                              viewBox="0 0 320 512"
                            >
                              <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                            </svg>
                          </a>
                          {showStatusOptions && <div className="z-50 absolute top-12 -left-4 py-3 w-[130px] px-4 bg-white text-gray-600 shadow-2xl flex flex-col gap-6">
                            <div className="cursor-pointer hover:text-gray-400"
                              onClick={() => {
                                document.getElementById("datepickerId").value = ''
                                document.getElementById("table-search").value = ''
                                setUsers(originalUsers)
                                setSortByStatus("All")
                                setShowStatusOptions(false)
                              }}
                            >All</div>
                            <div className="cursor-pointer hover:text-gray-400"
                              onClick={() => {
                                setSortByStatus("Active")
                                filterByStatus("Active")
                                setShowStatusOptions(false)
                              }}
                            >Active</div>
                            <div className="cursor-pointer hover:text-gray-400"
                              onClick={() => {
                                setSortByStatus("Pending")
                                filterByStatus("Pending")
                                setShowStatusOptions(false)
                              }}
                            >Pending</div>
                            <div className="cursor-pointer hover:text-gray-400"
                              onClick={() => {
                                setSortByStatus("Checking")
                                filterByStatus("Checking")
                                setShowStatusOptions(false)
                              }}
                            >Checking</div>
                            <div className="cursor-pointer hover:text-gray-400"
                              onClick={() => {
                                setSortByStatus("Twofactor")
                                filterByStatus("Twofactor")
                                setShowStatusOptions(false)
                              }}
                            >Twofactor</div>
                            <div className="cursor-pointer hover:text-gray-400"
                              onClick={() => {
                                setSortByStatus("Incorrect")
                                filterByStatus("Incorrect")
                                setShowStatusOptions(false)
                              }}
                            >Incorrect</div>
                            <div className="cursor-pointer hover:text-gray-400"
                              onClick={() => {
                                setSortByStatus("Cancelled")
                                filterByStatus("Cancelled")
                                setShowStatusOptions(false)
                              }}
                            >Cancelled</div>
                          </div>}
                        </div>
                      </th>
                      <th scope="col" className="px-2 py-3 max-w-[40px] break-all">
                        <div className="flex items-center">
                          Followers
                        </div>
                      </th>
                      <th scope="col" className="px-2 py-3 max-w-[40px] break-all">
                        <div className="flex items-center">
                          Following
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          Targeting
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          Mode
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          Chargebee
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className=''>
                    {users && users.map((user, index) => {
                      const username = user?.username;

                      const getTargetingAccounts = async () => {
                        // console.log(user);
                        try {
                          const { data, error } = await supabase
                            .from("targeting")
                            .select()
                            // .eq("user_id", user?.user_id)
                            .eq(user?.first_account ? "user_id" : "main_user_username", user?.first_account ? user?.user_id : user?.username)
                            .eq(user?.first_account ? "main_user_username" : "", user?.first_account ? 'nil' : '')
                            .order('id', { ascending: false });
                          // error && console.log(
                          //   "🚀 ~ file: Targeting.jsx:63 ~ getTargetingAccounts ~ error",
                          //   error
                          // );
                          // console.log(data);
                          if (!error) {
                            const targeting = document.querySelector(`#targeting_${index}_${user?.id}_t`)
                            if (targeting) {
                              targeting.textContent = data?.length
                            }
                          }
                          // return data;
                          // setTargetingAccounts(data);                          
                        } catch (error) {
                          console.error(error);
                        }
                      };

                      if (username && user?.email) {
                        setTimeout(async () => {
                          await getTargetingAccounts();
                        }, 1000);
                      }
                      // if (username && user?.email) {
                      if (username) {
                        return (
                          <tr key={user.id} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-[#F8F8F8]'} border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200`}>
                            <td
                              className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white max-w-[250px] overflow-x-auto"
                            >{user.email}</td>
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white max-w-[200px] overflow-x-auto">@{username}</td>
                            <td className="px-6 py-4">
                              <div className="relative flex items-center">
                                {user.status}
                                <a href="#" onClick={() => {
                                  setshowStatus(!showStatus)
                                  setStatusChgCaller(user?.username)
                                }}>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-3 h-3 ml-1"
                                    aria-hidden="true"
                                    fill="currentColor"
                                    viewBox="0 0 320 512"
                                  >
                                    <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                                  </svg>
                                </a>
                              </div>
                            </td>
                            <td className="px-2 max-w-[40px] break-all py-4">{user.followers}</td>
                            <td className="px-2 max-w-[40px] break-all py-4">{user.following}</td>
                            <td className="flex justify-center w-full px-6 py-4" id={`targeting_${index}_${user?.id}_t`}>0</td>
                            <td className="px-6 py-4">
                              <div className="relative flex items-center">
                                {user.userMode}
                                <a href="#" onClick={() => {
                                  setshowModes(!showModes)
                                  setModeChgCaller(user?.username)
                                }}>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-3 h-3 ml-1"
                                    aria-hidden="true"
                                    fill="currentColor"
                                    viewBox="0 0 320 512"
                                  >
                                    <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
                                  </svg>
                                </a>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <BiUserCircle size={24} className="ml-5" onClick={() => {
                                setSelectedUser(user)
                                setShowChargebee(true)
                              }} />
                            </td>
                            <td className="flex items-center gap-4 py-4 text-right ">
                              <Link to={`/dashboard/edit/${user?.user_id}`} target="_blank" rel="noopener noreferrer"
                                className="font-medium"
                              >
                                <AiOutlineSetting size={24} className="text-blue-600" />
                              </Link>
                              <FaTrash size={20} className="text-red-700 cursor-pointer" onClick={async () => {
                                if (window.confirm("Are you sure you want to delete this account?")) {
                                  console.log(user?.user_id);
                                  // alert('processing...')
                                  if (user.first_account && window.confirm("Deleting this account will delete all accounts related to it!")){
                                    await supabaseAdmin.auth.admin.deleteUser(user?.user_id)                                    
                                    await deleteUserDetails(user?.user_id)
                                  }else{
                                    await deleteUserDetails(user?.username, user?.first_account)                                    
                                  }
                                  // if(!error){
                                  // }else{
                                  //   console.log('An error occurred while deleting the account', error);
                                  //   alert('An error occurred while deleting the account')
                                  // }

                                  window.location.reload()
                                }
                              }} />
                            </td>
                          </tr>
                        )
                      } else {
                        return null
                      }
                    })}
                  </tbody>
                </table>
              </div>


              {users?.length > 100 && <nav className="flex items-center justify-between px-4 pt-4 mb-10" aria-label="Table navigation">
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Showing <span className="font-semibold text-gray-900 dark:text-white">1-20</span> of <span className="font-semibold text-gray-900 dark:text-white">{users?.length}</span></span>
                <ul className="inline-flex items-center -space-x-px">
                  <li>
                    <a href="#" className="block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                      <span className="sr-only">Previous</span>
                      <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">1</a>
                  </li>
                  <li>
                    <a href="#" className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">2</a>
                  </li>
                  <li>
                    <a href="#" aria-current="page" className="z-10 px-3 py-2 leading-tight text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white">3</a>
                  </li>
                  <li>
                    <a href="#" className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">...</a>
                  </li>
                  <li>
                    <a href="#" className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">{users?.length}</a>
                  </li>
                  <li>
                    <a href="#" className="block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                      <span className="sr-only">Next</span>
                      <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    </a>
                  </li>
                </ul>
              </nav>}
            </div>

            <br />
          </div>
        </div>
        {showChargebee && <Chargebee key={selectedUser.id} k={selectedUser.id} user={selectedUser} setShowChargebee={setShowChargebee} />}

        {showStatus && <div className="fixed top-0 left-0 grid w-full h-screen place-items-center bg-black/70">
          <div className="z-50 py-3 w-[130px] px-4 bg-white text-gray-600 shadow-2xl flex flex-col gap-6 relative">
            <FaTimes className='absolute top-0 right-0 cursor-pointer' onClick={() => setshowStatus(false)} />
            <div className="cursor-pointer hover:text-gray-400" onClick={() => { changeStatus('active'); setStatusChgCaller(''); setshowStatus(false) }}>Active</div>
            <div className="cursor-pointer hover:text-gray-400" onClick={() => { changeStatus('pending'); setStatusChgCaller(''); setshowStatus(false) }}>Pending</div>
            <div className="cursor-pointer hover:text-gray-400" onClick={() => { changeStatus('checking'); setStatusChgCaller(''); setshowStatus(false) }}>Checking</div>
            <div className="cursor-pointer hover:text-gray-400" onClick={() => { changeStatus('twofactor'); setStatusChgCaller(''); setshowStatus(false) }}>Twofactor</div>
            <div className="cursor-pointer hover:text-gray-400" onClick={() => { changeStatus('incorrect'); setStatusChgCaller(''); setshowStatus(false) }}>Incorrect</div>
            <div className="cursor-pointer hover:text-gray-400" onClick={() => { changeStatus('cancelled'); setStatusChgCaller(''); setshowStatus(false) }}>Cancelled</div>
          </div>
        </div>}

        {showModes && <div className="fixed top-0 left-0 grid w-full h-screen place-items-center bg-black/70">
          <div className="z-50 py-3 w-[130px] px-4 bg-white text-gray-600 shadow-2xl flex flex-col gap-6 relative">
            <FaTimes className='absolute top-0 right-0 cursor-pointer' onClick={() => setshowModes(false)} />
            <div className="cursor-pointer hover:text-gray-400" onClick={() => { changeMode('auto'); setModeChgCaller(''); setshowModes(false) }}>auto</div>
            <div className="cursor-pointer hover:text-gray-400" onClick={() => { changeMode('follow'); setModeChgCaller(''); setshowModes(false) }}>follow</div>
            <div className="cursor-pointer hover:text-gray-400" onClick={() => { changeMode('unfollow'); setModeChgCaller(''); setshowModes(false) }}>unfollow</div>
            <div className="cursor-pointer hover:text-gray-400" onClick={() => { changeMode('pause'); setModeChgCaller(''); setshowModes(false) }}>pause</div>
            <div className="cursor-pointer hover:text-gray-400" onClick={() => { changeMode('off'); setModeChgCaller(''); setshowModes(false) }}>off</div>
          </div>
        </div>}
      </div>

      {openRefreshModal && <RefreshModal openRefreshModal={openRefreshModal} setOpenRefreshModal={setOpenRefreshModal} />}
    </>);
  } else {
    return (<></>)
  }
}

export const RefreshModal = ({ openRefreshModal, setOpenRefreshModal }) => {
  const [parentRef, isClickedOutside] = useClickOutside();
  const [message, setMessage] = useState('')
  const [profilePicture, setProfilePicture] = useState()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')

  useEffect(() => {
    if (isClickedOutside) {
      setOpenRefreshModal(false)
    };
  }, [isClickedOutside, setOpenRefreshModal]);

  const handleRefresh = async () => {
    try {
      if (username) {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('profile_pic_url, status, username, user_id')
          .eq('username', username)
        if (error) {
          setMessage(error.message)
          setLoading(false);
          return;
        }
        data.forEach(async data => {
          data?.profile_pic_url && setProfilePicture(data.profile_pic_url)

          if (data?.username) {
            const { ppu } = await updateUserProfilePicUrl(data)
            if (ppu) {
              setProfilePicture(ppu)
              setMessage('success');
            } else {
              setMessage('error');
            }
          } else {
            setMessage('error');
          }
        })
        setLoading(false);
      }
    } catch (error) {
      console.log("handleRefresh: ", error)
    }
  }

  return (
    <div className="fixed top-0 left-0 z-50 grid w-full h-screen place-items-center bg-black/70">
      <div className="bg-white w-[300px] max-h-[80%] my-auto overflow-y-auto md:min-w-[400px] py-4 rounded-xl" ref={parentRef}>
        <div className="flex justify-between px-6 py-2 border-b">
          <div className="text-green-400">{message}</div>
          <FaTimes className='cursor-pointer' onClick={() => setOpenRefreshModal(false)} />
        </div>
        <div className="flex flex-col items-center gap-4 px-6 mt-4">
          <div className="w-[60px] h-[60px] rounded-full bg-red-600">
            <img src={profilePicture} className="w-full h-full rounded-full" alt="" />
          </div>
          <input type="text" className="px-2 border border-black w-52" placeholder='enter username' onChange={(e) => setUsername(e.target.value)} />
          <button onClick={() => { !loading && handleRefresh() }} className="w-[200px] py-2 bg-blue-500 text-white">{loading ? 'refreshing...' : 'refresh'}</button>
        </div>
      </div>
    </div>
  )
}

export const Chargebee = ({ k, user, setShowChargebee }) => {
  const [customer, setCustomer] = useState('')
  const [subscription, setsubscription] = useState()
  const [currentUser, setCurrentUser] = useState()
  const [parentRef, isClickedOutside] = useClickOutside();
  const [message, setMessage] = useState('')

  const baseUrl = 'https://vizzysocial-api.up.railway.app'
  // console.log(user);
  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(user.user_id)
      // console.log(data?.user);
      data?.user && setCurrentUser(data?.user)
      error && console.log(error)

      // console.log(currentUser?.email);
      if (user?.email) {
        let customer = await axios.post(`${baseUrl}/api/chargebee/customer_list`,
          urlEncode({ email: user?.email }))
          .then((response) => response.data)
        // console.log(user?.email)
        // console.log(customer)
        setCustomer(customer)

        if (customer?.id) {
          let subscription = await axios.post(`${baseUrl}/api/chargebee/subscription_list`,
            urlEncode({ customer_id: customer?.id }))
            .then((response) => response.data)
          // console.log(subscription)
          setsubscription(subscription)
        }
      }

    }
    fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isClickedOutside) {
      setShowChargebee(false)
    };
  }, [isClickedOutside, setShowChargebee]);

  return (
    <div key={k} className="fixed top-0 left-0 z-50 grid w-full h-screen place-items-center bg-black/70">
      <div className="absolute text-green-400 top-3 right-3">{message}</div>
      <div className="bg-white w-[300px] md:w-[500px] min-h-[400px] max-h-[80%] my-auto overflow-y-auto md:min-w-[400px] py-4 rounded-xl" ref={parentRef}>
        <div className="flex justify-between px-6 py-2 border-b">
          <div className="text-lg font-bold">User Chargebee details</div>
          <FaTimes className='cursor-pointer' onClick={() => setShowChargebee(false)} />
        </div>
        <div className="flex flex-col gap-4 px-6 mt-4">
          <div className="flex flex-col justify-between gap-10 border-b md:flex-row">
            <div className="">USERNAME:</div>
            <div className="">{user?.username}</div>
          </div>
          <div className="flex flex-col justify-between gap-10 border-b md:flex-row">
            <div className="">ACCOUNT STATUS:</div>
            <div className="">{user?.status}</div>
          </div>
          <div className="flex flex-col justify-between gap-10 border-b md:flex-row">
            <div className="">SUBSCRIPTION STATUS:</div>
            <div className={`
            ${(subscription?.status === 'active' && subscription?.due_invoices_count === 0) && "text-green-600"} 
            ${(subscription?.status === 'active' && subscription?.due_invoices_count > 0) && "text-red-600"} 
            ${subscription?.status === 'in_trial' && "text-orange-600"} 
            ${subscription?.status === 'cancelled' && "text-red-600"} 
            font-semibold capitalize`}>{
                (subscription?.status === 'active' && subscription?.due_invoices_count > 0) ? 
                  `Invoice Due ( ${subscription?.due_invoices_count} )` : subscription?.status
            }</div>
          </div>
          <div className="flex flex-col justify-between gap-10 border-b md:flex-row">
            <div className="">NAME:</div>
            <div className="">{user?.full_name}</div>
          </div>
          <div className="flex flex-col justify-between gap-10 border-b md:flex-row">
            <div className="">EMAIL:</div>
            <div className="cursor-pointer" onClick={() => {
              copy(currentUser?.email, {
                debug: true,
                message: 'Press #{key} to copy',
              })
              setMessage('copied')
              setTimeout(() => {
                setMessage('')
              }, 1000);
            }}>{currentUser?.email}</div>
          </div>
          <div className="flex flex-col justify-between gap-10 border-b md:flex-row">
            <div className="">CUSTOMER_ID:</div>
            {/* <div className="">{d?.customer_id}</div> */}
            <a href={`https://sproutysocial.chargebee.com/d/customers/${customer?.id}`} target='_blank' className="cursor-pointer" rel="noreferrer" 
            // onClick={() => {
            //   copy(customer?.id, {
            //     debug: true,
            //     message: 'Press #{key} to copy',
            //   })
            //   setMessage('copied')
            //   setTimeout(() => {
            //     setMessage('')
            //   }, 1000);
            // }}
            >{customer?.id}</a>
          </div>
          <div className="flex flex-col justify-between gap-10 border-b md:flex-row">
            <div className="">SUBSCRIPTION_ID:</div>
            <a href={`https://sproutysocial.chargebee.com/d/subscriptions/${subscription?.id}`} target='_blank' className="cursor-pointer" rel="noreferrer" 
            // onClick={() => {
            //   copy(subscription?.id, {
            //     debug: true,
            //     message: 'Press #{key} to copy',
            //   })
            //   setMessage('copied')
            //   setTimeout(() => {
            //     setMessage('')
            //   }, 1000);
            // }}
            >{subscription?.id}</a>
          </div>
        </div>
      </div>
    </div>
  )
}