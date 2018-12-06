/* eslint-disable no-console */
import cx from "classnames";
import PropTypes from "prop-types";
import React from "react";

import ConfigShape from "../lib/ConfigShape";
import CookieConsentShape from "../lib/CookieConsentShape";

import {
  animations,
  consentStatuses,
  tokenKey,
  xcoobeeCookiesKey,
} from "../utils";

import CookieKitPopup from "./CookieKitPopup";

export default class CookieKit extends React.PureComponent {
  static propTypes = {
    config: ConfigShape.isRequired,
    consentsSource: PropTypes.oneOf([
      "companyPreference",
      "crowdIntelligence",
      "userPreferences",
      "userSettings",
      "unknown",
    ]).isRequired,
    cookieConsents: PropTypes.arrayOf(CookieConsentShape.isRequired).isRequired,
    countryCode: PropTypes.string,
    onAuthentication: PropTypes.func.isRequired,
    onConsentStatusChange: PropTypes.func.isRequired,
    onCookieConsentsChange: PropTypes.func.isRequired,
    onRefresh: PropTypes.func,
  };

  static defaultProps = {
    countryCode: null,
    onRefresh: () => {},
  };

  static handleErrors(error) {
    if (Array.isArray(error)) {
      error.forEach((e) => { throw new Error(e.message); });
    } else if (error) {
      throw new Error(error.message);
    }
  }

  constructor(props) {
    console.log("CookieKit#constructor");
    super(props);

    this.state = {
      isOpen: false,
      isShown: true,
      pulsing: false,
    };

    this.timers = [];

    // TODO: Use property initializers.
    this.handleOpen = this.handleOpen.bind(this);
    this.handlePopupClose = this.handlePopupClose.bind(this);
    this.handlePopupLogin = this.handlePopupLogin.bind(this);
    this.handlePopupSubmit = this.handlePopupSubmit.bind(this);

    this.startPulsing();
  }

  componentDidMount() {
    console.log("CookieKit#componentDidMount");
    console.dir(this.props);
    console.dir(this.state);
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("CookieKit#componentDidUpdate");
    if (this.props !== prevProps) {
      console.log("props changed:");
      console.dir(this.props);
    }
    if (this.state !== prevState) {
      console.log("state changed:");
      console.dir(this.state);
    }
  }

  componentWillUnmount() {
    this.timers.forEach(timer => clearTimeout(timer));
  }

  startPulsing() {
    console.log("CookieKit#startPulsing");
    this.timers.push(setTimeout(() => this.setState({ pulsing: true }), 1000));
    this.timers.push(setTimeout(() => this.setState({ pulsing: false }), 4500));
    this.timers.push(setTimeout(() => this.setState({ animation: animations.noAnimation }), 5000));
  }

  startTimer() {
    console.log("CookieKit#startTimer");
    const { config, onConsentStatusChange } = this.props;
    const timeOut = config.expirationTime;

    if (timeOut && timeOut > 0) {
      this.timers.push(setTimeout(() => {
        onConsentStatusChange(consentStatuses.closed);
        this.setState({ isShown: false });
      }, timeOut * 1000));
    }
  }

  handleOpen() {
    console.log("CookieKit#handleOpen");
    this.setState({ isOpen: true });
    this.timers.forEach(timer => clearTimeout(timer));
  }

  handlePopupClose() {
    console.log("CookieKit#handlePopupClose");
    const { config } = this.props;

    this.setState({ isOpen: false });
    this.startTimer();

    if (config.hideOnComplete) {
      this.setState({ isShown: false });
    }
  }

  handlePopupLogin(accessToken) {
    console.log("CookieKit#handlePopupLogin");
    this.setState({ isOpen: false });
    const { onAuthentication } = this.props;
    onAuthentication(accessToken);
  }

  handlePopupSubmit(nextCookieConsentLut) {
    console.log("CookieKit#handlePopupSubmit");
    console.dir(nextCookieConsentLut);
    const { onCookieConsentsChange } = this.props;
    onCookieConsentsChange(nextCookieConsentLut);
    this.handlePopupClose();
  }

  render() {
    console.log("CookieKit#render");
    const { config, consentsSource, cookieConsents, countryCode, onRefresh } = this.props;
    const { isOpen, isShown, pulsing } = this.state;

    const animation = animations[consentsSource] || animations.noAnimation;

    const renderButton = !isOpen;
    const renderPopup = isOpen;

    const renderRefreshButton = config.testMode
      && (localStorage[tokenKey] || localStorage[xcoobeeCookiesKey]);

    return (
      <div
        className={
          cx(
            "xb-cookie-kit",
            config.position,
            {
              transparent: !isShown,
            },
          )
        }
      >
        <p>{animation}</p>
        <p>{`pulsing: ${pulsing}`}</p>
        {renderPopup && (
          <CookieKitPopup
            config={{
              companyLogo: config.companyLogo,
              privacyUrl: config.privacyUrl,
              termsUrl: config.termsUrl,
              textMessage: config.textMessage,
            }}
            cookieConsents={cookieConsents}
            countryCode={countryCode}
            isConnected={!!config.campaignReference}
            onClose={this.handlePopupClose}
            onLogin={this.handlePopupLogin}
            onSubmit={this.handlePopupSubmit}
          />
        )}
        {renderButton && (
          <button
            type="button"
            className="xb-cookie-kit__button xb-cookie-kit__cookie-button"
            onClick={this.handleOpen}
          >
            <div
              className={
                cx(
                  "xb-cookie-kit__cookie-icon",
                  `xb-cookie-kit__cookie-icon--${animation}`,
                  {
                    "xb-cookie-kit__pulsing": pulsing,
                  },
                )
              }
            />
          </button>
        )}
        {renderRefreshButton && (
          <button
            type="button"
            className="xb-cookie-kit__button xb-cookie-kit__refresh-button"
            onClick={onRefresh}
          >
            Refresh
          </button>
        )}
      </div>
    );
  }
}
