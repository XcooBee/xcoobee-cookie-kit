import PropTypes from "prop-types";
import React from "react";

import {
  cookieOptionsKeys,
  consentStatuses,
  cookieTypes,
  cssHref,
  euCountries,
  positions,
} from "xcoobee-cookie-kit-core/src/configs";
import cookieConsentsCache from "xcoobee-cookie-kit-core/src/cookieConsentsCache";
import {
  getCountryCode,
  saveCountryCode,
  fetchCountryCode,
} from "xcoobee-cookie-kit-core/src/LocaleManager";
import CookieManager from "xcoobee-cookie-kit-core/src/CookieManager";
import NotAuthorizedError from "xcoobee-cookie-kit-core/src/NotAuthorizedError";

import { xckDomain } from "./configs";

import CookieKit from "./CookieKit";
import BridgeCommunicator from "./BridgeCommunicator";

// const CLOSED = consentStatuses.closed;
const COMPLETE = consentStatuses.complete;
const OPEN = consentStatuses.open;

const SAVED_PREFERENCES = cookieOptionsKeys.savedPreferences;
const USER_SETTINGS = cookieOptionsKeys.userSettings;
const CROWD_AI = cookieOptionsKeys.crowdAi;

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

function handleBridgeError(message) {
  // eslint-disable-next-line max-len
  console.error(`Something went wrong because of error: ${message}. We are experiencing issues saving your cookie category selection. Please contact the site administrator.`);

  XcooBee.kit.setParam("campaignReference", null);
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
    displayOnlyForEU: PropTypes.bool,
    expirationTime: PropTypes.number,
    hideBrandTag: PropTypes.bool,
    hideOnComplete: PropTypes.bool,
    position: PropTypes.oneOf(positions),
    privacyUrl: PropTypes.string.isRequired,
    requestDataTypes: PropTypes.arrayOf(
      PropTypes.oneOf(cookieTypes).isRequired,
    ),
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
  };

  static defaultProps = {
    campaignReference: null,
    checkByDefaultTypes: [],
    companyLogo: null,
    cookieHandler: () => {},
    cssAutoLoad: true,
    displayOnlyForEU: false,
    expirationTime: 0,
    hideBrandTag: false,
    hideOnComplete: false,
    position: "right_bottom",
    requestDataTypes: ["application"],
    targetUrl: null,
    testMode: false,
  };

  constructor(props) {
    // console.log("CookieKitContainer#constructor");
    super(props);

    this.state = {
      consentsSource: "unknown",
      consentStatus: OPEN,
      cookieConsents: null,
      countryCode: getCountryCode(),
      initializing: true,
      isConsentCached: false,
      isLoginStatusChecked: false,
      loginStatus: false,
    };

    if (props.cssAutoLoad) {
      const linkDom = document.createElement("link");

      linkDom.setAttribute("rel", "stylesheet");
      linkDom.setAttribute("href", `${xckDomain}/${cssHref}`);

      document.head.appendChild(linkDom);
    }
  }

  onLoginStatusChange(loginStatus) {
    // console.log("CookieKitContainer#onLoginStatusChange");
    const { isLoginStatusChecked } = this.state;

    this.setState({ loginStatus });

    if (!isLoginStatusChecked) {
      this.getCountryCode();
      this.setState({ isLoginStatusChecked: true });
    }
  }

  getCookieConsents() {
    // console.log("CookieKitContainer#getCookieConsents");
    const cachedCookieConsents = cookieConsentsCache.get();

    if (cachedCookieConsents) {
      // console.log("Using cached cookie consents!");
      this.setCookieConsents("cached", cachedCookieConsents);
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
    const { countryCode } = this.state;

    if (countryCode) {
      this.getCookieConsents();
    } else {
      fetchCountryCode()
        .catch((error) => {
          // console.log("CookieKitContainer#getCountryCode#fetchCountryCode#catch");
          console.error(error);
          return null;
        })
        .then((cCode) => {
          saveCountryCode(cCode);
          this.setState({ countryCode: cCode });
          this.getCookieConsents();
        })
        .catch(handleErrors);
    }
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

  handleCookieConsentsChange = (consentSettings) => {
    // console.log("CookieKitContainer#handleCookieConsentsChange");
    const { loginStatus } = this.state;

    const cookieConsents = cookieTypes.map(type => ({
      type,
      checked: !!consentSettings[type],
    }));

    this.setCookieConsents("usersSaved", cookieConsents);

    const campaignReference = XcooBee.kit.getParam("campaignReference");
    const cookieConsentsObj = {};

    if (loginStatus && !!campaignReference) {
      cookieTypes.forEach((type) => {
        cookieConsentsObj[type] = !!consentSettings[type];
      });

      this.bridgeRef.saveCookieConsents(cookieConsentsObj);
    }
  };

  callCallbacks(cookieConsents) {
    // console.log("CookieKitContainer#callCallbacks");
    const { cookieHandler, targetUrl } = this.props;

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

  // Convenience method
  fallBackToHostDefaults() {
    // console.log("CookieKitContainer#fallBackToHostDefaults");
    const {
      checkByDefaultTypes,
      displayOnlyForEU,
    } = this.props;
    const { countryCode, isConsentCached } = this.state;

    if (isConsentCached) {
      return;
    }

    const hostsDefaultCookieConsents = cookieTypes.map(type => ({
      type,
      checked: checkByDefaultTypes.includes(type),
    }));
    // If we were unable to resolve the user's country code, then assume it is in
    // the EU.
    const cCode = countryCode || euCountries[0];
    if (displayOnlyForEU && !euCountries.includes(cCode)) {
      this.setCookieConsents("hostsDefaults", hostsDefaultCookieConsents);
    } else {
      const consentsSource = "unknown";
      const cookieConsents = hostsDefaultCookieConsents;
      this.setState({ consentsSource, cookieConsents, initializing: false });
    }
  }

  resolveConnectedCookieConsents(cookieOptions) {
    // console.log("CookieKitContainer#resolveConnectedCookieConsents");
    const { isConsentCached, loginStatus } = this.state;

    if (isConsentCached) {
      return;
    }

    let consentsSource = "unknown";
    let cookieConsents = null;

    if (cookieOptions[USER_SETTINGS]) {
      consentsSource = "usersDefaults";
      cookieConsents = cookieOptions[USER_SETTINGS];
    }

    if (cookieOptions[CROWD_AI]) {
      consentsSource = "crowdAi";
      cookieConsents = cookieOptions[CROWD_AI];
    }

    if (cookieOptions[SAVED_PREFERENCES]) {
      consentsSource = "usersSaved";
      cookieConsents = cookieOptions[SAVED_PREFERENCES];
    }

    if (consentsSource !== "unknown" && cookieConsents) {
      const cookieConsentsArray = Object.keys(cookieConsents).map(key => ({ type: key, checked: cookieConsents[key] }));
      const campaignReference = XcooBee.kit.getParam("campaignReference");

      this.setCookieConsents(consentsSource, cookieConsentsArray);

      if (loginStatus && !!campaignReference) {
        this.bridgeRef.saveCookieConsents(cookieConsents);
      }
    } else {
      this.fallBackToHostDefaults();
    }
  }

  render() {
    // console.log("CookieKitContainer#render");
    const {
      campaignReference,
      companyLogo,
      expirationTime,
      hideBrandTag,
      hideOnComplete,
      position,
      privacyUrl,
      requestDataTypes,
      termsUrl,
      testMode,
      textMessage,
    } = this.props;
    const { consentsSource, cookieConsents, countryCode, initializing, loginStatus } = this.state;

    const redefinedPosition = positions.includes(position) ? position : positions[0];

    // console.log("initializing:", initializing);

    return (
      <React.Fragment>
        {!initializing && (
          <React.Fragment>
            <CookieKit
              companyLogo={companyLogo}
              consentsSource={consentsSource}
              cookieConsents={cookieConsents}
              countryCode={countryCode}
              expirationTime={expirationTime}
              hideBrandTag={hideBrandTag}
              hideOnComplete={hideOnComplete}
              loginStatus={loginStatus}
              onConsentStatusChange={this.handleConsentStatusChange}
              onCookieConsentsChange={this.handleCookieConsentsChange}
              position={redefinedPosition}
              privacyUrl={privacyUrl}
              requestDataTypes={requestDataTypes}
              termsUrl={termsUrl}
              testMode={testMode}
              textMessage={textMessage}
            />
          </React.Fragment>
        )}
        <BridgeCommunicator
          ref={(bridgeRef) => {
            this.bridgeRef = bridgeRef;
          }}
          campaignReference={campaignReference}
          onCookieOptionsLoad={cookieOptions => this.resolveConnectedCookieConsents(cookieOptions)}
          onLoginStatusChange={status => this.onLoginStatusChange(status)}
          handleBridgeError={message => handleBridgeError(message)}
        />
      </React.Fragment>
    );
  }
}
