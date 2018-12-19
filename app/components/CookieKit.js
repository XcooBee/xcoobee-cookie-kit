import cx from "classnames";
import PropTypes from "prop-types";
import React from "react";

import CookieConsentShape from "../lib/CookieConsentShape";

import {
  animations,
  consentStatuses,
  cookieTypes,
  positions,
} from "../utils";

import CookieKitPopup from "./CookieKitPopup";

export default class CookieKit extends React.PureComponent {
  static propTypes = {
    campaignReference: PropTypes.string,
    companyLogo: PropTypes.string,
    consentsSource: PropTypes.oneOf([
      "companyPreference",
      "crowdIntelligence",
      "savedConsents",
      "userPreferences",
      "userSettings",
      "unknown",
    ]).isRequired,
    cookieConsents: PropTypes.arrayOf(CookieConsentShape.isRequired).isRequired,
    countryCode: PropTypes.string.isRequired,
    expirationTime: PropTypes.number,
    hasConsented: PropTypes.bool.isRequired,
    hideBrandTag: PropTypes.bool.isRequired,
    hideOnComplete: PropTypes.bool.isRequired,
    onAuthentication: PropTypes.func.isRequired,
    onConsentStatusChange: PropTypes.func.isRequired,
    onCookieConsentsChange: PropTypes.func.isRequired,
    position: PropTypes.oneOf(positions).isRequired,
    privacyUrl: PropTypes.string.isRequired,
    requestDataTypes: PropTypes.arrayOf(
      PropTypes.oneOf(cookieTypes).isRequired,
    ).isRequired,
    termsUrl: PropTypes.string.isRequired,
    textMessage: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        "en-us": PropTypes.string,
        "de-de": PropTypes.string,
        "es-419": PropTypes.string,
        "fr-fr": PropTypes.string,
      }),
    ]).isRequired,
  };

  static defaultProps = {
    campaignReference: null,
    companyLogo: null,
    expirationTime: 0,
  };

  constructor(props) {
    // console.log("CookieKit#constructor");
    super(props);

    this.state = {
      hasClosed: false,
      isOpen: !props.hasConsented,
      isShown: true,
      pulsing: false,
    };

    this.timers = [];

    this.startPulsing();
    this.startDismissTimer();
  }

  // componentDidMount() {
  //   console.log("CookieKit#componentDidMount");
  //   console.dir(this.props);
  //   console.dir(this.state);
  // }

  // componentDidUpdate(prevProps, prevState) {
  //   console.log("CookieKit#componentDidUpdate");
  //   if (this.props !== prevProps) {
  //     console.log("props changed:");
  //     console.dir(this.props);
  //   }
  //   if (this.state !== prevState) {
  //     console.log("state changed:");
  //     console.dir(this.state);
  //   }
  // }

  componentWillUnmount() {
    this.timers.forEach(timer => clearTimeout(timer));
  }

  handleOpen = () => {
    // console.log("CookieKit#handleOpen");
    this.clearTimers();
    this.stopPulsing();

    this.setState({ isOpen: true });
  }

  handlePopupClose = () => {
    // console.log("CookieKit#handlePopupClose");
    const { onConsentStatusChange } = this.props;

    onConsentStatusChange(consentStatuses.closed);

    this.clearTimers();

    this.setState({ hasClosed: true, isOpen: false });

    // HACK: Because `startPulsing` depends on `props.consentsSource` and it
    // could be changed in `onConsentStatusChange` in what seems to be the next
    // event loop, we are also delaying the calls to these methods in the next
    // event loop. Without this, the pulsing is not started.
    setTimeout(() => {
      this.startPulsing();
      this.startDismissTimer();
    }, 1);
  }

  handlePopupLogin = (accessToken) => {
    // console.log("CookieKit#handlePopupLogin");
    const { onAuthentication } = this.props;

    onAuthentication(accessToken);

    this.clearTimers();

    this.setState({ isOpen: false });

    // HACK: Because `startPulsing` depends on `props.consentsSource` and it
    // could be changed in `onAuthentication` in what seems to be the next
    // event loop, we are also delaying the calls to these methods in the next
    // event loop. Without this, the pulsing is not started.
    setTimeout(() => {
      this.startPulsing();
      this.startDismissTimer();
    }, 1);
  }

  handlePopupSubmit = (nextCookieConsentLut) => {
    // console.log("CookieKit#handlePopupSubmit");
    // console.dir(nextCookieConsentLut);
    const {
      hideOnComplete,
      // onConsentStatusChange,
      onCookieConsentsChange,
    } = this.props;

    onCookieConsentsChange(nextCookieConsentLut);
    // I believe complete is implied when onCookieConsentsChange is called.
    // onConsentStatusChange(consentStatuses.complete);

    this.clearTimers();
    this.setState({ isOpen: false });

    if (hideOnComplete) {
      this.setState({ isShown: false, pulsing: false });
    } else {
      // HACK: Because `startPulsing` depends on `props.consentsSource` and it
      // is changed in `onCookieConsentsChange` in what seems to be the next
      // event loop, we are also delaying the calls to these methods in the next
      // event loop. Without this, the pulsing is not started.
      setTimeout(() => {
        this.startPulsing();
        this.startDismissTimer();
      }, 1);
    }
  }

  clearTimers() {
    // console.log("CookieKit#clearTimers");
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
  }

  startPulsing() {
    // console.log("CookieKit#startPulsing");
    const { consentsSource } = this.props;
    const animation = animations[consentsSource];

    if (animation && animation !== animations.noAnimation) {
      this.timers.push(setTimeout(() => this.setState({ pulsing: true }), 500));
      this.timers.push(setTimeout(() => this.stopPulsing(), 4500));
    }
  }

  stopPulsing() {
    // console.log("CookieKit#startPulsing");
    this.setState({ pulsing: false });
  }

  startDismissTimer() {
    // console.log("CookieKit#startDismissTimer");
    const { expirationTime } = this.props;
    const timeOut = expirationTime;

    if (timeOut && timeOut > 0) {
      this.timers.push(setTimeout(() => {
        this.setState({ isShown: false });
      }, timeOut * 1000));
    }
  }

  render() {
    // console.log("CookieKit#render");
    const {
      campaignReference,
      companyLogo,
      consentsSource,
      cookieConsents,
      countryCode,
      hasConsented,
      hideBrandTag,
      position,
      privacyUrl,
      requestDataTypes,
      termsUrl,
      textMessage,
    } = this.props;
    const { hasClosed, isOpen, isShown, pulsing } = this.state;

    const animation = animations[consentsSource] || animations.noAnimation;

    const renderPopup = isOpen || (!hasConsented && !hasClosed);
    const renderButton = !renderPopup;

    // console.log("hasClosed:", hasClosed);
    // console.log("hasConsented:", hasConsented);
    // console.log("pulsing:", pulsing);

    return (
      <div
        className={
          cx(
            "xb-cookie-kit",
            position,
            {
              transparent: !isShown,
            },
          )
        }
      >
        {renderPopup && (
          <CookieKitPopup
            companyLogo={companyLogo}
            cookieConsents={cookieConsents}
            countryCode={countryCode}
            hideBrandTag={hideBrandTag}
            isConnected={!!campaignReference}
            onClose={this.handlePopupClose}
            onLogin={this.handlePopupLogin}
            onSubmit={this.handlePopupSubmit}
            privacyUrl={privacyUrl}
            requestDataTypes={requestDataTypes}
            termsUrl={termsUrl}
            textMessage={textMessage}
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
      </div>
    );
  }
}
