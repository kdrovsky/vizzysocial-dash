import { useState } from 'react';
import Header from './components/header';
import { supabase } from '../../supabaseClient';
import { X_RAPID_API_HOST, X_RAPID_API_KEY } from '../../config';
import axios from 'axios';
import { getStartingDay } from '../../components/Subscriptions';
import { uploadImageFromURL } from '../../helpers';

const ManualOnboarding = () => {
  const [setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // const handleSubmit = async (email, username, password) => {
  const handleSubmit = async () => {
    const existingUser = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('username', username)
      .single();

    if (existingUser.data) {
      console.log(`${username}; ${email} already exists`);
      // setUploading(false)
    } else {
      // const randomPassword = generateRandomPassword(); // Implement this function
      // Store the user with email and hashed password in Supabase
      const { data: newUser, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        console.log(`error authing ${email}`);
        console.error(error);
        // setUploading(false)
        // continue;
      } else {
        if (!newUser.user) {
          console.log(`no newUser ${email}`);
          // setUploading(false)
          // continue;
        }

        const first_account = true;
        const userRes = await regContd(newUser?.user, username, first_account);
        // Send randomPassword to backend for emailing
        if (userRes.status === 200 && userRes?.user) {
          const searchUser = await searchIgAccount(username);
          if (!first_account) {
            console.log(`User: ${username} has been created successfully!`);
            // continue;
          }

          if (searchUser.status === 200) {
            // await sendPasswordToUser(userRes?.user, password); // Implement this function
            console.log(
              `User: ${username} has been created successfully!. \n password: ${password}`
            );
            // continue;
          } else {
            console.log(`error updating ${username}'s ig details`);
            // setUploading(false)
            // continue;
          }
        } else {
          console.log(`error creating ${username}'s db user details`, userRes);
          // setUploading(false)
          // continue;
        }
      }
    }
  };

  // const loopF = async () => {
  //   const users = [
  //     { email: 'aflofarm@wypromujemy.com', username: 'nike', password: 'Insta123!' },
  //     { email: 'instagrand@wizzysocial.com', username: 'nike', password: 'Insta123!' },
  //     { email: 'dreamcloud@wypromujemy.com', username: 'nike', password: 'Insta123!' },
  //     { email: 'finemarketing@wypromujemy.com', username: 'nike', password: 'Insta123!' },
  //     { email: 'gaworski@wypromujemy.com', username: 'nike', password: 'Insta123!' },
  //     { email: 'instabond@wizzysocial.com', username: 'nike', password: 'Insta123!' },
  //     { email: 'instamax@wizzysocial.com', username: 'nike', password: 'Insta123!' },
  //     { email: 'lechowicz@wypromujemy.com', username: 'nike', password: 'Insta123!' },
  //     { email: 'metismedia@wypromujemy.com', username: 'nike', password: 'Insta123!' },
  //     { email: 'newaste@wypromujemy.com', username: 'nike', password: 'Insta123!' },
  //     { email: 'owskimedia@wypromujemy.com', username: 'nike', password: 'Insta123!' },
  //     { email: 'prostypr@wypromujemy.com', username: 'nike', password: 'Insta123!' },
  //     { email: 'shineon@wypromujemy.com', username: 'nike', password: 'Insta123!' },
  //     { email: 'silverpress@wypromujemy.com', username: 'nike', password: 'Insta123!' },
  //     { email: 'zegarek@wypromujemy.com', username: 'nike', password: 'Insta123!' },
  //     { email: 'wiewiorka@wizzysocial.com', username: 'nike', password: 'Insta123!' },
  //     { email: 'olivemedia@wizzysocial.com', username: 'nike', password: 'Insta123!' },
  //   ];

  //   for (const user of users) {
  //     await handleSubmit(user.email, user.username, user.password)
  //   }
  // }

  const regContd = async (newAutUser, username, first_account) => {
    if (newAutUser && username) {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          user_id: newAutUser?.id,
          email: newAutUser.email?.toLowerCase(),
          username,
          full_name: username,
          first_account,
          agency: true,
        })
        .select();

      if (error) {
        console.log(error);
        return {
          status: 500,
          message: 'User record not recorded',
          user: newUser,
        };
      } else {
        return { status: 200, message: 'success', user: newUser?.[0] };
      }
    } else {
      return { status: 500, message: 'User not found', user: newAutUser };
    }
  };

  const searchIgAccount = async (username) => {
    if (username) {
      const params = {
        ig: username,
        response_type: 'short',
        corsEnabled: 'false',
        storageEnabled: 'true',
      };
      const options = {
        method: 'GET',
        url: 'https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/ig_profile',
        params,
        headers: {
          'X-RapidAPI-Key': X_RAPID_API_KEY,
          'X-RapidAPI-Host': X_RAPID_API_HOST,
        },
      };
      const userResults = await axios.request(options);
      const vuser = userResults?.data?.[0];

      if (!vuser?.username) {
        console.log('Username not found on IG!');
        return { status: 404 };
      }

      var profile_pic_url = '';
      const uploadImageFromURLRes = await uploadImageFromURL(vuser?.username);

      if (uploadImageFromURLRes?.status === 'success') {
        profile_pic_url = uploadImageFromURLRes?.data ?? '';
      }

      const updateUser = await supabase
        .from('users')
        .update({
          username: username,
          profile_pic_url,
          followers: vuser?.follower_count,
          following: vuser?.following_count,
          posts: vuser?.media_count,
          is_verified: vuser?.is_verified,
          biography: vuser?.biography,
          start_time: getStartingDay(),
          // customer_id: '',
          // subscription_id: '',
          subscribed: true,
          status: 'active',
          userMode: 'auto',
        })
        .eq('username', username);
      if (!updateUser.error) {
        return { status: 200 };
      } else {
        console.log('updateUser?.error.message', updateUser?.error?.message);
        return { status: 500 };
      }
    }
  };

  // const sendPasswordToUser = async (user, password) => {
  //   console.log('userDetails: ', { user, password });
  //   let sendEmail = await axios
  //     .post(`${BACKEND_URL}/api/send_email`, {
  //       email: user?.email,
  //       subject: 'Onboarding',
  //       htmlContent: ONBOARDING_TEMPLATE(user?.username, user?.email, password),
  //     })
  //     .catch((err) => err);
  //   if (sendEmail.status !== 200) {
  //     console.log(sendEmail);
  //     return true;
  //   }
  //   return false;
  // };

  return (
    <div className="font-MontserratRegular max-w-[1600px] mx-auto">
      <Header
        setUsers={setUsers}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setLoading={setLoading}
        page={'manual-onboarding'}
      />

      <div className="flex flex-col justify-center w-full mt-5">
        <h1 className="mt-5 mb-6 text-center font-bold text-3xl">
          Manual Onboarding
        </h1>

        <form
          className="bg-[#eaeaea] shadow-2xl rounded-xl px-4 py-2 flex flex-col gap-4 max-w-[400px] mx-auto"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
            // loopF();
          }}
        >
          <div className="flex flex-col">
            <label className="pb-2">Username</label>
            <input
              type="text"
              placeholder="Username"
              className="bg-[#cfcfcf] text-black placeholder-[#404040] rounded-xl py-3 px-4 outline-none border-none"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
          </div>
          <div className="flex flex-col">
            <label className="pb-2">Email</label>
            <input
              type="email"
              placeholder="Email"
              className="bg-[#cfcfcf] text-black placeholder-[#404040] rounded-xl py-3 px-4 outline-none border-none"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <div className="flex flex-col">
            <label className="pb-2">Password</label>
            <input
              type="text"
              placeholder="Password"
              className="bg-[#cfcfcf] text-black placeholder-[#404040] rounded-xl py-3 px-4 outline-none border-none"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>
          <div className="flex flex-col mt-4">
            <input
              type="submit"
              value={`${loading ? 'Processing...' : 'Submit'}`}
              className="bg-black text-white rounded-xl py-3 px-4 outline-none border-none"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualOnboarding;
