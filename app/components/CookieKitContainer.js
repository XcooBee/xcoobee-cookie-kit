import PropTypes from "prop-types";
import React from "react";

import xcoobeeConfig from "../config/xcoobeeConfig";

import {
  clearAccessToken,
  getAccessToken,
  saveAccessToken,
} from "../lib/AccessTokenManager";
import cookieConsentsCache from "../lib/cookieConsentsCache";
import {
  fetchCountryCode,
  fetchCrowdAiCookieConsents,
  fetchUsersDefaultCookieConsents,
  fetchUsersSiteCookieConsents,
  fetchUserSettings,
  saveRemotely,
} from "../lib/CookieConsentsManager";
import NotAuthorizedError from "../lib/NotAuthorizedError";

import {
  consentStatuses,
  cookieTypes,
  cssHref,
  euCountries,
  positions,
} from "../utils";

import CookieKit from "./CookieKit";

import "../style/main.scss";

// const CLOSED = consentStatuses.closed;
const COMPLETE = consentStatuses.complete;
const OPEN = consentStatuses.open;

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
        clearAccessToken();
        console.error(error.message);
      } else {
        error.forEach((e) => {
          throw Error(e.message);
        });
      }
    });
  } else if (error) {
    if (error instanceof NotAuthorizedError) {
      clearAccessToken();
      console.error(error.message);
    } else {
      throw Error(error.message);
    }
  }
}

function refresh() {
  clearAccessToken();
  cookieConsentsCache.clear();
  window.location.reload();
}

function RefreshButton() {
  const className = "xb-cookie-kit__button xb-cookie-kit__refresh-button";
  return (
    <button type="button" className={className} onClick={refresh}>Refresh</button>
  );
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
      accessToken: getAccessToken(),
      consentsSource: "unknown",
      consentStatus: OPEN,
      cookieConsents: null,
      countryCode: "US",
      initializing: true,
    };

    fetchCountryCode()
      .then((countryCode) => {
        this.setState({ countryCode });

        const cachedCookieConsents = cookieConsentsCache.get();
        if (cachedCookieConsents) {
          // console.log("Using cached cookie consents!");
          this.setCookieConsents("cached", cachedCookieConsents);
          return;
        }

        const { campaignReference } = this.props;

        const isConnected = !!campaignReference;
        const { accessToken } = this.state;

        if (isConnected && accessToken) {
          this.resolveConnectedCookieConsents().catch(handleErrors);
        } else {
          this.fallBackToHostDefaults();
        }
      })
      .catch(handleErrors);

    if (props.cssAutoLoad) {
      const linkDom = document.createElement("link");

      linkDom.setAttribute("rel", "stylesheet");
      linkDom.setAttribute("href", `${xcoobeeConfig.domain}/${cssHref}`);

      document.head.appendChild(linkDom);
    }
  }

  // componentDidMount() {
  //   // console.log("CookieKitContainer#componentDidMount");
  //   // console.dir(this.props);
  //   // console.dir(this.state);
  // }

  // componentDidUpdate(prevProps, prevState) {
  //   console.log("CookieKitContainer#componentDidUpdate");
  //   if (this.props !== prevProps) {
  //     console.log("props changed:");
  //     console.dir(this.props);
  //   }
  //   if (this.state !== prevState) {
  //     console.log("state changed:");
  //     console.dir(this.state);
  //   }
  // }

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
    });
    this.callCallbacks(cookieConsents);
  }

  handleAuthentication = (accessToken) => {
    // console.log("CookieKitContainer#handleAuthentication");
    // console.log("accessToken:", accessToken);
    saveAccessToken(accessToken);
    this.setState({ accessToken });

    const { campaignReference } = this.props;

    const isConnected = !!campaignReference;

    if (isConnected) {
      this.resolveConnectedCookieConsents().catch(handleErrors);
    }
  }

  handleConsentStatusChange = (nextConsentStatus) => {
    // console.log("CookieKitContainer#handleConsentStatusChange");
    // console.log("nextConsentStatus:", nextConsentStatus);
    this.setState({ consentStatus: nextConsentStatus });
  };

  handleCookieConsentsChange = (consentSettings) => {
    // console.log("CookieKitContainer#handleCookieConsentsChange");
    // console.log("consentSettings:", consentSettings);

    const cookieConsents = cookieTypes.map(type => ({
      type,
      checked: !!consentSettings[type],
    }));

    const { campaignReference } = this.props;
    const { accessToken } = this.state;
    saveRemotely(accessToken, cookieConsents, campaignReference)
      .catch(handleErrors);

    this.setCookieConsents("usersSaved", cookieConsents);
  };

  callCallbacks(cookieConsents) {
    // console.log("CookieKitContainer#callCallbacks");
    const { cookieHandler, targetUrl } = this.props;

    const consentSettings = {};
    cookieConsents.forEach((cookieConsent) => {
      consentSettings[cookieConsent.type] = cookieConsent.checked;
    });

    if (cookieHandler) {
      callCookieHandler(cookieHandler, consentSettings);
    }

    if (targetUrl) {
      callTargetUrl(targetUrl, consentSettings);
    }
  }

  // Convenience method
  fallBackToHostDefaults() {
    const {
      checkByDefaultTypes,
      displayOnlyForEU,
    } = this.props;
    const { countryCode } = this.state;

    const hostsDefaultCookieConsents = cookieTypes.map(type => ({
      type,
      checked: checkByDefaultTypes.includes(type),
    }));
    if (!euCountries.includes(countryCode) && displayOnlyForEU) {
      this.setCookieConsents("hostsDefaults", hostsDefaultCookieConsents);
    } else {
      const consentsSource = "unknown";
      const cookieConsents = hostsDefaultCookieConsents;
      this.setState({ consentsSource, cookieConsents, initializing: false });
    }
  }

  resolveConnectedCookieConsents() {
    // console.log("CookieKitContainer#resolveConnectedCookieConsents");
    const { accessToken } = this.state;
    return fetchUserSettings(accessToken)
      .then((userSettings) => {
        if (userSettings) {
          // Check to see if user already has consent settings for the current site
          const { origin } = window.location;
          const { userCursor, xcoobeeId } = userSettings;
          fetchUsersSiteCookieConsents(accessToken, origin, xcoobeeId, userCursor)
            .then((usersSavedCookieConsents) => {
              if (usersSavedCookieConsents) {
                this.setCookieConsents("usersSaved", usersSavedCookieConsents);
                return;
              }

              let promise;
              if (userSettings.acceptCrowdAI) {
                const campaignName = window.location.host;
                promise = fetchCrowdAiCookieConsents(accessToken, campaignName);
              } else {
                promise = Promise.resolve();
              }
              promise.then((crowdAiCookieConsents) => {
                if (crowdAiCookieConsents) {
                  this.setCookieConsents("crowdAi", crowdAiCookieConsents);
                  return;
                }

                const usersDefaultCookieConsents = fetchUsersDefaultCookieConsents(userSettings);
                if (usersDefaultCookieConsents) {
                  this.setCookieConsents("usersDefaults", usersDefaultCookieConsents);
                  return;
                }

                this.fallBackToHostDefaults();
              });
            });
        } else {
          this.fallBackToHostDefaults();
        }
      });
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
    const { accessToken, consentsSource, cookieConsents, countryCode, initializing } = this.state;

    const renderRefreshButton = testMode
      && (accessToken || cookieConsentsCache.get());

    // console.log('initializing:', initializing);

    return (
      <React.Fragment>
        {!initializing && (
          <React.Fragment>
            <CookieKit
              accessToken={accessToken}
              campaignReference={campaignReference}
              companyLogo={companyLogo}
              consentsSource={consentsSource}
              cookieConsents={cookieConsents}
              countryCode={countryCode}
              expirationTime={expirationTime}
              hideBrandTag={hideBrandTag}
              hideOnComplete={hideOnComplete}
              onAuthentication={this.handleAuthentication}
              onConsentStatusChange={this.handleConsentStatusChange}
              onCookieConsentsChange={this.handleCookieConsentsChange}
              position={position}
              privacyUrl={privacyUrl}
              requestDataTypes={requestDataTypes}
              termsUrl={termsUrl}
              textMessage={textMessage}
            />
            {renderRefreshButton && (<RefreshButton />)}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}
