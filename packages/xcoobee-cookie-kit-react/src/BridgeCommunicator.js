import React from "react";
import PropTypes from "prop-types";

import { xbOrigin } from "./configs";

export default class BridgeCommunicator extends React.PureComponent {
  static propTypes = {
    campaignReference: PropTypes.string,
    onLoginStatusChange: PropTypes.func.isRequired,
    onCookieOptionsLoad: PropTypes.func.isRequired,
    handleBridgeError: PropTypes.func.isRequired,
  };

  static defaultProps = {
    campaignReference: null,
  };

  constructor(props) {
    super(props);

    // Register with XcooBee domain in iframe
    window.addEventListener("message", this.XcooBeeHandleResponse, false);
  }

  // This function is called when we have a response from XcooBee Domain
  XcooBeeHandleResponse = (event) => {
    const { onLoginStatusChange, onCookieOptionsLoad, handleBridgeError } = this.props;

    if (event.origin === xbOrigin) {
      if (!event.data) {
        return;
      }

      const data = JSON.parse(event.data);
      const action = Object.keys(data)[0];

      if (action === "loginstatus") {
        onLoginStatusChange(data[action]);

        if (data[action]) {
          this.fetchCookieOptions();
        }
      } else if (action === "cookieoptions") {
        onCookieOptionsLoad(data[action]);
      } else if (action === "savecookieconsent") {
        // console.log("Cookie consents have been successfully saved.");
      } else {
        handleBridgeError(data[action]);
      }
    }
  };

  // Make a call to iframe
  checkLoginStatus = () => {
    const { campaignReference, onLoginStatusChange } = this.props;
    const myMsgObj = {
      action: "loginstatus",
      campaign: campaignReference,
      domain: window.location.origin,
    };

    if (campaignReference) {
      this.frameRef.contentWindow.postMessage(JSON.stringify(myMsgObj), xbOrigin);
    } else {
      onLoginStatusChange(false);
    }
  };

  fetchCookieOptions() {
    const { campaignReference } = this.props;
    const myMsgObj = {
      action: "cookieoptions",
      action_params: {
        type: "all",
      },
      campaign: campaignReference,
      domain: window.location.origin,
    };

    if (!campaignReference) {
      return;
    }

    this.frameRef.contentWindow.postMessage(JSON.stringify(myMsgObj), xbOrigin);
  }

  saveCookieConsents(cookieConsents) {
    const { campaignReference } = this.props;
    const myMsgObj = {
      action: "savecookieconsent",
      action_params: {
        categories: cookieConsents,
      },
      campaign: campaignReference,
      domain: window.location.origin,
    };

    if (!campaignReference) {
      return;
    }

    this.frameRef.contentWindow.postMessage(JSON.stringify(myMsgObj), xbOrigin);
  }

  render() {
    return (
      <iframe
        title="cookieBridge"
        ref={(frameRef) => {
          this.frameRef = frameRef;
        }}
        src={`${xbOrigin}/scripts/cookie-bridge/index.html`}
        onLoad={this.checkLoginStatus}
        height="0"
        width="0"
        frameBorder="0"
      />
    );
  }
}
