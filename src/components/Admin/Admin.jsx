import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
// import { updateUserProfilePicUrl } from "../../helpers";
import { supabase } from "../../supabaseClient";
import Nav from "../Nav";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";

export default function Admin() {
  const navigate = useNavigate();
  const [fetchingUser, setFetchingUser] = useState(true)
  const [files, setFiles] = useState([]);
  const [Loading, setLoading] = useState(false);
  const [reading, setReading] = useState(false);

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

  let receipts = [];
  let receiptsRead = [];
  let currentReceipt = null;
  var list = []

  const receiptReader = new FileReader();
  receiptReader.onloadend = (e) => {
    // const loadSucceeded = (e.error === undefined) ? true : false;
    // console.log(`${currentReceipt.name}: ${e.loaded} of ${e.total} loaded. success: ${loadSucceeded}`);
    const data = JSON.parse(e.target.result)
    list.push({ data, username: data?.[0]?.args?.username })
    receiptsRead.push(currentReceipt);
    readNextReceipt();
  };

  function readNextReceipt() {
    if (receiptsRead.length < receipts.length) {
      currentReceipt = receipts[receiptsRead.length];
      // receiptReader.readAsArrayBuffer(currentReceipt);
      receiptReader.readAsText(currentReceipt, "UTF-8");
    } else {
      // console.log('All receipts have been read.');
      setReading(false)
      setFiles(list);
    }
  }

  const handleChange = e => {
    setReading(true)
    receipts = e.target.files;
    receiptsRead = [];

    console.log('Reading receipts...');
    readNextReceipt();
  };


  const handleUploadSessionFile = async () => {
    setLoading(true);
    await files.reduce(async (ref, file) => {
      await ref;
      const username = file?.username
      try {
        const data = file?.data
        let lastItem = data[data?.length - 1];
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();

        const updateUser = await supabase
          .from("users")
          .update({
            followers: lastItem.profile.followers,
            following: lastItem.profile.following,
            posts: lastItem.profile.posts,
            total_interactions: lastItem.total_interactions,
            session_updated_at: `${year}-${month}-${day}`
          }).eq('username', username);

        updateUser.error && console.log(updateUser.error);
      } catch (error) {
        console.log(error);
      }

      const { error } = await supabase
        .from("sessions")
        .upsert({
          username,
          data: file.data
        })
      error && console.log(error);
      console.log(username);
      // console.log(file);
    }, Promise.resolve());



    alert('Upload successfull!');
    document.getElementById('input').value = '';
    setFiles([])
    setLoading(false);
  }

  if (fetchingUser){
    return (<>
    Loading...
    </>)
  }


  return (<>
    <Nav />
    <div className="flex flex-col h-screen">
      <div className="w-[250px]">
        <h1 className="mb-5">Upload session file (Json)</h1>

        <div className="flex items-center gap-5">
          <input type="file" id="input" onChange={handleChange} multiple accept="application/JSON" />
          {reading && (<Spinner animation="border" />)}
        </div>

        <button className={`${files.length > 0 ? 'bg-secondaryblue' : 'bg-gray-600'} w-full mt-4 rounded-[10px] py-4 text-base text-white font-bold`}
          onClick={handleUploadSessionFile}
        >
          {Loading ? "Loading " : "Upload"}
        </button>
      </div>
    </div>
  </>);
}
