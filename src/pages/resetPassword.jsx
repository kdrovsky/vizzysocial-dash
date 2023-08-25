import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ResetPassword() {
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [cPassword, setCPassword] = useState("");
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault()
        if (password !== cPassword) return alert('password must be the same')
        setLoading(true)
        const { data, error } = await supabase.auth.updateUser({ password })
        setLoading(false)

        if (data) alert("Password updated successfully!")
        if (data?.user) return navigate(`/login`)
        if (error) alert("There was an error updating your password.")
    }

    return (<>
        <div id="affiliateScript"></div>

        <div className="flex flex-col items-center justify-center h-screen">
            <div className="p-5 rounded-lg shadow-lg">
                <div className="flex flex-col items-center justify-center pb-10">
                    {/* <img className="w-48 h-40 mt-10 lg:mt-14" src={sproutyLogo} alt="sprouty social" /> */}
                    <div className="font-MADEOKINESANSPERSONALUSE text-[28px]"><strong className="text-[25px] text-left">SPROUTYSOCIAL</strong></div>
                    <hr className="mb-7 w-full border-[#ef5f3c]" />

                    <h5 className="font-bold text-[2.625rem] text-black font-MADEOKINESANSPERSONALUSE">Forgot Password?</h5>
                    <p className="text-center text-[0.75rem] font-MontserratRegular text-[#333] max-w-[320px]">Enter your new password below to reset your password.</p>
                </div>
                <form action="" className="flex flex-col items-center justify-start" onSubmit={handleResetPassword}>
                    <div className="mb-4 form-outline">
                        <input
                            type="password"
                            id="form2Example1"
                            className="rounded-[10px] py-4 px-4 w-80 text-[1.25rem] bg-transparent border shadow-[inset_0_0px_2px_rgba(0,0,0,0.4)]"
                            value={password}
                            placeholder="Password"
                            onChange={({ target }) => setPassword(target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4 form-outline">
                        <input
                            type="password"
                            id="form2Example2"
                            className="rounded-[10px] py-4 px-4 w-80 text-[1.25rem] bg-transparent border shadow-[inset_0_0px_2px_rgba(0,0,0,0.4)]"
                            value={cPassword}
                            placeholder="Password"
                            onChange={({ target }) => setCPassword(target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="text-white font-MontserratSemiBold text-[16px] mt-[14px] mb-[12px] rounded-[5px] py-2 px-6 h-[52px] w-80 font-semibold"
                        style={{
                            backgroundColor: '#ef5f3c',
                            color: 'white',
                            boxShadow: '0 20px 30px -12px rgb(255 132 102 / 47%)'
                        }}
                    >
                        {loading ? "loading..." : "Continue"}
                    </button>
                </form>

                <div className="text-center font-MontserratSemiBold">
                    <p className="font-bold text-sm text-[#333]">
                        Go back to <Link to="/SignUp"><span className="text-[#1b89ff]">Sign Up</span></Link>
                    </p>
                </div>
                <br /><br />
            </div>
        </div>
    </>
    );
}
