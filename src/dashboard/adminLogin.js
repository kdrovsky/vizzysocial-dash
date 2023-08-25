import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import sproutyLogo from "../images/sprouty.svg"

export default function AdminLogin() {
    //   const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // useEffect(() => {
    //     const getData = async () => {
    //         const { data: { user } } = await supabase.auth.getUser()
    //         if (user) return navigate(`/dashboard`)
    //     };

    //     getData();
    // }, [navigate]);

    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (data.user) {
            const dbUser = await supabase
                .from('users')
                .select()
                .eq("user_id", data.user.id)
                .eq('first_account', true)

            dbUser.error && console.console.log(error);
            if (!dbUser.data[0]?.admin) {
                alert("You are not an admin!")
                window.location = `/dashboard/${data.user?.id}`;
                return;
            }
            // window.location = `/dashboard`;
            navigate(`/dashboard`)
        }
        if (error) console.log(error.message);
        if (error.message === 'Invalid login credentials') {
            alert(`${error.message}, please check your credentials and try again`);
            return;
        }
        if (error?.message === `Cannot read properties of null (reading 'id')`) {
            alert('User not found please try again or register')
        } else {
            alert('An error occurred, please try again')
        }
    }

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="shadow-2-strong p-5">
                <div className="flex flex-col justify-center items-center pb-10">
                    <img className="w-48 h-40 mt-10 lg:mt-14" src={sproutyLogo} alt="sprouty social" />
                    <h5 className="font-bold text-[40px] text-gray20">Login to dashboard</h5>
                </div>
                <form action="" className="flex flex-col items-center justify-start">
                    <div className="form-outline mb-4">
                        <input
                            type="email"
                            id="form2Example1"
                            className="bg-inputbkgrd rounded-[10px] py-4 px-4 w-80"
                            value={email}
                            placeholder="Email Address"
                            onChange={({ target }) => setEmail(target.value)}
                        />
                    </div>

                    <div className="form-outline mb-4">
                        <input
                            type="password"
                            id="form2Example2"
                            className="bg-inputbkgrd rounded-[10px] py-4 px-4 w-80"
                            value={password}
                            placeholder="Password"
                            onChange={({ target }) => setPassword(target.value)}
                        /> <br />
                        <Link to="#"><span className="text-primaryblue font-extrabold text-sm opacity-40 mt-2">Forgot Password?</span></Link>
                    </div>

                    <button
                        type="button"
                        className="bg-primaryblue rounded-[10px] py-2 px-6 text-slate-50 font-semibold text-base mb-1"
                        onClick={() => handleLogin()}
                    >
                        Sign In Now
                    </button>
                </form>
            </div>
        </div>
    );
}
