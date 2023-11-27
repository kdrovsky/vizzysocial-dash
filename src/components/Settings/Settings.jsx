import React, { useEffect, useState } from 'react';
import { FaTimes, FaTimesCircle } from 'react-icons/fa';
import { BsFillEnvelopeFill, BsTrash3 } from 'react-icons/bs';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Nav from '../Nav';
import ChangeModal from './ChangeModal';
import axios from 'axios';
import InfiniteRangeSlider from '../InfiniteRangeSlider';
import { EMAIL } from '../../config';
import { Button } from '@material-tailwind/react';
import { deleteUserDetails } from '../../helpers';

axios.defaults.headers.post['Content-Type'] =
  'application/x-www-form-urlencoded';

const urlEncode = function (data) {
  var str = [];
  for (var p in data) {
    if (data.hasOwnProperty(p) && !(data[p] === undefined || data[p] == null)) {
      str.push(
        encodeURIComponent(p) +
          '=' +
          (data[p] ? encodeURIComponent(data[p]) : '')
      );
    }
  }
  return str.join('&');
};

export default function Settings() {
  let { username } = useParams();
  const currentUsername = username;
  const navigate = useNavigate();
  const [user, setUser] = useState();
  const [showModal, setShowModal] = useState(false);
  const [modalToShow, setModalToShow] = useState('');
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelAccountModal, setCancelAccountModal] = useState({
    state: false,
    account: null,
  });
  const [processingDeleteAccount, setProcessingDeleteAccount] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [chargebeeCustomerData, setChargebeeCustomerData] = useState();
  const [showRangeSlider, setShowRangeSlider] = useState(false);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return navigate('/login');
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('username', currentUsername)
        .eq('email', user.email);
      if (error) {
        error && console.log(error);
        alert('An error occurred, loading the page or contact support.');
        return;
      }
      const currentUser = data?.[0];
      const getAllAccounts = await supabase
        .from('users')
        .select()
        .eq('email', user.email);
      setAccounts(getAllAccounts?.data);
      if (!currentUser?.subscribed) {
        window.location.pathname = `subscriptions/${data[0].username}`;
      } else {
        setUser(data[0]);

        if (!currentUser?.chargebee_customer_id) return;

        const retrieve_customer_data = {
          customerId: currentUser?.chargebee_customer_id,
        };
        setShowRangeSlider(true);
        let chargebeeCustomerData = await axios
          .post(
            `${process.env.REACT_APP_BASE_URL}/api/chargebee/retrieve_customer`,
            urlEncode(retrieve_customer_data)
          )
          .then((response) => response.data)
          .catch((err) => {
            console.log(err);
          });
        setShowRangeSlider(false);

        // console.log(chargebeeCustomerData);
        if (chargebeeCustomerData?.card) {
          setChargebeeCustomerData(chargebeeCustomerData);
        }
      }
    };

    getData();
  }, [currentUsername, navigate, refresh]);

  const handledeleteAccount = async (account) => {
    if (account?.username) {
      setProcessingDeleteAccount(true);
      await deleteUserDetails(account.username, account.first_account);
      setRefresh(true);
      if (account.username === currentUsername) {
        navigate('/');
      } else {
        setProcessingDeleteAccount(false);
        setCancelAccountModal({
          state: false,
          account: null,
        });
      }
    }
  };

  // console.log({user});
  // console.log(chargebeeCustomerData);

  return (
    <>
      <div className="max-w-[1400px] mx-auto">
        <Nav />
        <div className="mt-4">
          <div
            className="flex justify-between items-center rounded-[10px] h-[84px] px-5 md:px-[30px] mb-10"
            style={{
              boxShadow: '0 0 3px #00000040',
            }}
          >
            <h1 className="font-black font-MontserratBold text-[18px] md:text-[26px] text-black">
              Profile settings
            </h1>

            <div
              className="flex items-center gap-2 text-base cursor-pointer"
              onClick={() => navigate(-1)}
            >
              <h3>Close</h3>
              <FaTimes size={18} />
            </div>
          </div>

          <div className="md:px-10">
            <div className="flex flex-col md:flex-row justify-between md:items-center md:h-[70px] text-[18px] mb-3 md:mb-0">
              <div className="mb-2 border-b md:mb-0 md:border-b-0">
                Full Name
              </div>
              <div className="flex items-center justify-between gap-3 md:justify-end">
                <div className="text-[#757575]">{user?.full_name}</div>
                <div
                  className="text-primary cursor-pointer"
                  onClick={() => {
                    setShowModal(true);
                    setRefresh(!refresh);
                    setModalToShow('fullname');
                  }}
                >
                  Change
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between md:items-center md:h-[70px] text-[18px] mb-3 md:mb-0">
              <div className="mb-2 border-b md:mb-0 md:border-b-0">Email</div>
              <div className="flex flex-col md:flex-row md:items-center md:gap-3">
                <div className="text-[#757575]">{user?.email}</div>
                <div
                  className="text-primary cursor-pointer"
                  onClick={() => {
                    setShowModal(true);
                    setRefresh(!refresh);
                    setModalToShow('email');
                  }}
                >
                  Change
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between md:items-center md:h-[70px] text-[18px] mb-3 md:mb-0">
              <div className="mb-2 border-b md:mb-0 md:border-b-0">
                Password
              </div>
              <div className="flex items-center justify-between gap-3 md:justify-end">
                <div className="text-[#757575]">************</div>
                <div
                  className="text-primary cursor-pointer"
                  onClick={() => {
                    setShowModal(true);
                    setRefresh(!refresh);
                    setModalToShow('password');
                  }}
                >
                  Change
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between md:items-center md:h-[70px] text-[18px] mb-3 md:mb-0">
              <div className="mb-2 border-b md:mb-0 md:border-b-0">
                Phone number
              </div>
              <div className="flex items-center justify-between gap-3 md:justify-end">
                <div className="text-[#757575]">{user?.phone}</div>
                <div
                  className="text-primary cursor-pointer"
                  onClick={() => {
                    setShowModal(true);
                    setRefresh(!refresh);
                    setModalToShow('phone');
                  }}
                >
                  Change
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between md:items-center md:h-[70px] text-[18px] mb-3 md:mb-0">
              <div className="mb-2 border-b md:mb-0 md:border-b-0">
                Subscription
              </div>
              <div className="flex items-center justify-between gap-3 md:justify-end">
                <div className="text-[#757575]">Active</div>
                <div
                  className="text-primary cursor-pointer"
                  onClick={() => setCancelModal(true)}
                >
                  Cancel
                </div>
              </div>
            </div>
          </div>
        </div>
        {chargebeeCustomerData ? (
          <div className="my-8">
            <div
              className="flex justify-between items-center rounded-[10px] h-[84px] px-5 md:px-[30px] mb-10"
              style={{
                boxShadow: '0 0 3px #00000040',
              }}
            >
              <h1 className="font-black font-MontserratBold text-[18px] md:text-[26px] text-black">
                Payment and Billing Settings
              </h1>
            </div>

            {/* payment and billing settings */}
            <div className="md:px-10">
              <div className="flex flex-col md:flex-row justify-between md:items-center md:h-[70px] text-[18px] mb-3 md:mb-0">
                <div className="mb-2 border-b md:mb-0 md:border-b-0">
                  Credit Card
                </div>

                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <div className="text-[#757575] flex items-center gap-3">
                    {chargebeeCustomerData?.card?.card_type === 'visa' && (
                      <img
                        src="/icons/visa.svg"
                        alt="visa"
                        className="w-[36px] h-fit"
                      />
                    )}
                    {chargebeeCustomerData?.card?.card_type ===
                      'mastercard' && (
                      <img
                        src="/icons/mastercard.svg"
                        alt="visa"
                        className="w-[36px] h-fit"
                      />
                    )}
                    {chargebeeCustomerData?.card?.card_type === 'maestro' && (
                      <img
                        src="/icons/maestro.svg"
                        alt="visa"
                        className="w-[36px] h-fit"
                      />
                    )}
                    {!['visa', 'mastercard', 'maestro'].includes(
                      chargebeeCustomerData?.card?.card_type
                    ) && <>({chargebeeCustomerData?.card?.card_type})</>}
                    <span className="">
                      card ending with {chargebeeCustomerData?.card?.last4}
                    </span>
                  </div>
                  <div
                    className="text-primary cursor-pointer"
                    onClick={() => {
                      setShowModal(true);
                      setRefresh(!refresh);
                      setModalToShow('updatePayment');
                    }}
                  >
                    Update
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>{showRangeSlider && <InfiniteRangeSlider />}</>
        )}
        <div className="my-8">
          <div
            className="flex flex-col md:flex-row justify-between items-center rounded-[10px] md:h-[84px] py-3 md:py-0 px-5 md:px-[30px] mb-10"
            style={{
              boxShadow: '0 0 3px #00000040',
            }}
          >
            <h1 className="font-black font-MontserratBold text-[18px] md:text-[26px] text-black">
              Accounts
            </h1>
            <Link
              to={`/search/?username=add_account`}
              className="px-[32px] md:h-[52px] py-2 md:py-0 text-sm md:text-base mt-2 md:mt-0 w-full md:w-fit grid place-items-center whitespace-nowrap rounded-[10px] bg-[#1b89ff] text-white font-bold"
            >
              Add Account
            </Link>
          </div>

          {/* payment and billing settings */}
          <div className="md:px-[40px] flex flex-col gap-[40px]">
            {accounts.map((account) => {
              // console.log(account);
              return (
                <div
                  key={`account_${account?.username}`}
                  className="flex flex-col justify-between md:flex-row"
                >
                  <div className="border-b mb-2 pb-1 md:mb-0 md:border-b-0 flex items-center gap-2 md:gap-4 lg:gap-[30px]">
                    <div className="relative">
                      <img
                        src={account?.profile_pic_url}
                        alt={`@${account?.username}`}
                        className="min-w-[50px] min-h-[50px] w-[50px] h-[50px] lg:min-w-[107px] lg:min-h-[107px] lg:w-[107px] lg:h-[107px] rounded-full"
                      />
                      <div className="hidden lg:block absolute -bottom-[2px] -right-[2px] border-[5px] w-[32px] h-[32px] rounded-full bg-[#23df85]"></div>
                    </div>
                    <div className="lg:text-[24px] w-full">
                      <div className="flex justify-between w-full gap-1 md:justify-start">
                        @{account?.username}{' '}
                        <span className="font-bold text-[#23df85]">Active</span>
                      </div>
                      <div className="">
                        <img
                          src="/instagram.svg"
                          alt=""
                          className="my-[3px] md:my-[5px] lg:my-[7px] mr-[8px] w-[16px] h-[16px] lg:w-[28px] lg:h-[28px] rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    {account?.first_account === false && (
                      <div
                        className="px-3 lg:px-[13px] py-3 lg:py-0 lg:h-[52px] grid place-items-center whitespace-nowrap rounded-[10px] bg-[#c4c4c4] text-white font-bold cursor-pointer"
                        onClick={() => {
                          if (account.agency) {
                            setCancelAccountModal({ status: true, account });
                          } else {
                            setCancelModal(true);
                          }
                        }}
                      >
                        <BsTrash3
                          size={24}
                          className="w-[16px] h-[16px] lg:w-[24px] lg:h-[24px]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <ChangeModal
          show={showModal}
          onHide={() => setShowModal(false)}
          setShowModal={setShowModal}
          showModal={showModal}
          modalToShow={modalToShow}
          user={user}
          setRefresh={setRefresh}
          refresh={refresh}
          chargebeeCustomerData={chargebeeCustomerData}
        />
        {/* cancelModal */}
        <div
          className={`${
            cancelModal
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          } fixed top-0 left-0 w-full h-screen grid place-items-center`}
          style={{
            transition: 'opacity .15s ease-in',
          }}
        >
          <div
            className="fixed top-0 left-0 grid w-full h-screen bg-black/40 place-items-center"
            onClick={() => setCancelModal(false)}
          ></div>
          <div className="bg-white to-black py-4 md:py-7 md:pt-12 px-5 md:px-10 relative max-w-[300px] md:max-w-[500px] lg:max-w-[600px] font-MontserratRegular rounded-[10px]">
            <FaTimesCircle
              className="absolute flex flex-col items-center top-3 right-3"
              onClick={() => {
                setCancelModal(false);
              }}
            />
            <h1 className="text-[1rem] md:text-lg font-bold text-center font-MontserratSemiBold text-[#333]">
              Submit your cancellation request
            </h1>
            <div className="text-[.8rem] md:text-base">
              <p className="text-center">
                All cancellations requests have to be processed by our support
                team. Please request a cancellation and provide us with your
                reason for cancelling by emailing{' '}
                <a href={`mailto:${EMAIL}`} className="text-blue-500">
                  ${EMAIL}
                </a>
                . We appreciate your feedback and are always looking to improve
              </p>
              <br />
              <p className="text-center">
                Our expert account managers are always on standby and ready to
                help. If you are not getting results, or need help, schedule a
                time to speak with our expert team who can help you reach your
                full instagram growth potential.
              </p>
            </div>
            <a
              href={`mailto:${EMAIL}`}
              className="mt-8 m-auto w-fit py-3 rounded-[10px] font-MontserratRegular px-10 bg-blue-500 text-white flex justify-center items-center text-[1rem] md:text-lg gap-3"
            >
              <BsFillEnvelopeFill />
              Send an email
            </a>
          </div>
        </div>
        {/* cancelAccountModal */}
        <div
          className={`${
            cancelAccountModal?.account?.username
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          } fixed top-0 left-0 w-full h-screen grid place-items-center`}
          style={{
            transition: 'opacity .15s ease-in',
          }}
        >
          <div
            className="fixed top-0 left-0 grid w-full h-screen bg-black/40 place-items-center"
            onClick={() =>
              setCancelAccountModal({ state: false, account: null })
            }
          ></div>
          <div className="bg-white to-black py-4 md:py-7 md:pt-12 px-5 md:px-10 relative max-w-[300px] md:max-w-[500px] lg:max-w-[600px] font-MontserratRegular rounded-[10px]">
            <FaTimesCircle
              className="absolute flex flex-col items-center top-3 right-3"
              onClick={() =>
                setCancelAccountModal({ state: false, account: null })
              }
            />
            <h1 className="text-[1rem] md:text-lg font-bold text-center font-MontserratSemiBold text-[#333]">
              Are you sure you want to delete this account? <br />@
              {cancelAccountModal?.account?.username}
            </h1>
            <div className="flex items-center justify-between mt-4 transition-all duration-300">
              <Button
                color="red"
                onClick={() => handledeleteAccount(cancelAccountModal?.account)}
                className="flex items-center gap-3 transition-all duration-300"
              >
                Delete
                {processingDeleteAccount && (
                  <div className="animate-spin">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                  </div>
                )}
              </Button>

              <Button
                color="blue"
                onClick={() =>
                  setCancelAccountModal({ state: false, account: null })
                }
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
