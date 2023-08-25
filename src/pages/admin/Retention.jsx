import React, { useEffect, useState } from 'react'
import Header from './components/header'
import { Chargebee } from '../../dashboard'
import { supabase } from '../../supabaseClient'
import { Link, useNavigate } from 'react-router-dom'
import { countDays } from '../../helpers'
import copy from 'copy-to-clipboard';
import { ChangeStatusModal, calculateLast7DaysGrowth, statuses } from './ManagePage'
import { FaInstagram } from 'react-icons/fa'
import { LOGO } from '../../config'

export default function Retention() {
  const navigate = useNavigate();
  const [fetchingUser, setFetchingUser] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sectionName, setSectionName] = useState('active')
  const [sectionTotal, setSectionTotal] = useState(0)
  const [selectedUser, setSelectedUser] = useState()
  const [showChargebee, setShowChargebee] = useState(false)
  const [users, setUsers] = useState([])
  const [refreshUsers, setRefreshUsers] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ sectionName: '', value: '' })

  // verity user
  useEffect(() => {
    const getData = async () => {
      const authUserRes = await supabase.auth.getUser()
      if (authUserRes.error) return navigate("/login")
      const authUser = authUserRes?.data?.user
      const getSuperUser = await supabase.from('users').select().eq("email", authUser.email)
      const superUser = getSuperUser?.data?.[0]
      if (!superUser || !superUser?.admin) return navigate("/login")
      setFetchingUser(false)
    };

    getData();
  }, [navigate]);

  useEffect(() => {
    const fetch = async () => {
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

  useEffect(() => {
    if (users.length > 0) {
      users.forEach(async user => {
        const resData = await supabase
          .from('sessions')
          .select()
          .eq('username', user?.username)
        resData.error && console.log(resData.error);
        var d = resData?.data?.[0]?.data
        // console.log(d);
        const growthDifference = calculateLast7DaysGrowth(d)
        // console.log(growthDifference);
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

  return (
    <div className="font-MontserratRegular max-w-[1600px] mx-auto">
      {showChargebee && <Chargebee k={selectedUser?.id} user={selectedUser} setShowChargebee={setShowChargebee} />}
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
            <th>Followers</th>
            <th>Following</th>
            <th>Last 7 Days Growth</th>
            <th>Updated</th>
            <th colSpan={3}>
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
                  <div className="flex items-center gap-2">
                    <div className="relative cursor-pointer max-w-[180px] break-words"
                      onClick={() => {
                        copy(user?.username, {
                          debug: true,
                          message: 'Press #{key} to copy',
                        })
                        setMessage({ sectionName: `username-${user?.username}`, value: 'copied' })
                        setTimeout(() => {
                          setMessage({ sectionName: '', value: '' })
                        }, 1000);
                      }}
                    >@{user?.username}
                      {message.sectionName === `username-${user?.username}` && <div className="absolute font-bold text-black">{message.value}</div>}
                    </div>

                    <a href={`https://www.instagram.com/${user?.username}/`} target='_blank' rel="noreferrer" >
                      <FaInstagram size={16} color="red" />
                    </a>
                  </div>
                </td>
                <td>
                  <div className="max-w-[200px] break-words">
                    <a href={`mailto:${user?.email}`} className="">{user?.email}</a>
                  </div>
                </td>
                <td>{user?.followers}</td>
                <td>{user?.following}</td>
                <td>
                  <div id={`last_7_days_growth_${user?.username}`}>N/A
                  </div>
                </td>
                <td>{user?.session_updated_at ? countDays(user?.session_updated_at) : "N/A"}</td>
                <td>
                  <div className="w-[35px] h-[35px] grid place-items-center rounded-[10px] bg-black cursor-pointer"
                    onClick={() => {
                      setSelectedUser(user)
                      setShowChargebee(true)
                    }}>
                    <img src="/icons/monetization.svg" alt="" className="w-[18px] h-[18px]" />
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
  )
}
