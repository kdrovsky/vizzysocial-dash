import { useEffect, useState } from "react";
import { BsArrowDown, BsArrowUp } from "react-icons/bs"

const StatsCard = ({ userData, sessionsData }) => {
    // console.log(userData);
    const [_7daysGrowth, set_7daysGrowth] = useState(0)
    const [_7daysGrowthPercent, set_7daysGrowthPercent] = useState(0)
    const [_30daysGrowth, set_30daysGrowth] = useState(0)
    const [_30daysGrowthPercent, set_30daysGrowthPercent] = useState(0)
    const [total_interactions, setTotal_interactions] = useState(0)

    const [day7, setDay7] = useState(7)
    const [day30, setDay30] = useState(30)
    useEffect(() => {
        if (sessionsData.length > 0) {
            const lastData = sessionsData.slice(-1)[0]

            if (!_7daysGrowth) {
                var l7dDate = new Date(lastData?.start_time);
                var day = l7dDate.getTime() - (day7 * 24 * 60 * 60 * 1000);
                l7dDate.setTime(day);
                l7dDate = new Date(l7dDate.getFullYear(), l7dDate.getMonth() + 1, l7dDate.getDate());

                const f = sessionsData.filter(session => {
                    let a = new Date(session.start_time)
                    let b = new Date(a.getFullYear(), a.getMonth() + 1, a.getDate())
                    var l = b.getTime() === new Date(l7dDate).getTime()
                    return l
                })
                const l7d = f[0]
                if (!l7d) return setDay7(day7 - 1)

                var final = lastData?.profile?.followers - l7d?.profile?.followers
                // console.log({ final });
                set_7daysGrowth(final)
            }

            if (!_30daysGrowth){
                var l30dDate = new Date(lastData?.start_time);
                var day2 = l30dDate.getTime() - (day30 * 24 * 60 * 60 * 1000);
                l30dDate.setTime(day2);
                l30dDate = new Date(l30dDate.getFullYear(), l30dDate.getMonth() + 1, l30dDate.getDate());
    
                const f2 = sessionsData.filter(session => {
                    let a = new Date(session.start_time)
                    let b = new Date(a.getFullYear(), a.getMonth() + 1, a.getDate())
                    var l = b.getTime() === new Date(l30dDate).getTime()
                    return l
                })
                const l30d = f2[0]
                if (!l30d) return setDay30(day30 - 1)
    
                var final2 = lastData?.profile?.followers - l30d?.profile?.followers
                // console.log({ final2 });
                set_30daysGrowth(final2)
            }

            if (!total_interactions){
                var count = 0;
                for (let i = 0; i < sessionsData.length; i++) {
                    count += parseInt(sessionsData[i].total_interactions)
                }
                // setTotal_interactions(sessionsData[0]?.total_interactions)
                setTotal_interactions(count)
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionsData, day7, day30])

    // console.log(last7daysSum);
    function nFormatter(num, digits = 1) {
        // console.log(digits);
        const lookup = [
            { value: 1, symbol: "" },
            { value: 1e3, symbol: "k" },
            { value: 1e6, symbol: "M" },
            { value: 1e9, symbol: "G" },
            { value: 1e12, symbol: "T" },
            { value: 1e15, symbol: "P" },
            { value: 1e18, symbol: "E" }
        ];
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        var item = lookup.slice().reverse().find(function (item) {
            return num >= item.value;
        });
        return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
    }

    return (
        <>
            <div className="container mx-auto p-0">
                <div className="section mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-center gap-6">
                    <div className="shadow-stats flex flex-col items-center lg:items-start rounded-lg p-4">
                        <div className="flex gap-[10px]">
                            <div className="rounded-[50%] bg-bgicongreen p-3 relative w-10 h-10">
                                <BsArrowUp className="absolute text-btngreen font-semibold" />
                            </div>
                            <h2 className="font-bold text-[28px] font-MontserratBold text-gray20">Status</h2>
                        </div>
                        <p className="pt-4 pb-4 font-normal text-sm font-MontserratRegular text-center lg:text-start w-full">Your status is <span className="font-bold font-MontserratSemiBold">{userData?.status}</span></p>
                        <p className="font-normal text-sm opacity-90 font-MontserratLight text-center lg:text-start">
                            {userData?.status === 'checking' && <span>We're checking your password right now</span>}
                            {userData?.status === 'pending' && <span>Please <span className="text-red-600">input your password</span> in order to allow us to log in.</span>}
                            {userData?.status === 'paused' && 'Please contact support or renew your plan'}
                            {userData?.status === 'cancelled' && 'Your subscription is prolly cancelled.'}
                            {userData?.status === 'active' && 'Your status is Active.'}
                        </p>
                    </div>
                    <div className="shadow-stats flex flex-col items-center lg:items-start rounded-lg p-4">
                        <div className="flex gap-[10px]">
                            {_7daysGrowth >= 0 ?
                                <div className="rounded-[50%] bg-bgicongreen p-3 relative w-10 h-10">
                                    <BsArrowUp className="absolute text-btngreen font-semibold" />
                                </div>
                                :
                                <div className="rounded-[50%] bg-bgiconred p-3 relative w-10 h-10">
                                    <BsArrowDown className="absolute text-btnred font-semibold" />
                                </div>
                            }

                            {_7daysGrowth >= 0 ?
                                <h2 className="font-bold text-[30px] text-gray20 -mr-3">+</h2>
                                :
                                <h2 className="font-bold text-[30px] text-gray20 -mr-3">-</h2>
                            }
                            <h2 className="font-bold text-[30px] text-gray20">{nFormatter(Math.abs(_7daysGrowth)) || 'NAN'}</h2>
                        </div>
                        <p className="pt-4 pb-4 font-normal text-sm font-MontserratRegular text-center lg:text-start w-full">Last <span className="font-MontserratSemiBold font-bold">7 days</span> Follower Growth</p>
                        <p className="font-normal text-sm opacity-90 font-MontserratLight text-center lg:text-start"><span className="font-bold hidden">{_7daysGrowthPercent}</span>How much followers your account received in the last 7 days period.</p>
                    </div>
                    <div className="shadow-stats flex flex-col items-center lg:items-start rounded-lg p-4">
                        <div className="flex gap-[10px]">
                            {_30daysGrowth >= 0 ?
                                <div className="rounded-[50%] bg-bgicongreen p-3 relative w-10 h-10">
                                    <BsArrowUp className="absolute text-btngreen font-semibold" />
                                </div>
                                :
                                <div className="rounded-[50%] bg-bgiconred p-3 relative w-10 h-10">
                                    <BsArrowDown className="absolute text-btnred font-semibold" />
                                </div>
                            }

                            {_30daysGrowth >= 0 ?
                                <h2 className="font-bold text-[30px] text-gray20 -mr-3">+</h2>
                                :
                                <h2 className="font-bold text-[30px] text-gray20 -mr-3">-</h2>
                            }
                            <h2 className="font-bold text-[30px] text-gray20">{nFormatter(Math.abs(_30daysGrowth)) || 'NAN'}</h2>
                        </div>
                        <p className="pt-4 pb-4 font-normal text-sm font-MontserratRegular text-center lg:text-start w-full">Last <span className="font-MontserratSemiBold font-bold">30 days</span> Follower Growth</p>
                        <p className="font-normal text-sm opacity-90 font-MontserratLight text-center lg:text-start"><span className="font-bold hidden">{_30daysGrowthPercent}</span>How much followers your account received in the last 30 days period.</p>
                    </div>
                    <div className="shadow-stats flex flex-col items-center lg:items-start rounded-lg p-4">
                        <div className="flex gap-[10px]">
                            <div className="rounded-[50%] bg-bgicongreen p-3 relative w-10 h-10">
                                <BsArrowUp className="absolute text-btngreen font-semibold" />
                            </div>
                            <h2 className="font-bold text-[30px] text-gray20">{nFormatter(total_interactions)}</h2>
                        </div>
                        <p className="pt-4 pb-4 font-normal text-sm font-MontserratRegular text-center lg:text-start w-full"><span className="font-bold">Total</span> Interactions</p>
                        <p className="font-normal text-sm opacity-90 font-MontserratLight text-center lg:text-start">Total interactions made by your personal manager on the account.</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default StatsCard