import cx from "classnames";
import PropTypes from "prop-types";
import React from "react";
import {
  animations,
  consentsSources,
  consentStatuses,
  cookieTypes,
  positions,
  themes,
} from "xcoobee-cookie-kit-core/src/configs";

import {
  clearLocale,
  clearCountryCode,
} from "xcoobee-cookie-kit-core/src/LocaleManager";

import cookieConsentsCache from "xcoobee-cookie-kit-core/src/cookieConsentsCache";

import CookieConsentShape from "./lib/CookieConsentShape";

import CookieKitPopup from "./CookieKitPopup";

const COMPLETE = consentStatuses.complete;
const CLOSED = consentStatuses.closed;

const BLOCK = "xb-cookie-kit";

function reset() {
  clearLocale();
  clearCountryCode();
  cookieConsentsCache.clear();
  window.location.reload();
}

function ResetButton() {
  const className = "xb-cookie-kit__button xb-cookie-kit__reset-button";
  return (
    <button type="button" className={className} onClick={reset}>Reset</button>
  );
}

export default class CookieKit extends React.PureComponent {
  static propTypes = {
    campaignReference: PropTypes.string,
    companyLogo: PropTypes.string,
    consentsSource: PropTypes.oneOf(consentsSources).isRequired,
    consentStatus: PropTypes.oneOf(Object.values(consentStatuses)).isRequired,
    cookieConsents: PropTypes.arrayOf(CookieConsentShape.isRequired).isRequired,
    displayFingerprint: PropTypes.bool,
    expirationTime: PropTypes.number,
    fingerprintConsent: PropTypes.bool,
    hideBrandTag: PropTypes.bool.isRequired,
    hideOnComplete: PropTypes.bool.isRequired,
    loginStatus: PropTypes.bool,
    onConsentStatusChange: PropTypes.func.isRequired,
    onCookieConsentsChange: PropTypes.func.isRequired,
    position: PropTypes.oneOf(positions).isRequired,
    privacyUrl: PropTypes.string.isRequired,
    requestDataTypes: PropTypes.arrayOf(
      PropTypes.oneOf(cookieTypes).isRequired,
    ).isRequired,
    termsUrl: PropTypes.string.isRequired,
    testMode: PropTypes.bool,
    textMessage: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        "en-us": PropTypes.string,
        "de-de": PropTypes.string,
        "es-419": PropTypes.string,
        "fr-fr": PropTypes.string,
      }),
    ]).isRequired,
    theme: PropTypes.oneOf(themes),
  };

  static defaultProps = {
    campaignReference: null,
    companyLogo: null,
    displayFingerprint: false,
    expirationTime: 0,
    fingerprintConsent: false,
    loginStatus: false,
    testMode: false,
    theme: "popup",
  };

  constructor(props) {
    // console.log("CookieKit#constructor");
    super(props);

    const isOpen = props.consentsSource === "unknown";
    this.state = {
      animated: true,
      hasClosed: false,
      isOpen: false,
      isShown: true,
      pulsing: false,
      transparent: false,
    };

    this.timers = [];

    this.startPulsing();
    if (!isOpen) {
      this.startDismissTimer();
    }
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
    const { transparent } = this.state;

    if (transparent) {
      return;
    }

    this.clearTimers();
    this.stopPulsing();

    this.setState({ isOpen: true });
  };

  handlePopupClose = () => {
    // console.log("CookieKit#handlePopupClose");
    const { consentStatus, onConsentStatusChange } = this.props;

    if (consentStatus !== COMPLETE) {
      onConsentStatusChange(CLOSED);
    }

    this.clearTimers();
    this.startDismissTimer();

    this.setState({ hasClosed: true, isOpen: false });
  };

  handlePopupLogin = () => {
    // console.log("CookieKit#handlePopupLogin");
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
  };

  handlePopupSubmit = (nextConsentSettings, fingerprintConsent) => {
    // console.log("CookieKit#handlePopupSubmit");
    // console.dir(nextConsentSettings);
    const {
      hideOnComplete,
      onCookieConsentsChange,
    } = this.props;

    onCookieConsentsChange(nextConsentSettings, fingerprintConsent);

    this.clearTimers();
    this.setState({ isOpen: false });

    if (hideOnComplete) {
      this.setState({ pulsing: false, transparent: true });
      this.timers.push(setTimeout(() => {
        this.setState({ isShown: false });
      }, 1000));
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
  };

  clearTimers() {
    // console.log("CookieKit#clearTimers");
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
  }

  startPulsing() {
    // console.log("CookieKit#startPulsing");
    const { consentsSource, hideOnComplete } = this.props;
    const animation = animations[consentsSource];

    if (animation && animation !== "default") {
      this.timers.push(setTimeout(() => this.setState({ animated: true, pulsing: true }), 500));
      this.timers.push(setTimeout(() => this.stopPulsing(), 4500));
      this.timers.push(setTimeout(() => this.setState({ animated: false }), 5000));

      if (hideOnComplete) {
        this.timers.push(setTimeout(() => {
          this.setState({ transparent: true });
        }, 5000));
        this.timers.push(setTimeout(() => {
          this.setState({ isShown: false });
        }, 6000));
      }
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
        this.setState({ transparent: true });
      }, timeOut * 1000));
      this.timers.push(setTimeout(() => {
        this.setState({ isShown: false });
      }, timeOut * 1000 + 1000));
    }
  }

  render() {
    // console.log("CookieKit#render");
    const {
      campaignReference,
      companyLogo,
      consentsSource,
      cookieConsents,
      displayFingerprint,
      fingerprintConsent,
      hideBrandTag,
      loginStatus,
      position,
      privacyUrl,
      requestDataTypes,
      termsUrl,
      testMode,
      textMessage,
      theme,
    } = this.props;
    const { animated, hasClosed, isOpen, isShown, pulsing, transparent } = this.state;

    const animation = animated ? animations[consentsSource] : animations.unknown;

    const renderPopup = isOpen || (consentsSource === "unknown" && !hasClosed);
    const renderButton = !renderPopup;

    const renderResetButton = theme === "popup" && testMode && cookieConsentsCache.get();

    return (
      isShown && (
        <div
          className={
            cx(
              BLOCK,
              position,
              {
                transparent,
              },
              {
                scroll: isOpen,
              },
            )
          }
        >
          {renderPopup && (
            <CookieKitPopup
              companyLogo={companyLogo}
              cookieConsents={cookieConsents}
              displayFingerprint={displayFingerprint}
              fingerprintConsent={fingerprintConsent}
              hideBrandTag={hideBrandTag}
              loginStatus={loginStatus}
              isConnected={!!campaignReference}
              onClose={this.handlePopupClose}
              onLogin={this.handlePopupLogin}
              onSubmit={this.handlePopupSubmit}
              privacyUrl={privacyUrl}
              requestDataTypes={requestDataTypes}
              termsUrl={termsUrl}
              textMessage={textMessage}
              theme={theme}
            />
          )}
          {renderButton && (
            <button
              type="button"
              className={`${BLOCK}__button ${BLOCK}__cookie-button`}
              onClick={this.handleOpen}
            >
              <div
                className={
                  cx(
                    `${BLOCK}__cookie-icon`,
                    `${BLOCK}__cookie-icon--${animation}`,
                    {
                      [`${BLOCK}__pulsing`]: pulsing,
                    },
                  )
                }
              />
            </button>
          )}
          {renderResetButton && (<ResetButton />)}
        </div>
      )
    );
  }
}
