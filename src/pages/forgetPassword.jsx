import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function ForgetPassword() {
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) return navigate(`/dashboard/${user?.id}`)
        };

        getData();
    }, [navigate]);

    const handleSendResetLink = async (e) => {
        e.preventDefault()
        // console.log(window.location.origin + '/reset-password');
        // return;
        setLoading(true)
        if (!email) return alert()
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password',
        })

        setLoading(false)
        if (error) {
            console.log(error.message);
            if (error?.message === `Cannot read properties of null (reading 'id')`) {
                alert('User not found please try again or register')
            } else {
                console.log({ error });
                console.log('message: ', error.message);
                alert('An error occurred, please try again')
            }
        } else {
            setPage(1)
        }
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
                    <p className="text-center text-[0.75rem] font-MontserratRegular text-[#333] max-w-[320px]">Enter your email address and we will send you instructions to reset your password.</p>
                </div>
                {page === 0 ?
                    <>
                        <form action="" className="flex flex-col items-center justify-start" onSubmit={handleSendResetLink}>
                            <div className="mb-4 form-outline font-MontserratRegular">
                                <input
                                    type="email"
                                    id="form2Example1"
                                    className="rounded-[10px] py-4 px-4 w-80 text-[1.25rem] bg-transparent border shadow-[inset_0_0px_2px_rgba(0,0,0,0.4)]"
                                    value={email}
                                    placeholder="Email Address"
                                    onChange={({ target }) => setEmail(target.value)}
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
                                {loading ? "loading..." : 'Continue'}
                            </button>
                        </form>

                        <div className="text-center font-MontserratSemiBold">
                            <p className="font-bold text-sm text-[#333]">
                                Go back to <Link to="/SignUp"><span className="text-[#1b89ff]">Sign Up</span></Link>
                            </p>
                        </div>
                    </> :
                    <p className="font-bold text-sm text-[#333]">
                        The instructions to reset your password has been sent to your email address please check.
                    </p>
                }
                <br /><br />
            </div>
        </div>
    </>
    );
}
