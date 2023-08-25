// /* eslint-disable */
import React, { useEffect, useState } from "react";
import Modal from 'react-modal';
// import { searchAccount } from "../helpers";
import { supabase } from "../supabaseClient";
import { BsFillPlusSquareFill } from "react-icons/bs"
import ModalAdd from "./ModalAdd";
import { Spinner } from "react-bootstrap";
import UserCard from "./userCard";

Modal.setAppElement('#root');

export default function Targeting({ user, userId, page }) {
  const [targetingAccounts, setTargetingAccounts] = useState([]);
  // const [radioValue, setRadioValue] = useState("Account");
  // const [accountName, setAccountName] = useState("");
  // const [selectAccountName, setSelectedAccountName] = useState("");
  // const [searchAccounts, setSearchAccounts] = useState([]);
  const [modalIsOpen, setIsOpen] = useState(false);

  // const [loading, setLoading] = useState(false);
  const [loadingSpinner, setLoadingSpinner] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  // useEffect(() => {
  //   if (accountName.length > 0) {
  //     setLoadingSpinner(true);
  //     const getData = async () => {
  //       const data = await searchAccount(accountName);
  //       setSearchAccounts(data.data[0].users ?? [{ username: "" }]);
  //       setLoadingSpinner(false);
  //     };
  //     getData();
  //   }
  // }, [accountName, addSuccess]);

  useEffect(() => {
    const getTargetingAccounts = async () => {
      setLoadingSpinner(true)
      const { data, error } = await supabase
        .from("targeting")
        .select()
        // .eq("user_id", userId)
        .eq(user?.first_account ? "user_id" : "main_user_username", user?.first_account ? user?.user_id : user?.username)
        .eq(user?.first_account ? "main_user_username" : "", user?.first_account ? 'nil' : '')
        .order('id', { ascending: false });

      if(error) return console.log(error);
      setTargetingAccounts(data);
      setLoadingSpinner(false)
    };

    getTargetingAccounts();
  }, [user, userId, addSuccess]);

  const subtitle = "Set up your targeting by adding relevant username of an account."
  const extraSubtitle = "Add Accounts to use as sources for your targeting. Adding accounts as targets will interact with users who follow that account. For optimal results, aim for a follow-back rate of 15%+ across all targets."

  return (
    <>
      <ModalAdd
        modalIsOpen={modalIsOpen}
        setIsOpen={setIsOpen}
        title="Add a Target"
        from='targeting'
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
            <h3 className="font-bold text-[28px] font-MontserratBold">Targeting</h3>
            <div className="bg-gray20 rounded w-8 h-8 flex justify-center items-center">
              <h2 className="text-white font-MontserratSemiBold">{targetingAccounts?.length} </h2>
            </div>
            {loadingSpinner && (<Spinner animation="border" />)}
          </div>
          <div className="flex gap-3 text-black">
            <div className="rounded-[4px] bg-[#D9D9D9] p-3 relative w-10 h-10 cursor-pointer" onClick={() => { setIsOpen(!modalIsOpen) }}>
              <BsFillPlusSquareFill className="absolute text-[#8C8C8C] font-semibold" />
            </div>
          </div>
        </div>
        {/* body */}
        <div className="grid p-5 md:p-8 gap-4">
          {targetingAccounts.map((item, index) => {
            // console.log(item);
            return (
              <UserCard key={`targeting_${index}`} item={item} setAddSuccess={setAddSuccess} addSuccess={addSuccess} from="targeting" page={page} />
            );
          })}
        </div>
      </div>
    </>
  );
}
