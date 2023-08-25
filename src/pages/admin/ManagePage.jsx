import React, { useEffect, useState } from 'react'
import Header from './components/header'
import { FaCaretUp, FaPen, FaPlus, FaTimes } from 'react-icons/fa'
import { supabase } from '../../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import copy from 'copy-to-clipboard';
import axios from 'axios'
import { ACTIVE_TEMPLATE, CHECKING_TEMPLATE, INCORRECT_PASSWORD_TEMPLATE, LOGO, TWO_FACTOR_TEMPLATE } from '../../config'

export const calculateLast7DaysGrowth = (sessionData) => {
  if (!sessionData) return
  const previous7DaysGrowth = sessionData[sessionData.length - 7].profile.followers;
  const last7DaysGrowth = sessionData[sessionData.length - 1].profile.followers;

  // Calculate the growth difference and determine if it's positive, negative, or zero
  let growthDifference;
  if (last7DaysGrowth > previous7DaysGrowth) {
    growthDifference = `+${last7DaysGrowth - previous7DaysGrowth}`;
  } else if (last7DaysGrowth < previous7DaysGrowth) {
    growthDifference = `-${previous7DaysGrowth - last7DaysGrowth}`;
  } else {
    growthDifference = "0";
  }

  return growthDifference
}

export const statuses = ['new', 'active', 'checking', 'pending', 'twofactor', 'incorrect', 'cancelled']

export default function ManagePage() {
  const navigate = useNavigate();
  const [fetchingUser, setFetchingUser] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sectionName, setSectionName] = useState('new')
  const [sectionTotal, setSectionTotal] = useState(0)
  const [users, setUsers] = useState([])
  const [refreshUsers, setRefreshUsers] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ sectionName: '', value: '' })
  const [showAddTagModal, setShowAddTagModal] = useState(false)
  const [userToAddTagFor, setUserToAddTagFor] = useState()

  useEffect(() => {
    const getData = async () => {
      const authUserRes = await supabase.auth.getUser()
      if (authUserRes.error) return navigate("/login")
      const authUser = authUserRes?.data?.user
      const getSuperUser = await supabase.from('users').select().eq("email", authUser.email)
      const superUser = getSuperUser?.data?.[0]
      if(!superUser || !superUser?.admin) return navigate("/login")
      setFetchingUser(false)
    };

    getData();
  }, [navigate]);

  // setUsers([]); and setSectionTotal(0)
  useEffect(() => {
    const fetch = async () => {
      setSearchTerm('')
      if (!sectionName) return;
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq("status", sectionName.toLocaleLowerCase())
        .limit(3000)
      error && console.log(error);
      if (error) return;

      setUsers([]);
      setSectionTotal(0)
      setTimeout(() => {
        setUsers(data);
        setSectionTotal(data?.length)
        setLoading(false)
      }, 500);
    }
    fetch()
  }, [sectionName, refreshUsers])

  // last_7_days_growth_
  useEffect(() => {
    if (users.length > 0) {
      users.forEach(async user => {
        const resData = await supabase
          .from('sessions')
          .select()
          .eq('username', user?.username)
        resData.error && console.log(resData.error);
        var d = resData?.data?.[0]?.data
        const growthDifference = calculateLast7DaysGrowth(d)
        var v;
        if (growthDifference) {
          v = `
          <div class="${growthDifference > 0 ? "text-[#23DF85]" : `${parseInt(growthDifference) === 0 ? "text-[#000]" : "text-[#E9C81B]"}`} font-black">${growthDifference}</div>
          `
        } else {
          v = `
          <div class="text-[#000] font-black">N/A</div>
          `
        }
        document.getElementById(`last_7_days_growth_${user?.username}`).innerHTML = v
      })
    }
  }, [users])

  if (fetchingUser) {
    return (<>
      Loading...
    </>)
  }

  return (<>
    {showAddTagModal && <TagModal
      setShowAddTagModal={setShowAddTagModal}
      userToAddTagFor={userToAddTagFor}
      refreshUsers={refreshUsers}
      setRefreshUsers={setRefreshUsers}
    />}

    <div className="font-MontserratRegular max-w-[1600px] mx-auto">
      <Header
        setUsers={setUsers}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setLoading={setLoading}
      />

      <div className="mt-[30px] h-[82px] w-full rounded-[10px] border shadow-[0px_0px_5px_0px_#E7E7E7] px-5 flex items-center gap-2">
        {statuses.map(status => {
          return (
            <div key={`retention_page-${status}`} className="h-[59px] rounded-[10px] bg-[#F8F8F8] text-[25px] font-bold font-MontserratBold text-black px-4 flex justify-center items-center relative">
              <div className="flex items-center justify-center capitalize cursor-pointer select-none" onClick={() => { setSectionName(status) }}>{status}
                {status === sectionName && <span className="px-[15px] h-[37px] rounded-[10px] text-center text-white bg-[#1B89FF] select-none ml-5">{sectionTotal}</span>}
              </div>
            </div>
          )
        })}
      </div>

      {loading && <div className="flex items-center justify-center">
        <img src={LOGO} alt="Loading" className="w-10 h-10 animate-spin" />
      </div>}

      <table className="mt-[30px] w-full table-auto border-separate border-spacing-y-2">
        <thead>
          <tr>
            <th></th>
            <th>Account</th>
            <th>Email</th>
            <th>Password</th>
            <th>2FA Code</th>
            <th>Last 7 Days Growth</th>
            <th>Tags</th>
            <th colSpan={2}>
              <div className="text-center">Actions</div>
            </th>
          </tr>
        </thead>

        <tbody>
          {users.map(user => {
            if (!user) {
              return ("Loading")
            }

            return (
              <tr key={`${user?.username}_row`} className='rounded-[10px] bg-[#F8F8F8] h-[64px] w-full'>
                <td>
                  <img src={user?.profile_pic_url} alt="" className="w-[30px] h-[30px] min-w-[30px] min-h-[30px] rounded-full bg-black ml-4" />
                </td>
                <td>
                  <div className="relative cursor-pointer max-w-[180px] break-words" onClick={() => {
                    copy(user?.username, {
                      debug: true,
                      message: 'Press #{key} to copy',
                    })
                    setMessage({ sectionName: `username-${user?.username}`, value: 'copied' })
                    setTimeout(() => {
                      setMessage({ sectionName: '', value: '' })
                    }, 1000);
                  }}>@{user?.username}
                    {message.sectionName === `username-${user?.username}` && <div className="absolute font-bold text-black">{message.value}</div>}
                  </div>
                </td>
                <td>
                  <div className="max-w-[200px] break-words">
                    <a href={`mailto:${user?.email}`} className="">{user?.email}</a>
                  </div>
                </td>
                <td>
                  <div className="relative cursor-pointer min-w-[100px]" onClick={() => {
                    copy(user?.instagramPassword, {
                      debug: true,
                      message: 'Press #{key} to copy',
                    })
                    setMessage({ sectionName: `password-${user?.username}`, value: 'copied' })
                    setTimeout(() => {
                      setMessage({ sectionName: '', value: '' })
                    }, 1000);
                  }}>*****
                    {message.sectionName === `password-${user?.username}` && <div className="absolute font-bold text-black">{message.value}</div>}
                  </div>
                </td>
                <td>
                  <div className="relative cursor-pointer min-w-[100px]" onClick={() => {
                    copy(user?.backupcode, {
                      debug: true,
                      message: 'Press #{key} to copy',
                    })
                    setMessage({ sectionName: `backupcode-${user?.username}`, value: 'copied' })
                    setTimeout(() => {
                      setMessage({ sectionName: '', value: '' })
                    }, 1000);
                  }}>{user?.backupcode.length > 7 ? user?.backupcode.substring(0, 6) + "..." : user?.backupcode || "N/A"}
                    {message.sectionName === `backupcode-${user?.username}` && <div className="absolute font-bold text-black">{message.value}</div>}
                  </div>
                </td>
                <td>
                  <div className='min-w-[100px]' id={`last_7_days_growth_${user?.username}`}>N/A
                  </div>
                </td>
                <td>
                  <div className="relative group">
                    {user?.tag?.tag1 && <div className="absolute top-0 left-0 hidden w-full h-full bg-black/20 group-hover:grid place-items-center">
                      <div className="w-[30px] h-[30px] grid place-items-center rounded-lg bg-black text-white cursor-pointer" onClick={() => { setShowAddTagModal(true); setUserToAddTagFor(user) }}>
                        <FaPen />
                      </div>
                    </div>}
                    {user?.tag?.tag1 ?
                      <div className="flex items-center gap-2">
                        <div style={{ backgroundColor: user?.tag?.color }} className={`text-white w-[55px] h-[30px] rounded-lg flex items-center justify-center gap-1 text-xs font-semibold`}>
                          {user?.tag?.tag1} <FaCaretUp size={10} />
                        </div>
                        <div style={{ backgroundColor: user?.tag?.color }} className={`text-white w-[55px] h-[30px] rounded-lg flex items-center justify-center gap-1 text-xs font-semibold`}>
                          {user?.tag?.tag2} <FaCaretUp size={10} />
                        </div>
                      </div>
                      :
                      <div className="grid bg-black rounded-full cursor-pointer h-7 w-7 to-white place-items-center" onClick={() => { setShowAddTagModal(true); setUserToAddTagFor(user) }}>
                        <FaPlus size={15} color='white' />
                      </div>
                    }
                  </div>
                </td>
                <td>
                  <Link to={`/dashboard/${user?.username}?uuid=${user?.user_id}`} target='_blank' className="w-[35px] h-[35px] grid place-items-center rounded-[10px] bg-black">
                    <img src="/icons/user-settings.svg" alt="" className="w-[18px] h-[18px]" />
                  </Link>
                </td>
                <td>
                  <div className="relative w-full">
                    <ChangeStatusModal user={user} refreshUsers={refreshUsers} setRefreshUsers={setRefreshUsers} />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  </>)
}

const TagModal = ({ setShowAddTagModal, userToAddTagFor, refreshUsers, setRefreshUsers }) => {
  const colors = ['#7EA3CC', "#F48668", "#73A580", "#BBC8CA", "#FDF5BF"]
  const [color, setColor] = useState(userToAddTagFor?.tag?.color ?? '#7EA3CC')
  const [tag1, setTag1] = useState(userToAddTagFor?.tag?.tag1 ?? '')
  const [tag2, setTag2] = useState(userToAddTagFor?.tag?.tag2 ?? '')
  const [processing, setProcessing] = useState(false)

  const handleSave = async () => {
    const data = { color, tag1, tag2 }
    if (!(tag1 && tag2)) return alert('Some fields are empty!')

    setProcessing(true)
    const res = await supabase
      .from('users')
      .update({
        tag: data
      })
      .eq('username', userToAddTagFor?.username);

    // console.log(res);
    setProcessing(false)
    if (res.status === 204) {
      setRefreshUsers(!refreshUsers)
      setShowAddTagModal(false)
    }
  }

  return (<>
    <div className="fixed top-0 left-0 z-20 w-full h-screen font-MontserratRegular bg-black/20">
      <div className="fixed top-0 left-0 w-full h-screen bg-black/20 z-[2] cursor-pointer" onClick={() => { setShowAddTagModal(false) }}>
      </div>

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] min-w-[300px] bg-white rounded-[10px] pb-2 px-4">
        {processing && <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full text-white bg-black/20">
          <img src={LOGO} alt="Loading" className="w-10 h-10 animate-spin" />
        </div>}

        <div className="flex justify-between mt-1 mb-2">
          <div className="font-semibold">@{userToAddTagFor?.username}</div>
          <FaTimes className='cursor-pointer' onClick={() => { setShowAddTagModal(false) }} />
        </div>

        <div className="">
          <div className="flex items-center gap-2">
            {colors.map(colorC => {
              return (
                <div key={colorC} className={`${color === colorC ? "border-black" : "border-transparent"} border-2 rounded-lg px-1 py-[2px] grid place-items-center`}>
                  <label htmlFor={colorC} style={{ backgroundColor: colorC }} className={`w-8 h-3 cursor-pointer rounded-lg`} onClick={() => {
                    setColor(colorC);
                  }}></label>
                  <input type="radio" className='hidden' name="color" id={colorC} value={colorC} defaultChecked onChange={(e) => {
                    setColor(e.target.value);
                  }} />
                </div>
              )
            })}
          </div>

          <div className="flex justify-between gap-3 mt-3">
            <div className="flex flex-col">
              <label htmlFor="inputA">Tag1</label>
              <input type="search" name="inputA" id="inputA" className='h-[34px] w-[125px] px-2 rounded-lg border border-gray-500 outline-none shadow-2xl' minLength={1} maxLength={7} onChange={(e) => setTag1(e.target.value)} value={tag1} />
            </div>

            <div className="flex flex-col">
              <label htmlFor="inputA">Tag2</label>
              <input type="search" name="inputA" id="inputA" className='h-[34px] w-[125px] px-2 rounded-lg border border-gray-500 outline-none shadow-2xl' minLength={1} maxLength={7} onChange={(e) => setTag2(e.target.value)} value={tag2} />
            </div>
          </div>
        </div>

        <button className="w-full h-[25px] rounded-lg bg-blue-600 text-white mt-3" onClick={handleSave}>Save</button>
      </div>
    </div>
  </>)
}

export const ChangeStatusModal = ({ user, refreshUsers, setRefreshUsers }) => {
  const [showModal, setShowModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const oldStatus = user?.status

  useEffect(() => {
    // console.log(showModal);
  }, [showModal])

  return (
    <div className="">
      <div className="w-[120px] h-[35px] flex items-center gap-2 justify-center rounded-[10px] bg-black text-white cursor-pointer capitalize" onClick={() => {
        setShowModal(!showModal)
      }}>
        {user?.status}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-[18px] h-[18px]"
          aria-hidden="true"
          fill="white"
          viewBox="0 0 320 512"
        >
          <path d="M27.66 224h264.7c24.6 0 36.89-29.78 19.54-47.12l-132.3-136.8c-5.406-5.406-12.47-8.107-19.53-8.107c-7.055 0-14.09 2.701-19.45 8.107L8.119 176.9C-9.229 194.2 3.055 224 27.66 224zM292.3 288H27.66c-24.6 0-36.89 29.77-19.54 47.12l132.5 136.8C145.9 477.3 152.1 480 160 480c7.053 0 14.12-2.703 19.53-8.109l132.3-136.8C329.2 317.8 316.9 288 292.3 288z" />
        </svg>
      </div>

      {showModal && <div className='w-full h-full'>
        {processing && <div className="fixed top-0 left-0 z-20 flex items-center justify-center w-full h-full text-white bg-black/20">
          <img src={LOGO} alt="Loading" className="w-10 h-10 animate-spin" />
        </div>}

        <div className={`${showModal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} transition-all absolute right-0 z-10 mt-2 border border-[#bbbbbb] rounded-[10px] bg-[#fff] text-[25px] font-bold font-MontserratBold text-black min-h-[100px] flex flex-col gap-3`}>
          {statuses.map(status => {
            return (
              <div key={`status-${status}`} className={`${user?.status === status ? "bg-[#cdcdcd] hover:bg-[#dfdfdf]" : "hover:bg-[#cdcdcd] bg-[#F8F8F8]"} h-[59px] rounded-[10px] text-[25px] font-bold font-MontserratBold text-black px-4 flex items-center capitalize cursor-pointer`}
                onClick={async () => {
                  setProcessing(true)
                  const res = await supabase
                    .from("users")
                    .update({ status })
                    .eq('email', user?.email)
                    .eq('username', user?.username);
                  if (res?.error) {
                    console.log(res);
                    alert('an error occurred!')
                  }

                  if (status === 'incorrect' || status === 'twofactor' || status === 'active' || status === 'checking') {
                    var htmlContent = ''
                    var subject = ''
                    if (oldStatus && oldStatus === 'new' && status === 'checking') {
                      subject = "Your account needs to confirm our login request"
                      htmlContent = CHECKING_TEMPLATE(user?.full_name, user?.username)
                    }
                    if (status === 'active') {
                      subject = "Your account has been activated"
                      htmlContent = ACTIVE_TEMPLATE(user?.full_name, user?.username)
                    }
                    if (status === 'twofactor') {
                      subject = "Your account has Two Factor authentication"
                      htmlContent = TWO_FACTOR_TEMPLATE(user?.full_name, user?.username)
                    }
                    if (status === 'incorrect') {
                      subject = "Your account has incorrect password"
                      htmlContent = INCORRECT_PASSWORD_TEMPLATE(user?.full_name, user?.username)
                    }

                    let sendEmail = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/send_email`,
                      {
                        email: user?.email,
                        subject,
                        htmlContent
                      }).catch(err => err)
                    if (sendEmail.status !== 200) {
                      console.log(sendEmail);
                    }
                  }
                  setProcessing(false)
                  setRefreshUsers(!refreshUsers)
                  setShowModal(!showModal)
                }}
              >{status}</div>
            )
          })}
        </div>
      </div>}
    </div>
  )
}