import cx from "classnames";
import PropTypes from "prop-types";
import React from "react";
import {
  animations,
  consentsSources,
  consentStatuses,
  cookieTypes,
  positions,
} from "xcoobee-cookie-kit-core/src/configs";

import {
  clearLocale,
  clearCountryCode,
} from "xcoobee-cookie-kit-core/src/LocaleManager";

import cookieConsentsCache from "xcoobee-cookie-kit-core/src/cookieConsentsCache";

import CookieConsentShape from "./lib/CookieConsentShape";

import CookieKitPopup from "./CookieKitPopup";

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
    displayFingerprint: PropTypes.bool,
    companyLogo: PropTypes.string,
    consentsSource: PropTypes.oneOf(consentsSources).isRequired,
    cookieConsents: PropTypes.arrayOf(CookieConsentShape.isRequired).isRequired,
    countryCode: PropTypes.string,
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
  };

  static defaultProps = {
    displayFingerprint: false,
    companyLogo: null,
    countryCode: null,
    expirationTime: 0,
    fingerprintConsent: false,
    loginStatus: false,
    testMode: false,
  };

  constructor(props) {
    // console.log("CookieKit#constructor");
    super(props);

    const isOpen = props.consentsSource === "unknown";
    this.state = {
      hasClosed: false,
      isOpen,
      isShown: true,
      pulsing: false,
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
    const { pulsing } = this.state;

    if (pulsing) {
      return;
    }

    this.clearTimers();
    this.stopPulsing();

    this.setState({ isOpen: true });
  };

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
  };

  clearTimers() {
    // console.log("CookieKit#clearTimers");
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers = [];
  }

  startPulsing() {
    // console.log("CookieKit#startPulsing");
    const { consentsSource } = this.props;
    const animation = animations[consentsSource];

    if (animation && animation !== "default") {
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
      displayFingerprint,
      companyLogo,
      consentsSource,
      cookieConsents,
      countryCode,
      fingerprintConsent,
      hideBrandTag,
      loginStatus,
      position,
      privacyUrl,
      requestDataTypes,
      termsUrl,
      testMode,
      textMessage,
    } = this.props;
    const { hasClosed, isOpen, isShown, pulsing } = this.state;

    const animation = animations[consentsSource];

    const renderPopup = isOpen || (consentsSource === "unknown" && !hasClosed);
    const renderButton = !renderPopup;

    const renderResetButton = testMode && cookieConsentsCache.get();

    const campaignReference = XcooBee.kit.getParam("campaignReference");

    return (
      <div
        className={
          cx(
            BLOCK,
            position,
            {
              transparent: !isShown,
            },
            {
              scroll: isOpen,
            },
          )
        }
      >
        {renderPopup && (
          <CookieKitPopup
            displayFingerprint={displayFingerprint}
            companyLogo={companyLogo}
            cookieConsents={cookieConsents}
            countryCode={countryCode}
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
    );
  }
}
