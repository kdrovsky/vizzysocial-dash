
export const SITENAME = "vizzysocial"

// export const LOGO = "/logo.png";
export const LOGO = "/logo_without_text_and_tagline.png";
export const LOGO_WITH_NAME = "/color_logo_on_white.png"
export const ANALYST_NAME = "Mike P"
export const EMAIL = "support@vizzysocial.com"

export const SCRAPER_API_URL = process.env.REACT_APP_SCRAPER_API_URL
export const X_RAPID_API_KEY = process.env.REACT_APP_X_RAPID_API_KEY
export const X_RAPID_API_HOST = process.env.REACT_APP_X_RAPID_API_HOST





// export const BACKEND_URL = process.env.NODE_ENV === 'production' ? 'https://vizzysocial-api.up.railway.app' : 'http://localhost:8000';
export const BACKEND_URL = 'https://vizzysocial-api.up.railway.app';


// email templates
export const INCORRECT_PASSWORD_TEMPLATE = (full_name, username) => {
    return `
<div>
<p class="MsoNormal"><span lang="EN">Dear <b>${full_name}</b>,</span></p>

<p class="MsoNormal"><span lang="EN"><o:p>&nbsp;</o:p></span></p>

<p class="MsoNormal"><span lang="EN">We regret to inform you that the password
provided for @<b>${username}</b>, to access our service is incorrect. We kindly request
you to attempt re-logging into your dashboard by following this <a href="http://app.vizzysocial.com"><span style="color:#1155CC">link</span></a>.
Once the correct password is provided, our team will proceed to log in to your
account within the next 24 hours.</span></p>

<p class="MsoNormal"><span lang="EN"><o:p>&nbsp;</o:p></span></p>

<p class="MsoNormal"><span lang="EN">Should you require further assistance, please
do not hesitate to contact us at ${EMAIL}.</span></p>

<p class="MsoNormal"><span lang="EN"><o:p>&nbsp;</o:p></span></p>

<p class="MsoNormal"><span lang="EN">Best regards,</span></p>

<p class="MsoNormal"><span class="SpellE"><span lang="EN">vizzysocial</span></span><span lang="EN"> Team</span></p>
</div>
`
}

export const TWO_FACTOR_TEMPLATE = (full_name, username) => {
    return `
    <div class="">
        <p class="MsoNormal"><span lang="EN">Hey <b>${full_name}</b>,<o:p /></span></p>

        <p class="MsoNormal"><span lang="EN"><o:p> </o:p></span></p>

        <p class="MsoNormal"><span lang="EN"><o:p> </o:p></span></p>

        <p class="MsoNormal"><span lang="EN">We regret to inform you that your account
        <b>@${username}</b> has two-factor authentication enabled, which is currently preventing
        us from accessing the necessary information to initiate our service. We
        understand the importance of account security, and we want to assure you that
        your account's safety is our utmost priority.<o:p /></span></p>

        <p class="MsoNormal"><span lang="EN"><span> </span><o:p /></span></p>

        <p class="MsoNormal"><span lang="EN"><o:p> </o:p></span></p>

        <p class="MsoNormal"><span lang="EN">In order for our team to proceed with logging
        into your account and commencing the service, we kindly request you to provide
        us with your two-factor authentication backup code or SMS code. To do so,
        please follow these steps:<o:p /></span></p>

        <p class="MsoNormal"><span lang="EN"><o:p> </o:p></span></p>

        <p class="MsoNormal"><span lang="EN">1. Access your <span class="SpellE">Instagram</span>
        account and Navigate to the "Settings" section.<o:p /></span></p>

        <p class="MsoNormal"><span lang="EN">2. Navigate to the "Accounts Centre"
        and click on "Password and Security" option.<o:p /></span></p>

        <p class="MsoNormal"><span lang="EN">3. Locate and select "Two-factor
        authentication", then click on your <span class="SpellE">Instagram</span>
        account.<o:p /></span></p>

        <p class="MsoNormal"><span lang="EN">4. Click on "Additional Methods" and
        select "Backup codes".<o:p /></span></p>

        <p class="MsoNormal"><span lang="EN">5. Copy one 8-digit code and paste it into
        your <span class="SpellE">vizzysocial</span> dashboard.<o:p /></span></p>

        <p class="MsoNormal"><span lang="EN"><o:p> </o:p></span></p>

        <p class="MsoNormal"><span lang="EN">Once the two-factor authentication backup code
        is provided, our team will be able to log into your account within the next 12
        hours to initiate the requested service. We assure you that all necessary
        precautions will be taken to safeguard your account and ensure its security
        throughout the process.<o:p /></span></p>

        <p class="MsoNormal"><span lang="EN"><o:p> </o:p></span></p>

        <p class="MsoNormal"><span lang="EN"><o:p> </o:p></span></p>

        <p class="MsoNormal"><span lang="EN">After completing the steps above we kindly
        request you to attempt re-logging into your dashboard by following this <a href="https://app.vizzysocial.com/">link</a></span></p>

        <p class="MsoNormal"><span lang="EN"><o:p> </o:p></span></p>

        <p class="MsoNormal"><span lang="EN"><o:p> </o:p></span></p>

        <p class="MsoNormal"><span lang="EN">If you have any concerns or require further
        assistance, please do not hesitate to reach out to us at
        <a href="mailto:${EMAIL}">${EMAIL}</a>. Our dedicated support team is ready to assist you. <o:p /></span></p>

        <p class="MsoNormal"><span lang="EN"><o:p> </o:p></span></p>

        <p class="MsoNormal"><span lang="EN">Thank you for your cooperation.<o:p /></span></p>

        <p class="MsoNormal"><span lang="EN"><o:p> </o:p></span></p>

        <p class="MsoNormal"><span lang="EN"><o:p> </o:p></span></p>

        <p class="MsoNormal"><span lang="EN">Kind regards,<o:p /></span></p>

        <p class="MsoNormal"><span class="SpellE"><span lang="EN">vizzysocial</span></span><span lang="EN"> Team</span></p>

        <p class="MsoNormal"><span lang="EN"><o:p> </o:p></span></p>

        <p class="MsoNormal"><span lang="EN"><o:p> </o:p></span></p>
    </div>
    `
}

export const NOT_CONNECTED_TEMPLATE = (full_name) => {
    return `
<div>
<p class="MsoNormal"><span lang="EN">Dear <b>${full_name}</b>,</span></p>

<p class="MsoNormal"><span lang="EN"><o:p>&nbsp;</o:p></span></p>

<p class="MsoNormal"><span lang="EN">We would like to bring to your attention that
you are currently not connected to our service. We kindly request you to
establish the connection at your earliest convenience by clicking on the
provided <a href="http://app.vizzysocial.com"><span style="color:#1155CC">link</span></a>.
By doing so, we can promptly initiate the growth process for your account.</span></p>

<p class="MsoNormal"><span lang="EN"><o:p>&nbsp;</o:p></span></p>

<p class="MsoNormal"><span lang="EN">Once you enter your login credentials, our
team will proceed to connect to your account within the next 24 hours to begin
the desired growth.</span></p>

<p class="MsoNormal"><span lang="EN"><o:p>&nbsp;</o:p></span></p>

<p class="MsoNormal"><span lang="EN">Please be aware that you may receive a login
attempt notification from us on Instagram. To ensure a seamless connection, we
kindly ask you to acknowledge the attempt by clicking on the "That Was
Me" option. This will grant us the necessary access to your account in
order to commence the growth process.</span></p>

<p class="MsoNormal"><span lang="EN"><o:p>&nbsp;</o:p></span></p>

<p class="MsoNormal"><span lang="EN">Furthermore, we would like to emphasize the
importance of selecting appropriate targets. We recommend entering 10-20
targets initially and periodically adjusting them on a monthly basis to achieve
optimal growth results.</span></p>

<p class="MsoNormal"><span lang="EN"><o:p>&nbsp;</o:p></span></p>

<p class="MsoNormal"><span lang="EN">If you have any inquiries or require further
assistance, please do not hesitate to contact us. We are committed to providing
you with the support you need.</span></p>

<p class="MsoNormal"><span lang="EN"><o:p>&nbsp;</o:p></span></p>

<p class="MsoNormal"><span lang="EN">Thank you for your cooperation.</span></p>

<p class="MsoNormal"><span lang="EN"><o:p>&nbsp;</o:p></span></p>

<p class="MsoNormal"><span lang="EN">Kind regards,</span></p>

<p class="MsoNormal"><span class="SpellE"><span lang="EN">vizzysocial</span></span><span lang="EN"> Team.</span></p>
</div>
`
}

export const ACTIVE_TEMPLATE = (full_name, username) => {
    return `
        <div>
            <p className="MsoNormal"><span lang="EN">Dear <b>${full_name}</b>,<o:p /></span></p><p className="MsoNormal"><span lang="EN"><o:p> </o:p></span></p>

            <p className="MsoNormal"><span lang="EN"><o:p> </o:p></span></p>

            <p className="MsoNormal"><span lang="EN">We are thrilled to inform you that your
            account <b>@${username}</b> has been successfully linked with <span className="SpellE">vizzysocial</span>!
            You can expect to witness growth within just 12 hours on your account. Should
            you have any inquiries or require any assistance, please don't hesitate to
            reach out to us at <a href='mailto:${EMAIL}'>${EMAIL}</a>.<o:p /></span></p>

            <p className="MsoNormal"><span lang="EN"><o:p> </o:p></span></p>

            <p className="MsoNormal"><span lang="EN">Thank you for choosing <span className="SpellE">vizzysocial</span>
            to enhance your social media experience!<o:p /></span></p>

            <p className="MsoNormal"><span lang="EN"><o:p> </o:p></span></p>

            <p className="MsoNormal"><span lang="EN">Best Regards,<o:p /></span></p>

            <p className="MsoNormal"><span lang="EN">The <span className="SpellE">vizzysocial</span>
            Team</span></p>
        </div>
    `
}

export const CHECKING_TEMPLATE = (full_name, username) => {
    return `
        <div className="WordSection1">
            <p className="MsoNormal" style={{ lineHeight: "150%" }}>Hey ${full_name},<o:p /></p>

            <p className="MsoNormal" style={{ lineHeight: "150%" }}>We regret to inform you that your
            account @${username} has to confirm our login request, which is currently
            preventing us from starting our service. We understand the importance of
            account security, and we want to assure you that your account's safety is our
            utmost priority.<o:p /></p>

            <p className="MsoNormal" style={{ lineHeight: "150%" }}>In order for our team to proceed
            with logging into your account and commencing the service, we kindly request
            you confirm our login request. To do so, please follow these steps:<o:p /></p>

            <p className="MsoNormal" style={{ lineHeight: "150%" }}>1. Access your <span className="SpellE">Instagram</span>
            account and Navigate to the "Notifications" section by clicking a
            Heart button.<o:p /></p>

            <p className="MsoNormal" style={{ lineHeight: "150%" }}>2. Find the "An <span className="SpellE">unrecognised</span> device just logged in near location" and
            click on it.<o:p /></p>

            <p className="MsoNormal" style={{ lineHeight: "150%" }}>3. Locate and select the button
            "This was me".<o:p /></p>

            <p className="MsoNormal" style={{ lineHeight: "150%" }}>Once the "This was me"
            button is clicked, our team will be able to log into your account within the
            next 12 hours to initiate the requested service. We assure you that all
            necessary precautions will be taken to safeguard your account and ensure its
            security throughout the process.</p>

            <p className="MsoNormal" style={{ lineHeight: "150%" }}>After completing the steps above we
            kindly request you to attempt re-logging into your dashboard by following this
            <a href="app.vizzysocial.com">link</a><o:p /></p>

            <p className="MsoNormal" style={{ lineHeight: "150%" }}>If you have any concerns or require
            further assistance, please do not hesitate to reach out to us at
            <a href="mailto:${EMAIL}">${EMAIL}</a>. Our dedicated support team is ready to assist you.<o:p /></p>

            <p className="MsoNormal" style={{ lineHeight: "150%" }}>Thank you for your cooperation.<o:p /></p>

            <p className="MsoNormal" style={{ lineHeight: "150%" }}><o:p> </o:p></p>

            <p className="MsoNormal" style={{ lineHeight: "150%" }}>Kind regards,<o:p /></p>

            <p className="MsoNormal" style={{ lineHeight: "150%" }}><span className="SpellE">vizzysocial</span>
            Team</p>

            </div>
    `
}