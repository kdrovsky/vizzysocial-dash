import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Blacklist from '../components/Blacklist';
import SettingsModal from '../components/SettingsModal';
import Targeting from '../components/Targeting';
import Whitelist from '../components/Whitelist';
import { supabase } from '../supabaseClient';
import profileImg from "../images/profile.svg"
import settingsImg from "../images/settings.svg"
import { useCallback } from 'react';
import TargetingFilterModal from '../components/TargetingFilterModal';
import ChartSection from '../components/ChartSection';
import { numFormatter } from '../helpers';

const Error = ({ value }) => {
    return (
        <aside style={{ color: "red" }} className="px-3 py-4 px-sm-5">
            The account @{value} was not found on Instagram.
        </aside>
    );
};

export default function Edit() {
    let { username } = useParams();
    const navigate = useNavigate();
    // const [userAuth, setUserAuth] = useState(null)
    const [user, setUser] = useState(null)
    const [error, setError] = useState(false);
    const [modalIsOpen, setIsOpen] = useState(false)
    const [filterModal, setFilterModal] = useState(false);
    const [sessionsData, setSessionsData] = useState([])

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
    const [refreshUser, setRefreshUser] = useState(true)

    useEffect(() => {
        const getData = async () => {
            // const { data: { userAuth }, error} = await supabaseAdmin.auth.admin.getUserById(id)
            // error && console.log(error);
            // // if (!userAuth) return navigate('/dashboard')
            // setUserAuth(userAuth)

            const { data, error } = await supabase
                .from('users')
                .select()
                .eq('username', username).order('created_at', { ascending: false })

            // console.log(data[0]);
            if (data?.[0]) {
                setUser(data?.[0])
                setFollowerMinValue(data?.[0]?.targetingFilter?.followersMin);
                setFollowerMaxValue(data?.[0]?.targetingFilter?.followersMax);
                setFollowingMinValue(data?.[0]?.targetingFilter?.followingMin);
                setFollowingMaxValue(data?.[0]?.targetingFilter?.followingMax);
                setMediaMinValue(data?.[0]?.targetingFilter?.mediaMin);
                setMediaMaxValue(data?.[0]?.targetingFilter?.mediaMax);

                setMargic(data?.[0]?.targetingFilter?.margicFilter || true);
                setPrivacy(data?.[0]?.targetingFilter?.privacy || 'All');
                setGender(data?.[0]?.targetingFilter?.gender || 'All');
                setLang(data?.[0]?.targetingFilter?.lang || 'All');
            }
            setError(error)
        };

        getData();
    }, [username, navigate, refreshUser]);

    const setFilterModalCallback = useCallback(() => {
        setFilterModal(!filterModal);
    }, [filterModal]);

    useEffect(() => {
        const username = user?.username;
        const fetch = async () => {
            const resData = await supabase
                .from('sessions')
                .select()
                .eq('username', username)
            resData.error && console.log(resData.error);
            var d = resData.data[0].data
            try {
                const c = JSON.parse(resData.data[0].data);
                if (c) { d = c }
            } catch (error) {
                console.log(error);
            }
            // console.log(d);
            setSessionsData(d)
        }
        if (username) {
            fetch()
        }
    }, [user])

    if (error) return <Error value={username} />;
    return (
        <div className="max-w-[1600px] md:min-w-[500px] mx-auto bg-white">
            <div className="flex flex-col items-center w-full py-20">
                <SettingsModal
                    show={modalIsOpen}
                    onHide={() => setIsOpen(false)}
                    modalIsOpen={modalIsOpen}
                    setIsOpen={setIsOpen}
                    user={user}
                    u={'admin'}
                    setRefreshUser={setRefreshUser}
                />

                <TargetingFilterModal
                    show={filterModal}
                    onHide={() => setFilterModal(false)}
                    setFilterModal={setFilterModal}
                    filtermodal={filterModal}
                    user={user}
                    user_id={username}
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
                <div className="flex items-center gap-4">
                    <img className="bg-[#D9D9D9] p-3 rounded-[4px]" src={profileImg} alt="" onClick={() => { setIsOpen(!modalIsOpen) }} />
                    <img className="bg-[#D9D9D9] p-3 rounded-[4px]" src={settingsImg} alt="" onClick={setFilterModalCallback} />
                </div>

                <div className="flex items-center justify-center gap-6 mt-6 mb-4 lg:justify-start lg:gap-14 md:mb-8">
                    <div className="flex flex-col items-center justify-center">
                        <h2 className="font-semibold text-[20px] md:text-[28px] text-gray20 font-MontserratBold">{numFormatter(user?.followers ? user?.followers : 0)}</h2>
                        <p className="text-sm font-normal opacity-90 font-MontserratLight">Followers</p>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                        <h2 className="font-semibold text-[20px] md:text-[28px] text-gray20 font-MontserratBold">{numFormatter(user?.following ? user?.following : 0)}</h2>
                        <p className="text-sm font-normal opacity-90 font-MontserratLight">Following</p>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                        <h2 className="font-semibold text-[20px] md:text-[28px] text-gray20 font-MontserratBold">{numFormatter(user?.posts ? user?.posts : 0)}</h2>
                        <p className="text-sm font-normal opacity-90 font-MontserratLight">Posts</p>
                    </div>
                </div>

                <div className="w-[80vw]">
                    <ChartSection
                        sessionsData={sessionsData}
                        isPrivate={false}
                    />
                </div>

                <Targeting user={user} userId={username} page={'admin'} />
                <Blacklist user={user} userId={username} page={'admin'} />
                <Whitelist user={user} userId={username} page={'admin'} />
            </div>
        </div>
    )
}
