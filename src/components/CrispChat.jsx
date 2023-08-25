import { useEffect } from 'react';

const CrispChat = () => {
    useEffect(() => {
        window.$crisp = [];
        window.CRISP_WEBSITE_ID = "91755af1-b345-4eb3-93ce-b0a985c5b945";
        (function () {
            let d = document, s = d.createElement("script");
            s.src = "https://client.crisp.chat/l.js"; s.async = 1;
            d.getElementsByTagName("head")[0].appendChild(s);
        })();
        window.$crisp.push(["do", "chat:show"]);
    }, []);

    return null;
};

export default CrispChat;