import React, { useEffect, useState } from "react";
import { BsClock } from "react-icons/bs";
import { Link, useNavigate, useParams } from "react-router-dom";
import Nav from "../components/Nav";
import { supabase } from "../supabaseClient";
import { AiOutlinePlus } from "react-icons/ai";
import { numFormatter, sumTotalInteractions } from "../helpers";
import { FaUserCog } from "react-icons/fa";
import SettingsModal from "../components/SettingsModal";

export default function ManageAccounts() {
    let { username } = useParams();
    const currentUsername = username
    const navigate = useNavigate()
    const [accounts, setAccounts] = useState([])
    const [showSettingsModal, setShowSettingsModal] = useState(false)
    const [accountToSet, setAccountToSet] = useState()
    const [refreshUser, setRefreshUser] = useState(false)
    // const [totalInteractions, setTotalInteractions] = useState([{ username: '', value: 0 }])

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return navigate("/login")
            const getAllAccounts = await supabase.from('users').select().eq('email', user.email)
            setAccounts(getAllAccounts?.data)
        };

        getData();
    }, [currentUsername, navigate, refreshUser]);

    // // setSessionsData
    // useEffect(() => {
    //     const list = totalInteractions
    //     const fetch = async () => {
    //         if (accounts.length === 0) return;
    //         accounts.forEach(async (account) => {
    //             const alreadyExists = totalInteractions.find(a => a.username === account.username)
    //             console.log(alreadyExists);
    //             if (alreadyExists) return;
                
    //             const resData = await supabase
    //                 .from('sessions')
    //                 .select()
    //                 .eq('username', account.username).single()
    //             // resData.error && console.log(resData.error);
    //             // console.log(resData.data);   
    //             var d = resData?.data?.data
    //             if (!d) return;
    //             try {
    //                 const c = JSON.parse(resData.data.data);
    //                 if (c) { d = c }
    //             } catch (error) {
    //                 // console.log(error);
    //             }
    //             // console.log(d);
    //             // setSessionsData(d)
    //             list.push({ username: account.username, value: sumTotalInteractions(d) });
    //             console.log(list);
    //             // setTotalInteractions(sumTotalInteractions(d))
                
    //         });
    //         console.log(list);
    //         setTotalInteractions(list)
            
    //     }
    //     if (currentUsername) {
    //         fetch()
    //         console.log('hey');
    //         setTotalInteractions(list)
    //     }
    // }, [accounts, currentUsername, totalInteractions])
    
    
    const getTotalInteractions = (username) => {
        const fetch = async ()=> {
            const resData = await supabase
                .from('sessions')
                .select()
                .eq('username', username)
                // .single()
            // resData.error && console.log(resData.error);
            // console.log(resData.data);   
            var d = resData?.data?.data?.[0]
            if (!d) return;
            try {
                const c = JSON.parse(resData.data.data);
                if (c) { d = c }
            } catch (error) {
                // console.log(error);
            }
            // console.log(d);
            // setSessionsData(d)
            const result = sumTotalInteractions(d);
            document.getElementById(`interaction_${username}`).textContent = result ? numFormatter(result) : 0;
        }
        fetch()
    }
    


    return (
        <>
            <SettingsModal
                show={showSettingsModal}
                onHide={() => setShowSettingsModal(false)}
                modalIsOpen={showSettingsModal}
                setIsOpen={setShowSettingsModal}
                user={accountToSet}
                u={'user'}
                setRefreshUser={setRefreshUser}
            />

            <div className="max-w-[1400px] mx-auto">
                <Nav />

                <div className="mt-4">
                    <div
                        className="flex justify-between items-center rounded-[10px] h-[84px] px-5 md:px-[30px] mb-10"
                        style={{
                            boxShadow: '0 0 3px #00000040',
                        }}
                    >
                        <h1 className="font-black font-MontserratBold text-[18px] md:text-[26px] text-black">Select an account</h1>

                        <div className="flex items-center gap-2 text-base">
                            <BsClock size={25} className="w-[25px] h-[25px]" />
                            <h3>Stats shown for last 30 days</h3>
                        </div>
                    </div>
                </div>

                <div className="relative grid items-center grid-cols-1 m-5 mt-0 lg:grid-cols-2 xl:grid-cols-3 auto-rows-fr lg:gap-x-5 lg:gap-y-10">
                    {accounts.map(account => {
                        return (
                            <div to={"/dashboard/" + account?.username} key={"manage_" + account.username} className="items-center w-full lg:w-[360px] relative rounded-[10px] p-[24px] pb-0 lg:p-[26px] lg:min-h-full flex flex-col justify-between overflow-hidden shadow-[0_0_3px_#00000040] bg-white text-black cursor-pointer z-[5]" onClick={() => {
                                // navigate("/dashboard/" + account?.username)
                            }}>
                                <div className="flex w-full lg:flex-col">
                                    <div className="items-center justify-center hidden gap-2 lg:flex">
                                        <img src="/icons/instagram.svg" alt="ig" className="w-[20px] h-[20px] rounded-full" />
                                        <div className="text-[18px] font-bold">Instagram Account</div>
                                    </div>

                                    <div className="flex items-center justify-between w-full lg:justify-center">
                                        <div className="flex items-center lg:flex-col gap-[14px]">
                                            <div className="relative w-[54px] h-[54px] lg:w-[160px] lg:h-[160px] lg:mt-10 lg:mx-auto">
                                                <img src={account?.profile_pic_url} alt="" className="w-full h-full rounded-full p-[3px]" />
                                                <div className="w-[20px] h-[20px] lg:w-[36px] lg:h-[36px] rounded-full border-[3px] lg:border-4 absolute right-0 bottom-0 lg:right-1 lg:bottom-1 bg-[#23df85]"></div>
                                            </div>
                                            <div className="lg:text-center">
                                                <div className="flex items-center justify-center gap-2 lg:hidden">
                                                    <img src="/icons/instagram.svg" alt="ig" className="w-[20px] h-[20px] rounded-full" />
                                                    <div className="text-[12px] lg:text-[18px] font-bold">Instagram Account</div>
                                                </div>
                                                <div className="lg:mt-5 text-[16px] lg:text-[24px] font-bold">{account?.full_name}</div>
                                                <div className="text-[#1B89FF] text-[12px] lg:text-[18px] leading-[0.8] font-bold">@{account?.username}</div>
                                            </div>
                                        </div>
                                        <div className="lg:hidden w-[32px] h-[32px] rounded-lg bg-[#1B89FF] grid place-items-center cursor-pointer relative z-10" onClick={() => {
                                            setAccountToSet(account)
                                            setShowSettingsModal(true);
                                        }}>
                                            <FaUserCog size={20} className="w-[19px] h-[19px] fill-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full mt-5 text-center">
                                    <div className="">
                                        <div className="text-[14px] lg:text-[16px]">Followers</div>
                                        <div className="pb-1 text-[24px] lg:text-[32px] font-bold leading-[0.8] font-MontserratBold">{numFormatter(account.followers)}</div>
                                    </div>
                                    <div className="w-[2px] h-[47px] border bg-[#c4c4c4]"></div>
                                    <div className="">
                                        <div className="text-[14px] lg:text-[16px]">Following</div>
                                        <div className="pb-1 text-[24px] lg:text-[32px] font-bold leading-[0.8] font-MontserratBold">{numFormatter(account.following)}</div>
                                    </div>
                                    <div className="w-[2px] h-[47px] border bg-[#c4c4c4]"></div>
                                    <div className="">
                                        <div className="text-[14px] lg:text-[16px]">Interactions</div>
                                        <div className="pb-1 text-[24px] lg:text-[32px] font-bold leading-[0.8] font-MontserratBold" id={`interaction_${account.username}`}>{getTotalInteractions(account.username)}0</div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    <Link to={"/search/?username=add_account"} className="mt-5 lg:mt-0 items-center w-full lg:w-[360px] h-full relative rounded-[10px] p-[26px] min-h-full flex flex-col justify-center overflow-hidden shadow-[0_0_3px_#00000040] bg-white text-black">
                        <div className="relative w-[80px] h-[80px] lg:w-[160px] lg:h-[160px] mx-auto">
                            <div className="grid w-full h-full text-white bg-black rounded-full place-items-center">
                                <AiOutlinePlus size={50} className="w-[24px] h-[24px] lg:w-[50px] lg:h-[50px]" />
                            </div>
                            <div className="w-[20px] h-[20px] lg:w-[36px] lg:h-[36px] rounded-full border-2 lg:border-4 absolute right-0 bottom-0 lg:right-1 lg:bottom-1 bg-[#23df85]"></div>
                        </div>
                        <div className="mt-2 lg:mt-[32px] text-[16px] lg:text-[24px] font-bold text-center">Add Account</div>
                    </Link>
                </div>

            </div>
        </>
    );
}
