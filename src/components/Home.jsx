import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) return navigate(`/dashboard/${user?.id}`)
    };

    getData();
  }, [navigate]);

  return (
    <div className="container text-center mt-5">
      <h1>Grow your Instagram with 100% Real Followers</h1>
      <button className="text-lg font-normal w-[300px] py-3 text-white bg-primaryblue mt-5 rounded-xl" onClick={() => navigate("/signUp") } >START FREE TRIAL</button>
    </div>
  );
}
