import React, { useState, useEffect } from "react";
import { Col, Form } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { IoClose } from 'react-icons/io5';
import MultiRangeSlider from "multi-range-slider-react";
import { FaMagic } from "react-icons/fa"
import "../modalsettings.css"
import "../MultiRangeSlider.css"
import { supabase } from "../supabaseClient";


export default function TargetingFilterModal(props, { min, max }) {
  // const stored = {
  //   followerMin: parseInt(localStorage.getItem('followerMinValue'), 10) || 1,
  //   followerMax: parseInt(localStorage.getItem('followerMaxValue'), 10) || 20000,
  //   followingMin: parseInt(localStorage.getItem('followingMinValue'), 10) || 1,
  //   followingMax: parseInt(localStorage.getItem('followingMaxValue'), 10) || 10000,
  //   mediaMin: parseInt(localStorage.getItem('mediaMinValue'), 10) || 1,
  //   mediaMax: parseInt(localStorage.getItem('mediaMaxValue'), 10) || 1000,
  // }
  const { setFilterModal, filtermodal, user, user_id,
    followerMinValued, followerMaxValued, followingMinValued, followingMaxValued, mediaMinValued, mediaMaxValued, margicd, privacyd, genderd, langd } = props;

  const [followerMinValue, setFollowerMinValue] = useState(followerMinValued);
  const [followerMaxValue, setFollowerMaxValue] = useState(followerMaxValued);
  const [followingMinValue, setFollowingMinValue] = useState(followingMinValued);
  const [followingMaxValue, setFollowingMaxValue] = useState(followingMaxValued);
  const [mediaMinValue, setMediaMinValue] = useState(mediaMinValued);
  const [mediaMaxValue, setMediaMaxValue] = useState(mediaMaxValued);
  const [margic, setMargic] = useState(margicd || true);
  const [privacy, setPrivacy] = useState(privacyd || 'All');
  const [gender, setGender] = useState(genderd || 'All');
  const [lang, setLang] = useState(langd || 'All');

  useEffect(() => {
    const fetch = async () => {
      // re-fetch user information because it might have changed while this is not updated
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq("user_id", user?.user_id).eq("username", user?.username).order('created_at', { ascending: false })

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
      error && console.log(error);
    }
    if (user_id) {
      // console.log(user_id);
      fetch();
    }
  }, [user_id, user, filtermodal])

  const handleSaveAndClose = async () => {
    const targetingFilter = {
      "followersMin": followerMinValue,
      "followersMax": followerMaxValue,
      "followingMin": followingMinValue,
      "followingMax": followingMaxValue,
      "mediaMin": mediaMinValue,
      "mediaMax": mediaMaxValue,
      "privacy": privacy,
      "gender": gender,
      "lang": lang,
      "margicFilter": margic
    }
    
    const { error } = await supabase
      .from('users')
      .update({ targetingFilter })
      .eq("user_id", user?.user_id).eq("username", user?.username)
    error && console.log(error);
    setFilterModal(false);
  }

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header id="custom-header" closeButton={false}>
        <div className="flex flex-col">
          <Modal.Title className="font-bold text-[20px] mb-2 font-MontserratBold">Targeting Filters</Modal.Title>
          <p className="font-bold text-sm opacity-90 text-[#333] w-full font-MontserratRegular">
            Here you can add preferences for your ideal follower. Before any follow or like we do, target will be checked if it complies to your liking.
          </p>
        </div>
        <div className="flex justify-end cursor-pointer">
          <IoClose
            className="text-[30px] text-[#8c8c8c]"
            onClick={() => setFilterModal(false)}
          />
        </div>
      </Modal.Header>

      <Modal.Body>
        <>
          <div className="grid w-full grid-cols-1 gap-12 p-3 lg:grid-cols-2 font-MontserratRegular">
            <div className="flex flex-col justify-content-between">
              <div className="flex flex-col w-[80%] relative">
                <label className="text-base font-semibold font-MontserratSemiBold">Followers</label>
                <div className="relative mrslider">
                  <div className={`${margic ? "bg-[#23DF85]" : "bg-gray-600"} rounded-[10px]  p-2 w-8 h-8 cursor-pointer absolute top-[12%] -right-[23%]`} onClick={() => { setMargic(!margic) }}>
                    <FaMagic className="text-white" />
                  </div>
                  <MultiRangeSlider
                    min={1}
                    max={20000}
                    minValue={followerMinValue}
                    maxValue={followerMaxValue}
                    // step={100}
                    // onInput={(e) => { }}
                    onChange={(e) => {
                      setFollowerMinValue(e.minValue);
                      setFollowerMaxValue(e.maxValue);
                    }}
                    label={true}
                    ruler={false}
                  />

                </div>
              </div>

              <div className="flex flex-col w-[80%]">
                <label className="mt-4 text-base font-semibold font-MontserratSemiBold">Following</label>
                <div className="relative mrslider">
                  <div className={`${margic ? "bg-[#23DF85]" : "bg-gray-600"} rounded-[10px]  p-2 w-8 h-8 cursor-pointer absolute top-[12%] -right-[23%]`} onClick={() => { setMargic(!margic) }}>
                    <FaMagic className="text-white" />
                  </div>
                  <MultiRangeSlider
                    min={1}
                    max={7500}
                    minValue={followingMinValue}
                    maxValue={followingMaxValue}
                    // step={100}
                    // onInput={(e) => { }}
                    onChange={(e) => {
                      setFollowingMinValue(e.minValue);
                      setFollowingMaxValue(e.maxValue);
                    }}
                    label={true}
                    ruler={false}
                  />
                </div>
              </div>
              <div className="flex flex-col w-[80%]">
                <label className="mt-4 text-base font-semibold font-MontserratSemiBold">Media</label>
                <div className="relative mrslider">
                  <div className={`${margic ? "bg-[#23DF85]" : "bg-gray-600"} rounded-[10px]  p-2 w-8 h-8 cursor-pointer absolute top-[12%] -right-[23%]`} onClick={() => { setMargic(!margic) }}>
                    <FaMagic className="text-white" />
                  </div>
                  <MultiRangeSlider
                    min={1}
                    max={1000}
                    minValue={mediaMinValue}
                    maxValue={mediaMaxValue}
                    // step={100}
                    // onInput={(e) => { }}
                    onChange={(e) => {
                      setMediaMinValue(e.minValue);
                      setMediaMaxValue(e.maxValue);
                    }}
                    label={true}
                    ruler={false}
                  />
                </div>
              </div>

              <button
                className={`${margic ? "bg-[#23DF85]" : "bg-gray-600"} font-MontserratSemiBold w-full mt-5 rounded-[10px] py-4 text-base text-white font-bold`}
                onClick={() => { setMargic(!margic) }}
              >Magic Filters: {margic ? 'ON' : 'OFF'}</button>
            </div>

            <Col>
              <div>
                <label className="font-medium font-MontserratSemiBold text-[15px] mb-2">Privacy</label>
                <Form.Select className="shadow-filter mb-6 rounded-[10px] pl-5 font-MontserratRegular" aria-label="Privacy"
                  value={privacy}
                  // defaultValue={privacy}
                  onChange={(e) => {
                    setPrivacy(e.target.value);
                  }}
                >
                  <option value="All">All</option>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </Form.Select>
              </div>

              <div>
                <label className="font-medium font-MontserratSemiBold text-[15px] mb-2">Gender</label>
                <Form.Select className="shadow-filter mb-6 rounded-[10px] pl-5 font-MontserratRegular" aria-label="Gender"
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value);
                  }}
                >
                  <option value="All">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </Form.Select>
              </div>

              <div>
                <label className="font-medium font-MontserratSemiBold text-[15px] mb-2">Language</label>
                <Form.Select className="shadow-filter rounded-[10px] pl-5" aria-label="Privacy"
                  value={lang}
                  onChange={(e) => {
                    setLang(e.target.value);
                  }}
                >
                  {/* <option>Open this select menu</option> */}
                  <option value="All">All</option>
                  <option value="English">English</option>
                  <option value="French">French</option>
                </Form.Select>
              </div>

              <div>
                <button className="bg-secondary font-MontserratSemiBold w-full mt-10 rounded-[10px] py-4 text-base text-white font-bold"
                  onClick={handleSaveAndClose}
                >
                  Save And Close
                </button>
              </div>
            </Col>
          </div>
        </>
      </Modal.Body>
    </Modal>
  );
}