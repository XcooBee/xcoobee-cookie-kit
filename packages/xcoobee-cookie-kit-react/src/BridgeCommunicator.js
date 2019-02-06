import React from "react";

export default class CookieKit extends React.PureComponent {
    constructor(props) {
        super(props);

        // register with XcooBee domain in iframe
        window.addEventListener("message", this.XcooBeeHandleLoginStatusCheckResponse, false);
    }


    // this function is called when we have a response from XcooBee Domain
    XcooBeeHandleLoginStatusCheckResponse = (event) => {
        const validOrigin = "https://testapp.xcoobee.net";  //TODO replace with https://app.xcoobee.net or https://testapp.xcoobee.net

        if (event.origin !== validOrigin) {
            return;
        } else {
            console.warn("We got this:", event.data);
        }
    };

    // make a call to iframe
    checkLoginStatus = () => {
        // we need to set the message correctly. A JSON with defined action needed from status:
        let myMsgObj = {
            action:"loginstatus",
            campaign: "g48.2fc78bg9e7",
            domain:"http://mytestsite.com:3000"
        };

        this.frameRef.contentWindow.postMessage(JSON.stringify(myMsgObj),"https://testapp.xcoobee.net");//TODO change it

        myMsgObj = {
            action:"cookieoptions",
            action_params: {
                type: "all"
            },
            campaign: "g48.2fc78bg9e7",
            domain: "http://mytestsite.com:3000"};

        this.frameRef.contentWindow.postMessage(JSON.stringify(myMsgObj),"https://testapp.xcoobee.net");//TODO change it

        myMsgObj = {
            action:"savecookieconsent",
            action_params: {
                categories: {
                    application: true,
                    statistics: true,
                }
            },
            campaign: "g48.2fc78bg9e7",
            domain: "http://mytestsite.com:3000"};

        this.frameRef.contentWindow.postMessage(JSON.stringify(myMsgObj),"https://testapp.xcoobee.net");//TODO change it

    };

    render() {
        return (
            <iframe
                ref={frameRef => {
                    this.frameRef = frameRef;
                }}
                src="https://testapp.xcoobee.net/scripts/cookie-bridge/index.html"
                onLoad={this.checkLoginStatus}
                height="0"
                width="0"
                frameBorder="0"
            />
        );
    }
}