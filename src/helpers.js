// import Axios from 'axios'
import axios from "axios"
import _ from 'lodash';
// import { slackClient } from "./slackClient";
import { supabase } from "./supabaseClient"
import { BACKEND_URL, SCRAPER_API_URL, X_RAPID_API_HOST, X_RAPID_API_KEY } from "./config";

export const numFormatter = (num = 0) => {
  if (num > 999 && num <= 999949) {
    return `${(num / 1000).toFixed(1)}k`
  }

  if (num > 999949) {
    return `${(num / 1000000).toFixed(1)}m`
  }

  if (num === 0) return 0

  if (num) {
    return num
  }
}

export const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const months = [
  { month: "Jan", days: 31 },
  { month: "Feb", days: 28 },
  { month: "Mar", days: 31 },
  { month: "Apr", days: 30 },
  { month: "May", days: 31 },
  { month: "Jun", days: 30 },
  { month: "Jul", days: 31 },
  { month: "Aug", days: 31 },
  { month: "Sep", days: 30 },
  { month: "Oct", days: 31 },
  { month: "Nov", days: 30 },
  { month: "Dec", days: 31 },
]

export const dateFormatter = (timeFrame) => {
  const getPrevDay = () => {
    // if the day is 0 that means need to the get the last day of the the previous month

    let prevMonth // will be obj

    if (!months[today.getMonth() - 1].month) {
      prevMonth = months[months.length - 1]
      previousMonth = prevMonth.month
    } else {
      prevMonth = months[today.getMonth() - 1].month
    }
    return prevMonth
  }

  const today = new Date()
  console.log("🚀 ~ file: helpers.js:42 ~ dateFormatter ~ today", today)

  let previousMonth
  let currentDate
  let previousDate

  if (timeFrame === "Monthly") {
    // ex. Month ---  Mar
    currentDate = `${months[today.getMonth()].month}`
    previousDate = `${months[today.getMonth() - 1].month
      ? months[today.getMonth() - 1].month
      : "Dec"
      }`
  } else if (timeFrame === "Daily") {
    // ex. Day and Month ---  25 Mar
    currentDate = `${today.getDate()} ${months[today.getMonth()].month}`
    previousDate = `${today.getDate() - 1 ? today.getDate() - 1 : getPrevDay().days
      } ${previousMonth ? previousMonth : months[today.getMonth()].month}`
  }

  return [previousDate, currentDate]
}

export const getRateDiff = (currRate, prevRate) => {
  //get percentage value
  let percent = (currRate / prevRate) * 100

  // if 'percent' is more than a 100, it means there was an increase from the previous value
  if (percent > 100) {
    // subtract from 100 to get the value of by HOW MUCH the current value increased
    return {
      change: "more",
      value: percent - 100,
    }
  }

  // if 'percent' is less than a 100, it means there was an DECREASE from the previous value
  if (percent < 100) {
    // get the value of by HOW MUCH it decreased compared to the before value
    return {
      change: "less",
      value: 100 - percent,
    }
  }

  // if 'percent' is equal to 100, there was no change from previous value
  if (percent === 100) {
    return null
  }
}

export const countDays = (day) => {
  var today = new Date()
  var dd = String(today.getDate()).padStart(2, "0")
  var mm = String(today.getMonth() + 1).padStart(2, "0") //January is 0!
  var yyyy = today.getFullYear()

  today = yyyy + "-" + mm + "-" + dd

  if (today === day) return "today"

  var date1 = new Date(day)
  var date2 = new Date(today)
  var Difference_In_Time = date2.getTime() - date1.getTime()
  var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24)

  return Difference_In_Days === 1
    ? "one day ago"
    : Difference_In_Days + " days ago"
}

export const getAccount = async (account) => {
  const options = {
    method: "GET",
    url: SCRAPER_API_URL,
    params: { ig: account, response_type: "short", corsEnabled: "true" },
    headers: {
      "X-RapidAPI-Key": X_RAPID_API_KEY,
      "X-RapidAPI-Host": X_RAPID_API_HOST,
    },
  }

  const userResults = await axios.request(options)

  return userResults
}

export const searchAccount = _.memoize(async (username) => {
  const options = {
    method: "GET",
    url: SCRAPER_API_URL,
    // params: { ig: username, response_type: "search", corsEnabled: "true", storageEnabled: "true" },
    params: { ig: username, response_type: "search", corsEnabled: "true" },
    headers: {
      "X-RapidAPI-Key": X_RAPID_API_KEY,
      "X-RapidAPI-Host": X_RAPID_API_HOST,
    },
  }

  const request = await axios.request(options).catch(err => console.log(err))
  return request?.data?.[0]
})

export const updateUserProfilePicUrl = async (user, from) => {
  try {
    const username = from ? user.account : user.username;
    // console.log(username, from);
    if (username) {
      const userResults = await instabulkProfileAPI(username)
      // console.log(userResults?.data[0]?.username);
      if (!userResults?.data[0]?.username) return console.log('User account not found!: ', username, ' =>: ', userResults?.data[0]?.username);
      if (userResults?.data?.[0]?.profile_pic_url) {
        var profile_pic_url = '';
        const uploadImageFromURLRes = await uploadImageFromURL(username)
        console.log(uploadImageFromURLRes)
        if (uploadImageFromURLRes?.status === 'success') {
          profile_pic_url = uploadImageFromURLRes?.data
        }

        if (from) {
          console.log(username);
          const { error } = await supabase
            .from(from)
            .update({
              avatar: profile_pic_url,
              imageUrlChanged: true
            })
            .eq('id', user?.id);

          error && console.log(error)
        } else {
          const { error } = await supabase
            .from("users")
            .update({
              profile_pic_url: profile_pic_url,
            }).eq("user_id", user?.user_id).eq("username", user?.username);

          error && console.log(error)
          return { success: true, ppu: profile_pic_url }
        }

        console.log('fixed for: ', username)
        return { succuss: true, message: 'ok' }
      }
    } else {
      return { succuss: false, message: 'username invalid' }
    }
  } catch (error) {
    console.log("updateUserProfilePicUrl: ", error)
  }
}

export async function instabulkProfileAPI(ig) {
  try {
    const params = { ig, response_type: "short", storageEnabled: "true" };
    // const params = { ig: user?.account, response_type: "short", corsEnabled: "false" };
    const options = {
      method: "GET",
      url: SCRAPER_API_URL,
      params,
      headers: {
        "X-RapidAPI-Key": X_RAPID_API_KEY,
        "X-RapidAPI-Host": X_RAPID_API_HOST,
      },
    };
    return await axios.request(options);
  } catch (error) {
    console.log("instabulkProfileAPI: ", error)
  }
}

export const totalLikes = (name) => {
  try {
    const options = {
      method: "GET",
      url: SCRAPER_API_URL,
      params: { ig: name, response_type: "feeds" },
      headers: {
        "X-RapidAPI-Key": X_RAPID_API_KEY,
        "X-RapidAPI-Host": X_RAPID_API_HOST,
      },
    }

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data)
      })
      .catch(function (error) {
        console.error(error)
      })
  } catch (error) {
    console.log("totalLikes: ", error)
  }
}

export const getThDayNameFromDate = (date) => {
  const day = new Date(date).toDateString().slice(0, 3)
  return day
}

export const deleteAccount = async (from, id) => {
  // console.log(from, id);
  // if (id && window.confirm("Are you sure you want to delete this account?")) {
  const { data, error } = await supabase
    .from(from)
    .delete()
    .match({ id: id })
  // .eq('id', id).select();
  error && console.log(error)
  // alert('error deleting account! contact admin');
  return data
  // }
}

export const deleteUserDetails = async (user_id, first_account) => {
  await deleteUser(user_id, first_account, 'users');
  await deleteUser(user_id, first_account, 'targeting');
  await deleteUser(user_id, first_account, 'whitelist');
  await deleteUser(user_id, first_account, 'blacklist');
  return 'success'
}

export const deleteUser = async (user_id, first_account, table) => {
  const { error } = await supabase.from(table).delete().eq(first_account ? "user_id" : table === 'users' ? "username" : "main_user_username", user_id)
  console.log(error)
}

export const getUser = async (uid) => {
  var error;
  if (uid) {
    const userObj = await supabase
      .from('users')
      .select('*')
      .eq("user_id", uid)
      .eq('first_account', true)
    error = userObj.error
    const r = { status: 200, obj: userObj?.data?.[0] }
    // console.log(r);
    return r;
  }
  return { status: 500, obj: error };
}

export const messageSlack = async (message) => {
  const r = await axios.post(BACKEND_URL + '/api/slack_notification', {
    webhookUrl: process.env.REACT_APP_SLACK_WEBHOOK_URL,
    message
  }).then(r => {
    if (r?.data?.e?.status === null || r?.data?.e?.status === 404){
      console.log('error while sending message to Slack');
      console.log(r);
      return r
    }
    console.log('message sent to Slack');
    console.log(r);
    return r
  })
    .catch((e) => {
      console.log('error while sending message to Slack');
      console.log(e);
    })
  return r
}

// Function to fetch and upload image in subscriptions.js 183
export async function uploadImageFromURL(username, imageURL) {
  // console.log(username, imageURL);
  try {
    // Fetch image data from URL
    var response = imageURL && await fetch(imageURL);
    if (!imageURL) {
      const r = await getAccount(username)
      response = await fetch(r.data?.[0]?.profile_pic_url);
    }
    // console.log("r: ",r);
    const imageData = await response?.blob();

    if (imageData) {
      // Upload image to Supabase storage
      const { data, error } = await supabase.storage
        .from('profilePictures')
        .upload(`${username}.jpg`, imageData, {
          upsert: true
        });

      // if (error.message === 'The resource already exists') {
      //   return { status: 'success', data: {path: `${username}.jpg`}}
      // }
      if (error) {
        console.log(error);
        return { status: 'failed', data: error }
      } else {
        // console.log(`Image uploaded to ${data}`);
        const publicUrl = getDownloadedFilePublicUrl(data.path)
        // console.log("publicUrl: ", publicUrl?.data?.publicUrl)
        return { status: 'success', data: publicUrl?.data?.publicUrl }
      }
    }
  } catch (error) {
    console.log("uploadImageFromURLError: ", error)
  }
}

export function getDownloadedFilePublicUrl(path) {
  const publicUrl = supabase.storage
    .from('profilePictures')
    .getPublicUrl(path)
  return publicUrl
}

export function getCookie(name) {
  var nameEQ = name + '='
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) === '') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function getRefCode() {
  var urlParams = new URLSearchParams(window.location.search);
  var refParam = urlParams.get('ref');
  if (refParam) {
    return refParam
    // var newUrl = "https://app.vizzysocial.com/signup/?ref=" + refParam;
    // var signupLink = document.getElementById('signup');
    // if (signupLink) {
    //   signupLink.href = newUrl;
  }
  return ''
}

export function sumTotalInteractions(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    const obj = arr[i];
    if (obj.hasOwnProperty("total_interactions")) {
      sum += obj.total_interactions;
    }
  }
  return sum;
}