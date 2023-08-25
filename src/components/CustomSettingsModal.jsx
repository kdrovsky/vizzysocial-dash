import React, { useState } from "react";
import { Col,  Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export default function CustomSettingsModal(props) {
  const [value, setValue] = useState("");
  console.log("🚀 ~ file: CenterModal.jsx:11 ~ CenterModal ~ value", value);

  return (
    <Modal
      {...props}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Modal heading
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col>
            <div className="d-flex flex-column align-items-center gap-2">
              <h5 className="">Instagram Account</h5>
              <img
                src={props.avatar}
                className="rounded-circle"
                height={150}
                width={150}
                alt="Portrait of a Woman"
                loading="lazy"
              />
              <h4>@{props.username} </h4>
            </div>
          </Col>
          <Col>
            <h4>Select interaction settings:</h4>
            <div className="mt-4">
              <div
                className={
                  value === "Recommended"
                    ? "selected settings__card"
                    : "settings__card"
                }
                onClick={() => setValue("Recommended")}
              >
                <RecommendedIcon size={value === "Recommended" ? 320 : 60} />
                <div className="d-flex flex-column gap-3">
                  <p>Recommended</p>
                  {value === "Recommended" && (
                    <>
                      This setting will follow and unfollow relevant users using
                      the targets you have selected. We will automatically
                      unfollow users after 3 days to keep your following number
                      low and healthy. We will never unfollow anyone that you
                      manually followed yourself.
                    </>
                  )}
                </div>
              </div>

              <div
                className={
                  value === "Follow"
                    ? "selected settings__card"
                    : "settings__card"
                }
                onClick={() => setValue("Follow")}
              >
                <FollowIcon size={value === "Follow" ? 320 : 60} />
                <div className="d-flex flex-column gap-3">
                  <p>Follow</p>
                  {value === "Follow" && (
                    <>
                      In ‘Follow Mode,’ your account will continue following
                      users until it reaches Instagram's maximum ‘Following’
                      limit (which is 7500). From there, interactions on our end
                      will stop and you will have to manually change your
                      interaction settings to continue experiencing results (to
                      either ‘Recommended’ or ‘Unfollow Mode’).
                    </>
                  )}
                </div>
              </div>

              <div
                className={
                  value === "Unfollow"
                    ? "selected settings__card"
                    : "settings__card"
                }
                onClick={() => setValue("Unfollow")}
              >
                <UnFollowIcon size={value === "Unfollow" ? 320 : 60} />
                <div className="d-flex flex-column gap-3">
                  <p>Unfollow</p>
                  {value === "Unfollow" && (
                    <>
                      In ‘Unfollow Mode,’ your account will unfollow all of the
                      users we automatically followed for you. This will not
                      unfollow users that you personally followed, before or
                      after joining us. If you want to unfollow every account,
                      please contact your account manager.
                    </>
                  )}
                </div>
              </div>

              <div
                className={
                  value === "Interactions_OFF"
                    ? "selected settings__card"
                    : "settings__card"
                }
                onClick={() => setValue("Interactions_OFF")}
              >
                <TurnIcon size={value === "Interactions_OFF" ? 320 : 60} />
                <div className="d-flex flex-column gap-3">
                  <p>Unfollow</p>
                  {value === "Interactions_OFF" && (
                    <>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button
              style={{ width: "100%", marginTop: "42px", padding: "1rem" }}
              onClick={() => props.setSettingsModal(false)}
            >
              Apply and Close
            </Button>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

function RecommendedIcon({ size }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      ariaHidden="true"
      width={size}
      height={size / 2}
      viewBox="0 0 40 40"
    >
      <path d="M18.333 6.667L17.5 5l-.833 1.667L15 6.875l1.39 1.18L15.833 10 17.5 8.89 19.167 10l-.557-1.945L20 6.875l-1.667-.208zm13.89 17.776l-1.39-2.776-1.39 2.776-2.776.349 2.315 1.968-.925 3.24 2.776-1.852L33.61 30l-.925-3.24L35 24.792l-2.777-.349zM11.112 10.555L10 8.333l-1.112 2.222-2.221.278 1.851 1.574L7.778 15 10 13.518 12.222 15l-.74-2.593 1.851-1.574-2.221-.278zM5.69 28.333c0 .89.347 1.727.977 2.357l2.643 2.643a3.31 3.31 0 002.357.977 3.31 3.31 0 002.356-.977l19.31-19.31a3.31 3.31 0 00.977-2.356 3.31 3.31 0 00-.977-2.357L30.69 6.667c-1.26-1.26-3.453-1.26-4.713 0l-19.31 19.31a3.31 3.31 0 00-.977 2.356zm22.643-19.31l2.644 2.644L25 17.643 22.357 15l5.976-5.977z"></path>
    </svg>
  );
}

function FollowIcon({ size }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size / 2}
      ariaHidden="true"
      viewBox="0 0 16 16"
    >
      <path d="M10.598 10.037a2.68 2.68 0 011.272-.318h.002a.05.05 0 00.034-.088 5.808 5.808 0 00-1.62-1.028l-.019-.008a3.876 3.876 0 001.602-3.142 3.87 3.87 0 00-3.867-3.875 3.87 3.87 0 00-3.866 3.875c0 1.292.631 2.438 1.603 3.142l-.019.008a5.823 5.823 0 00-1.864 1.26A5.835 5.835 0 002.6 11.73a5.837 5.837 0 00-.46 2.157.125.125 0 00.126.129h.936a.126.126 0 00.125-.122 4.662 4.662 0 011.368-3.192 4.638 4.638 0 013.308-1.374c.886 0 1.736.245 2.469.705a.126.126 0 00.127.005zM8.003 8.142c-.715 0-1.389-.28-1.897-.788a2.675 2.675 0 01-.786-1.9c0-.717.28-1.392.786-1.9a2.66 2.66 0 011.897-.787c.717 0 1.39.28 1.897.787a2.674 2.674 0 01.786 1.9c0 .717-.28 1.392-.786 1.9a2.666 2.666 0 01-1.897.788zm5.747 3.718h-1.312v-1.312a.125.125 0 00-.125-.125h-.875a.125.125 0 00-.125.125v1.312H10a.125.125 0 00-.125.125v.875c0 .07.056.125.125.125h1.313v1.313c0 .069.056.125.125.125h.875a.125.125 0 00.125-.125v-1.313h1.312a.125.125 0 00.125-.125v-.875a.125.125 0 00-.125-.125z"></path>
    </svg>
  );
}

function UnFollowIcon({ size }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size / 2}
      ariaHidden="true"
      viewBox="0 0 16 16"
    >
      <path d="M10.598 10.24a2.68 2.68 0 011.272-.318h.002a.05.05 0 00.034-.088 5.806 5.806 0 00-1.62-1.028c-.006-.003-.013-.004-.019-.008a3.876 3.876 0 001.602-3.142 3.87 3.87 0 00-3.867-3.875 3.87 3.87 0 00-3.866 3.875c0 1.292.631 2.438 1.603 3.142-.006.004-.012.005-.019.008a5.822 5.822 0 00-1.864 1.26A5.835 5.835 0 002.6 11.933a5.837 5.837 0 00-.46 2.158.125.125 0 00.126.128h.936a.126.126 0 00.125-.122 4.662 4.662 0 011.368-3.192A4.639 4.639 0 018.003 9.53c.886 0 1.736.246 2.469.705a.127.127 0 00.126.005zM8.003 8.345c-.716 0-1.389-.28-1.897-.788a2.675 2.675 0 01-.786-1.9c0-.717.28-1.392.786-1.9a2.66 2.66 0 011.897-.787c.717 0 1.39.28 1.897.787a2.676 2.676 0 01.786 1.9c0 .717-.28 1.392-.786 1.9a2.666 2.666 0 01-1.897.788zm5.747 3.719H10a.125.125 0 00-.125.124v.876c0 .068.056.124.125.124h3.75a.125.125 0 00.125-.124v-.876a.125.125 0 00-.125-.124z"></path>
    </svg>
  );
}

function TurnIcon({ size }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size / 2}
      ariaHidden="true"
      viewBox="0 0 40 40"
    >
      <path d="M31.25 4.227c4.922 3.515 8.125 9.265 8.125 15.773 0 10.688-8.656 19.352-19.336 19.375C9.375 39.398.641 30.703.625 20.031.617 13.523 3.82 7.758 8.735 4.234a1.88 1.88 0 012.734.602l1.234 2.195c.461.82.242 1.86-.515 2.422-3.243 2.406-5.313 6.219-5.313 10.54-.008 7.21 5.82 13.132 13.125 13.132 7.156 0 13.172-5.797 13.125-13.21a13.13 13.13 0 00-5.32-10.47 1.864 1.864 0 01-.508-2.414l1.234-2.195a1.873 1.873 0 012.719-.61zm-8.125 16.398V1.875A1.87 1.87 0 0021.25 0h-2.5a1.87 1.87 0 00-1.875 1.875v18.75A1.87 1.87 0 0018.75 22.5h2.5a1.87 1.87 0 001.875-1.875z"></path>
    </svg>
  );
}
