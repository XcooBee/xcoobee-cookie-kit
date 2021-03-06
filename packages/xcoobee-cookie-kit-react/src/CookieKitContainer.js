import fetch from "isomorphic-fetch";
import PropTypes from "prop-types";
import React from "react";

import {
  cookieOptionsKeys,
  consentStatuses,
  cookieTypes,
  cssHrefTheme1,
  cssHrefTheme2,
  euCountries,
  positions,
  themes,
} from "xcoobee-cookie-kit-core/src/configs";
import cookieConsentsCache from "xcoobee-cookie-kit-core/src/cookieConsentsCache";
import { countryCodes, countryMapping } from "xcoobee-cookie-kit-core/src/countryData";

import CookieManager from "xcoobee-cookie-kit-core/src/CookieManager";
import {
  getCountryCode,
  saveCountryCode,
  saveLocale,
  fetchCountryCode,
  fetchCountryCodeForSubscribers,
} from "xcoobee-cookie-kit-core/src/LocaleManager";
import NotAuthorizedError from "xcoobee-cookie-kit-core/src/NotAuthorizedError";

import { xckDomain } from "./configs";

import BridgeCommunicator from "./BridgeCommunicator";
import CookieKit from "./CookieKit";

const COMPLETE = consentStatuses.complete;
const OPEN = consentStatuses.open;

const SAVED_PREFERENCES = cookieOptionsKeys.savedPreferences;
const USER_SETTINGS = cookieOptionsKeys.userSettings;
const CROWD_AI = cookieOptionsKeys.crowdAi;

const DEFAULT_COUNTRY_CODE = "EU";

function callCookieManagingFunctions(consentSettings) {
  CookieManager.xckClearCookies(consentSettings);
  CookieManager.xckHandleXbeeScriptTags(consentSettings);
  CookieManager.xckHandleXbeeCookieTags(consentSettings);
}

function callCookieHandler(cookieHandler, consentSettings) {
  if (typeof cookieHandler === "string") {
    if (typeof window[cookieHandler] === "function") {
      window[cookieHandler](consentSettings);
    } else {
      console.error(`Cookie handler function "${cookieHandler}" is missing`);
    }
  } else {
    cookieHandler(consentSettings);
  }
}

function callTargetUrl(targetUrl, consentSettings) {
  const result = {
    time: new Date().toISOString(),
    code: 200,
    result: consentSettings,
  };

  fetch(targetUrl, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(result),
    mode: "no-cors",
  });
}

function handleErrors(error) {
  if (Array.isArray(error)) {
    error.forEach((e) => {
      if (e instanceof NotAuthorizedError) {
        console.error(error.message);
      } else {
        throw Error(e.message);
      }
    });
  } else if (error) {
    if (error instanceof NotAuthorizedError) {
      console.error(error.message);
    } else {
      throw Error(error.message);
    }
  }
}

export default class CookieKitContainer extends React.PureComponent {
  static propTypes = {
    campaignReference: PropTypes.string,
    checkByDefaultTypes: PropTypes.arrayOf(
      PropTypes.oneOf(cookieTypes).isRequired,
    ),
    companyLogo: PropTypes.string,
    cookieHandler: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.string,
    ]),
    cssAutoLoad: PropTypes.bool,
    defaultCountryCode: PropTypes.oneOf([...countryCodes, DEFAULT_COUNTRY_CODE]),
    detectCountry: PropTypes.bool,
    displayDoNotSell: PropTypes.bool,
    displayFingerprint: PropTypes.bool,
    displayOnlyForEU: PropTypes.bool,
    expirationTime: PropTypes.number,
    hideBrandTag: PropTypes.bool,
    hideOnComplete: PropTypes.bool,
    position: PropTypes.oneOf(positions),
    privacyUrl: PropTypes.string.isRequired,
    requestDataTypes: PropTypes.arrayOf(
      PropTypes.oneOf(cookieTypes).isRequired,
    ),
    suspendAnimationTime: PropTypes.number,
    targetUrl: PropTypes.string,
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
    checkByDefaultTypes: [],
    companyLogo: null,
    cookieHandler: () => {},
    cssAutoLoad: true,
    defaultCountryCode: DEFAULT_COUNTRY_CODE,
    detectCountry: false,
    displayDoNotSell: false,
    displayFingerprint: false,
    displayOnlyForEU: false,
    expirationTime: 0,
    hideBrandTag: false,
    hideOnComplete: false,
    position: "right_bottom",
    requestDataTypes: ["application"],
    suspendAnimationTime: 600,
    targetUrl: null,
    testMode: false,
    theme: "popup",
  };

  constructor(props) {
    // console.log("CookieKitContainer#constructor");
    super(props);

    this.state = {
      campaignReference: props.campaignReference,
      consentsSource: "unknown",
      consentStatus: OPEN,
      cookieConsents: null,
      countryCode: getCountryCode(),
      defaultCountryCode: countryCodes.includes(props.defaultCountryCode)
        ? props.defaultCountryCode
        : DEFAULT_COUNTRY_CODE,
      display: true,
      initializing: true,
      isAnimated: true,
      isConsentCached: false,
      isLoginStatusChecked: false,
      loginStatus: false,
    };

    if (props.cssAutoLoad) {
      const linkDom = document.createElement("link");
      const cssHref = props.theme === "popup" ? cssHrefTheme1 : cssHrefTheme2;

      linkDom.setAttribute("rel", "stylesheet");
      linkDom.setAttribute("href", `${xckDomain}/${cssHref}`);

      document.head.appendChild(linkDom);
    }
  }

  onLoginStatusChange = (loginStatus) => {
    // console.log("CookieKitContainer#onLoginStatusChange");
    const { isLoginStatusChecked } = this.state;

    this.setState({ loginStatus });

    if (!isLoginStatusChecked) {
      this.setState({ isLoginStatusChecked: true });
      this.getCountryCode()
        .then(() => this.getCookieConsents())
        .catch(handleErrors);
    }
  };

  getCookieConsents() {
    // console.log("CookieKitContainer#getCookieConsents");
    const { suspendAnimationTime } = this.props;
    const { cookieConsents, lastUpdated } = cookieConsentsCache.get();

    if (lastUpdated && !!suspendAnimationTime && (Date.now() - lastUpdated) < suspendAnimationTime * 1000) {
      this.setState({ isAnimated: false });
    }

    if (cookieConsents) {
      // console.log("Using cached cookie consents!");
      this.setCookieConsents("cached", cookieConsents);
      this.setState({ isConsentCached: true });

      return;
    }

    const { campaignReference } = this.props;
    const { loginStatus } = this.state;

    const isConnected = !!campaignReference;

    if (!isConnected || !loginStatus) {
      this.fallBackToHostDefaults();
    }
  }

  getCountryCode() {
    const { campaignReference, detectCountry } = this.props;
    const { countryCode, defaultCountryCode } = this.state;

    if (countryCode) {
      return Promise.resolve(countryCode);
    }

    if (detectCountry) {
      let promise;

      if (campaignReference) {
        promise = Promise.resolve(fetchCountryCodeForSubscribers(campaignReference));
      } else {
        promise = Promise.resolve(fetchCountryCode());
      }

      return promise
        .then((cCode) => {
          saveCountryCode(cCode);
          this.setState({ countryCode: cCode });

          return cCode;
        })
        .catch((error) => {
          console.error(error);
          this.setState({ countryCode: defaultCountryCode });

          return defaultCountryCode;
        });
    }

    this.setState({ countryCode: defaultCountryCode });
    saveCountryCode(defaultCountryCode);
    saveLocale(countryMapping[defaultCountryCode]?.locale || "en-us");

    return Promise.resolve(defaultCountryCode);
  }

  getConsentStatus() {
    const { consentStatus } = this.state;

    return consentStatus;
  }

  getCookieTypes() {
    const { consentStatus, cookieConsents } = this.state;

    const consentSettings = {};

    if (consentStatus === COMPLETE) {
      cookieConsents.forEach((consent) => {
        consentSettings[consent.type] = consent.checked;
      });
    }
    return consentSettings;
  }

  // Convenience method
  setCookieConsents(consentsSource, cookieConsents) {
    // console.log("CookieKitContainer#setCookieConsents");
    cookieConsentsCache.put(cookieConsents);

    const consentStatus = COMPLETE;

    this.setState({
      consentsSource,
      consentStatus,
      cookieConsents,
      initializing: false,
    }, () => this.callCallbacks(cookieConsents));
  }

  handleConsentStatusChange = (nextConsentStatus) => {
    // console.log("CookieKitContainer#handleConsentStatusChange");
    // console.log("nextConsentStatus:", nextConsentStatus);
    this.setState({ consentStatus: nextConsentStatus });
  };

  handleCookieConsentsChange = (consentSettings, doNotSellConsent, fingerprintConsent) => {
    // console.log("CookieKitContainer#handleCookieConsentsChange");
    const { campaignReference, loginStatus } = this.state;

    const cookieConsents = cookieTypes.map(type => ({
      type,
      checked: !!consentSettings[type],
    }));
    cookieConsents.push({ type: "donotsell", checked: doNotSellConsent });
    cookieConsents.push({ type: "fingerprint", checked: fingerprintConsent });

    this.setCookieConsents("usersSaved", cookieConsents);

    const cookieConsentsObj = {};

    if (loginStatus && !!campaignReference) {
      cookieTypes.forEach((type) => {
        cookieConsentsObj[type] = !!consentSettings[type];
      });
      cookieConsentsObj.fingerprint = fingerprintConsent;

      this.bridgeRef.saveCookieConsents(cookieConsentsObj);
    }
  };

  handleBridgeError = (errorMessage) => {
    // eslint-disable-next-line max-len
    console.error(`Something went wrong because of error: ${errorMessage}. We are experiencing issues saving your cookie category selection. Please contact the site administrator.`);

    const error = new NotAuthorizedError();

    if (errorMessage === error.message) {
      this.setState({ loginStatus: false });
      this.fallBackToHostDefaults();
    } else {
      this.setState({ campaignReference: null });
    }
  };

  resolveConnectedCookieConsents = (cookieOptions) => {
    // console.log("CookieKitContainer#resolveConnectedCookieConsents");
    const { campaignReference, isConsentCached, loginStatus } = this.state;

    if (isConsentCached) {
      return;
    }

    let consentsSource = "unknown";
    let cookieConsents = null;

    if (cookieOptions[USER_SETTINGS] && Object.values(cookieOptions[USER_SETTINGS]).includes(true)) {
      consentsSource = "usersDefaults";
      cookieConsents = cookieOptions[USER_SETTINGS];
    }

    if (cookieOptions[CROWD_AI] && Object.values(cookieOptions[CROWD_AI]).includes(true)) {
      consentsSource = "crowdAi";
      cookieConsents = cookieOptions[CROWD_AI];
    }

    if (cookieOptions[SAVED_PREFERENCES] && Object.values(cookieOptions[SAVED_PREFERENCES]).includes(true)) {
      consentsSource = "usersSaved";
      cookieConsents = cookieOptions[SAVED_PREFERENCES];
    }

    if (consentsSource !== "unknown" && cookieConsents) {
      const cookieConsentsArray = Object.keys(cookieConsents).map(key => ({ type: key, checked: cookieConsents[key] }));

      this.setCookieConsents(consentsSource, cookieConsentsArray);

      if (loginStatus && !!campaignReference) {
        this.bridgeRef.saveCookieConsents(cookieConsents);
      }
    } else {
      this.fallBackToHostDefaults();
    }
  };

  // Convenience method
  fallBackToHostDefaults() {
    // console.log("CookieKitContainer#fallBackToHostDefaults");
    const {
      displayOnlyForEU,
      requestDataTypes,
    } = this.props;
    const { countryCode, isConsentCached } = this.state;

    if (isConsentCached) {
      return;
    }

    // If we were unable to resolve the user's country code, then assume it is in
    // the EU.
    const cCode = countryCode || euCountries[0];
    if (displayOnlyForEU && !euCountries.includes(cCode)) {
      const hostsDefaultCookieConsents = checkByDefaultTypes.map(type => ({
        type,
        checked: requestDataTypes.includes(type),
      }));
      hostsDefaultCookieConsents.push({ type: "donotsell", checked: false });
      hostsDefaultCookieConsents.push({ type: "fingerprint", checked: false });
      this.setCookieConsents("hostsDefaults", hostsDefaultCookieConsents);
    } else {
      const consentsSource = "unknown";
      // Note: We can always set "application" to checked even if it is not in
      // requestDataTypes because CookieKitPopup will filter everything based on
      // requestDataTypes. Alternatively, we can pre-filter here too. We opted for the
      // former.
      const cookieConsents = [{ type: "application", checked: true }];
      this.setState({ consentsSource, cookieConsents, initializing: false });
    }
  }

  callCallbacks(cookieConsents) {
    // console.log("CookieKitContainer#callCallbacks");
    const { cookieHandler, targetUrl } = this.props;

    // type ConsentSettings = {
    //   [ConsentType]: bool,
    // }

    const consentSettings = {};
    cookieConsents.forEach((cookieConsent) => {
      consentSettings[cookieConsent.type] = cookieConsent.checked;
    });

    callCookieManagingFunctions(consentSettings);

    if (cookieHandler) {
      callCookieHandler(cookieHandler, consentSettings);
    }

    if (targetUrl) {
      callTargetUrl(targetUrl, consentSettings);
    }
  }

  display(value) {
    this.setState({ display: value });
  }

  render() {
    // console.log("CookieKitContainer#render");
    const {
      companyLogo,
      displayDoNotSell,
      displayFingerprint,
      expirationTime,
      hideBrandTag,
      hideOnComplete,
      position,
      privacyUrl,
      requestDataTypes,
      termsUrl,
      testMode,
      textMessage,
      theme,
    } = this.props;

    const {
      campaignReference,
      consentsSource,
      consentStatus,
      cookieConsents,
      countryCode,
      display,
      initializing,
      isAnimated,
      loginStatus,
    } = this.state;

    const defaultPositionIndex = theme === "overlay" ? 4 : 0;
    const redefinedPosition = positions.includes(position) ? position : positions[defaultPositionIndex];

    const cookies = cookieConsents
      ? cookieConsents.filter(consent => consent.type !== "fingerprint" && consent.type !== "donotsell")
      : null;
    const donotsell = cookieConsents ? cookieConsents.find(consent => consent.type === "donotsell") : null;
    const fingerprint = cookieConsents ? cookieConsents.find(consent => consent.type === "fingerprint") : null;

    const doNotSellConsent = donotsell ? donotsell.checked : false;
    const fingerprintConsent = fingerprint ? fingerprint.checked : false;

    // console.log("initializing:", initializing);

    return (
      <React.Fragment>
        {!initializing && (
          <React.Fragment>
            <CookieKit
              campaignReference={campaignReference}
              companyLogo={companyLogo}
              consentsSource={consentsSource}
              consentStatus={consentStatus}
              cookieConsents={cookies}
              countryCode={countryCode}
              display={display}
              displayDoNotSell={displayDoNotSell}
              displayFingerprint={displayFingerprint}
              doNotSellConsent={doNotSellConsent}
              expirationTime={expirationTime}
              fingerprintConsent={fingerprintConsent}
              hideBrandTag={hideBrandTag}
              hideOnComplete={hideOnComplete}
              isAnimated={isAnimated}
              loginStatus={loginStatus}
              onConsentStatusChange={this.handleConsentStatusChange}
              onCookieConsentsChange={this.handleCookieConsentsChange}
              position={redefinedPosition}
              privacyUrl={privacyUrl}
              requestDataTypes={requestDataTypes}
              termsUrl={termsUrl}
              testMode={testMode}
              textMessage={textMessage}
              theme={theme}
            />
          </React.Fragment>
        )}
        <BridgeCommunicator
          ref={(bridgeRef) => {
            this.bridgeRef = bridgeRef;
          }}
          campaignReference={campaignReference}
          onCookieOptionsLoad={this.resolveConnectedCookieConsents}
          onLoginStatusChange={this.onLoginStatusChange}
          handleBridgeError={this.handleBridgeError}
        />
      </React.Fragment>
    );
  }
}
