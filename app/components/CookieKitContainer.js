/* eslint-disable no-console */
import PropTypes from "prop-types";
import React from "react";

import xcoobeeConfig from "../config/xcoobeeConfig";

import AuthenticationManager from "../lib/AuthenticationManager";
import CookieConsentsManager from "../lib/CookieConsentsManager";
import NotAuthorizedError from "../lib/NotAuthorizedError";

import {
  consentStatuses,
  cookieTypes,
  cssHref,
  positions,
  tokenKey,
  xcoobeeCookiesKey,
} from "../utils";

import CookieKit from "./CookieKit";

import "../style/main.scss";

const {
  clearAccessToken,
  getAccessToken,
  saveAccessToken,
} = AuthenticationManager;

const {
  clearLocallySaved,
  fetchCompanyPreferenceCookieConsents,
  fetchCountryCode,
  fetchCrowdIntelligenceCookieConsents,
  fetchUserPreferenceCookieConsents,
  fetchUserSettingsCookieConsents,
  saveLocally,
  saveRemotely,
} = CookieConsentsManager;

function callCookieHandler(cookieHandler, cookieConsentLut) {
  if (typeof cookieHandler === "string") {
    if (typeof window[cookieHandler] === "function") {
      window[cookieHandler](cookieConsentLut);
    } else {
      console.error(`Cookie handler function "${cookieHandler}" is missing`);
    }
  } else {
    cookieHandler(cookieConsentLut);
  }
}

function callTargetUrl(targetUrl, cookieConsentLut) {
  const result = {
    time: new Date().toISOString(),
    code: 200,
    result: cookieConsentLut,
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
      }
    });
    error.forEach((e) => {
      throw Error(e.message);
    });
  } else if (error) {
    if (error instanceof NotAuthorizedError) {
      clearAccessToken();
    }
    throw Error(error.message);
  }
}

function refresh() {
  clearAccessToken();
  clearLocallySaved();
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

    const { checkByDefaultTypes } = props;
    const cookieConsents = cookieTypes.map(type => ({
      type,
      checked: checkByDefaultTypes.includes(type),
    }));

    const consentsSource = "unknown";

    this.state = {
      consentsSource,
      consentStatus: consentStatuses.open,
      cookieConsents,
      countryCode: "US",
    };

    if (props.cssAutoLoad) {
      const linkDom = document.createElement("link");

      linkDom.setAttribute("rel", "stylesheet");
      linkDom.setAttribute("href", `${xcoobeeConfig.domain}/${cssHref}`);

      document.head.appendChild(linkDom);
    }
  }

  componentDidMount() {
    // console.log("CookieKitContainer#componentDidMount");
    // console.dir(this.props);
    // console.dir(this.state);
    const { checkByDefaultTypes, displayOnlyForEU } = this.props;

    Promise.all([
      fetchCountryCode(),
      fetchUserSettingsCookieConsents(),
    ])
      .then(([countryCode, userSettingsCookieConsents]) => {
        this.setState({ countryCode });
        if (userSettingsCookieConsents) {
          // console.log("Using saved cookie consents!");
          this.setState({
            consentsSource: "userSettings",
            cookieConsents: userSettingsCookieConsents,
          });
        } else {
          const accessToken = getAccessToken();
          if (accessToken) {
            const { origin } = window.location;

            fetchUserPreferenceCookieConsents(accessToken, origin)
              .then((userPreferenceCookieConsents) => {
                if (userPreferenceCookieConsents) {
                  this.setState({
                    consentsSource: "userPreference",
                    cookieConsents: userPreferenceCookieConsents,
                  });
                } else {
                  const campaignName = window.location.host;

                  fetchCrowdIntelligenceCookieConsents(accessToken, campaignName)
                    .then((crowdIntelligenceCookieConsents) => {
                      if (crowdIntelligenceCookieConsents) {
                        this.setState({
                          consentsSource: "crowdIntelligence",
                          cookieConsents: crowdIntelligenceCookieConsents,
                        });
                      } else {
                        fetchCompanyPreferenceCookieConsents(countryCode, displayOnlyForEU, checkByDefaultTypes)
                          .then((companyPreferenceCookieConsents) => {
                            if (companyPreferenceCookieConsents) {
                              this.setState({
                                consentsSource: "companyPreference",
                                cookieConsents: companyPreferenceCookieConsents,
                              });
                            }
                          });
                      }
                    });
                }
              })
              .catch(handleErrors);
          } else {
            fetchCompanyPreferenceCookieConsents(countryCode, displayOnlyForEU, checkByDefaultTypes)
              .then((companyPreferenceCookieConsents) => {
                if (companyPreferenceCookieConsents) {
                  this.setState({
                    consentsSource: "companyPreference",
                    cookieConsents: companyPreferenceCookieConsents,
                  });
                }
              });
          }
        }
      })
      .catch(handleErrors);
  }

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

    const cookieConsentSettings = {};
    if (consentStatus === consentStatuses.complete) {
      cookieConsents.forEach((consent) => {
        cookieConsentSettings[consent.type] = consent.checked;
      });
    }
    return cookieConsentSettings;
  }

  handleAuthentication = (accessToken) => {
    // console.log("CookieKitContainer#handleAuthentication");
    // console.log("accessToken:", accessToken);
    saveAccessToken(accessToken);

    // TODO: Check that this is the logic we want to run. If so, then make it DRY.
    // It is duplicated above in componentDidMount.
    const { origin } = window.location;
    fetchUserPreferenceCookieConsents(accessToken, origin)
      .then((userPreferenceCookieConsents) => {
        if (userPreferenceCookieConsents) {
          this.setState({
            consentsSource: "userPreference",
            cookieConsents: userPreferenceCookieConsents,
          });
        } else {
          const campaignName = window.location.host;
          fetchCrowdIntelligenceCookieConsents(accessToken, campaignName)
            .then((crowdIntelligenceCookieConsents) => {
              if (crowdIntelligenceCookieConsents) {
                this.setState({
                  consentsSource: "crowdIntelligence",
                  cookieConsents: crowdIntelligenceCookieConsents,
                });
              }
            });
        }
      })
      .catch(handleErrors);
  }

  handleConsentStatusChange = (nextConsentStatus) => {
    // console.log("CookieKitContainer#handleConsentStatusChange");
    // console.log("nextConsentStatus:", nextConsentStatus);
    this.setState({ consentStatus: nextConsentStatus });
  };

  handleCookieConsentsChange = (cookieConsentLut) => {
    // console.log("CookieKitContainer#handleCookieConsentsChange");
    // console.log("cookieConsentLut:", cookieConsentLut);
    const { campaignReference, cookieHandler, targetUrl } = this.props;

    const cookieConsents = cookieTypes.map(type => ({
      type,
      checked: !!cookieConsentLut[type],
    }));

    saveLocally(cookieConsents);

    // TODO: Handle the errors
    const accessToken = getAccessToken();
    saveRemotely(accessToken, cookieConsents, campaignReference)
      .catch(handleErrors);

    this.setState({
      consentsSource: "userSettings",
      consentStatus: consentStatuses.complete,
      cookieConsents,
    });

    if (cookieHandler) {
      callCookieHandler(cookieHandler, cookieConsentLut);
    }

    if (targetUrl) {
      callTargetUrl(targetUrl, cookieConsentLut);
    }
  };

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
    const { consentsSource, cookieConsents, countryCode } = this.state;

    const renderRefreshButton = testMode
      && (localStorage[tokenKey] || localStorage[xcoobeeCookiesKey]);

    return (
      <React.Fragment>
        <CookieKit
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
    );
  }
}
