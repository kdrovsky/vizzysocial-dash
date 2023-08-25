import React, { useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { FaTimesCircle } from "react-icons/fa";
import "../styles/welcomeModal.css"

export default function WelcomeModal({ show, onHide, setShowWelcomeModal, showWelcomeModal }) {
  // props => show and onHide
  useEffect(() => {
    if (typeof window !== "undefined") {
      const el = document.querySelector('.modal-content')
      if (el) {
        el.classList.add('welcome-modal-content')
      }
    }
  }, [])

  return (<>


    <div className={`${showWelcomeModal ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} fixed z-10 top-0 left-0 w-full h-screen grid place-items-center`} style={{
      transition: "opacity .15s ease-in"
    }}
    >
      <div className="fixed top-0 left-0 grid w-full h-screen bg-black/40 place-items-center" onClick={() => setShowWelcomeModal(false)}></div>
      <div className="bg-white to-black py-4 md:py-7 md:pt-12 px-5 md:px-10 relative max-w-[300px] md:max-w-[500px] lg:max-w-[600px] font-MontserratRegular rounded-[10px]">
        <FaTimesCircle className="absolute flex flex-col items-center top-3 right-3"
          onClick={() => {
            setShowWelcomeModal(false)
          }} />
        <h1 className="text-[1rem] md:text-lg font-bold text-center font-MontserratSemiBold text-[#333]">HOW TO START</h1>
        <div className="text-[.8rem] md:text-base">
          <p className="text-center">
            <ol type="1" className="flex flex-col items-center gap-4 text-[.8rem] md:text-base">
              <li>1. Connect Your Instagram Account to our service</li>
              <li>2. Put in your targets (please use over 10 for optimal results)</li>
              <li>3. Enjoy the result, we recommend changing target every month</li>
            </ol>
          </p>
        </div>
      </div>
    </div>






    {/* <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      style={{
        border: '10px solid black'
      }}
    >
      <div className="absolute top-2 right-2">
        <FaTimesCircle className="cursor-pointer" onClick={() => setShowWelcomeModal(false)} />
      </div>

      <div className="flex flex-col items-center gap-4 px-2 pt-3 pb-5">
        <div className="flex items-center justify-center">
          <img src="/sproutysocial-light.svg" alt="logo" className="h-[40px]" />
        </div>

        // <h1 className="text-3xl font-bold font-MontserratBold">HOW TO START</h1> 
        <h1 className="text-[1rem] md:text-lg font-bold text-center font-MontserratSemiBold text-[#333]">HOW TO START</h1>

        <ol type="1" className="flex flex-col items-center gap-4 text-[.8rem] md:text-base">
          <li>1. Connect Your Instagram Account to our service</li>
          <li>2. Put in your targets (please use over 10 for optimal results)</li>
          <li>3. Enjoy the result, we recommend changing target every month</li>
        </ol>
      </div>
    </Modal> */}
  </>);
}