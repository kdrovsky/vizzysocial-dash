/* eslint-disable */
import React, { useState, useEffect } from "react";
import Modal from "react-modal"
import { supabase } from "../supabaseClient";
import { getAccount, searchAccount } from "../helpers";
import avatarImg from "../images/default_user.png"
import { ImBin2 } from "react-icons/im"
import { BsFillPlusSquareFill } from "react-icons/bs"
import ModalAdd from "../components/ModalAdd"
import { Spinner } from "react-bootstrap";
import UserCard from "./userCard";

Modal.setAppElement('#root');

export default function Blacklist({ user, userId, page }) {
  const [blacklistAccounts, setBlacklistAccounts] = useState([]);
  const [accountName, setAccountName] = useState("");
  const [selectAccountName, setSelectedAccountName] = useState("");
  const [searchAccounts, setSearchAccounts] = useState([]);
  const [modalIsOpen, setIsOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingSpinner, setLoadingSpinner] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const insertBlacklist = async () => {
    setLoading(true);
    if (selectAccountName.length > 0) {
      const theAccount = await getAccount(selectAccountName);
      const data = {
        account: selectAccountName,
        followers: theAccount.data[0].follower_count,
        avatar: theAccount.data[0].profile_pic_url,
        user_id: userId,
        main_user_username: user.username
      }

      if (user?.first_account) {
        delete data.main_user_username
      }
      const { error } = await supabase.from("blacklist").insert(data);
      console.log(
        "🚀 ~ file: Blacklist.jsx:25 ~ const{error}=awaitsupabase.from ~ error",
        error
      );

      setAccountName("");
      setSelectedAccountName("");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accountName.length > 0) {
      setLoadingSpinner(true);
      const getData = async () => {
        const data = await searchAccount(accountName);
        setSearchAccounts(data.data[0].users);
        setLoadingSpinner(false);
      };
      getData();
    }
  }, [accountName, addSuccess]);

  useEffect(() => {
    const getTargetingAccounts = async () => {
      setLoadingSpinner(true)
      const { data, error } = await supabase
        .from("blacklist")
        .select()
        // .eq("user_id", userId)
        .eq(user?.first_account ? "user_id" : "main_user_username", user?.first_account ? user?.user_id : user?.username)
        .eq(user?.first_account ? "main_user_username" : "", user?.first_account ? 'nil' : '')
        .order('id', { ascending: false });
      error && console.log(
        "🚀 ~ file: Blacklist.jsx:46 ~ getTargetingAccounts ~ error",
        error
      );
      setBlacklistAccounts(data);
      setLoadingSpinner(false)
    };

    getTargetingAccounts();
  }, [user, userId, selectAccountName, addSuccess]);

  const subtitle = "Blacklist users that you would not like to interact with and we won't follow them when growing your account."
  const extraSubtitle = "Add accounts that you never want us to follow. Our system will ensure to avoid interacting with every user you blacklist."

  return (
    <div>

      <ModalAdd
        modalIsOpen={modalIsOpen}
        setIsOpen={setIsOpen}
        title="Add to a Blacklist"
        from='blacklist'
        subtitle={subtitle}
        extraSubtitle={extraSubtitle}
        user={user}
        userId={userId}
        setAddSuccess={setAddSuccess}
        addSuccess={addSuccess}
      />

      <div className="shadow-targeting mt-12">
        {/* nav */}
        <div className="flex justify-between px-8 pt-8">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-[28px] font-MontserratBold">Blacklist</h3>
            <div className="bg-gray20 rounded w-8 h-8 flex justify-center items-center">
              <h2 className="text-white font-MontserratSemiBold">{blacklistAccounts.length}</h2>
            </div>
            {loadingSpinner && (<Spinner animation="border" />)}
          </div>
          <div className="rounded-[4px] bg-[#D9D9D9] p-3 relative w-10 h-10 cursor-pointer" onClick={() => { setIsOpen(!modalIsOpen) }}>
            <BsFillPlusSquareFill className="absolute text-[#8C8C8C] font-semibold" />
          </div>
        </div>
        {/* body */}
        <div className="grid p-5 md:p-8 gap-4">
          {blacklistAccounts.map((item, index) => {
            return (
              <UserCard key={`blacklist_${index}`} item={item} setAddSuccess={setAddSuccess} addSuccess={addSuccess} from="blacklist" page={page} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
