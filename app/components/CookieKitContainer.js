/* eslint-disable no-console */
import React from "react";

import AuthenticationManager from "../lib/AuthenticationManager";
import ConfigShape from "../lib/ConfigShape";
import CookieConsentsManager from "../lib/CookieConsentsManager";

import { consentStatuses, cookieTypes } from "../utils";

import CookieKit from "./CookieKit";

const {
  clearAccessToken,
  getAccessToken,
  saveAccessToken,
} = AuthenticationManager;

const {
  clearLocallySaved,
  fetchCountryCode,
  fetchCrowdIntelligenceCookieConsents,
  fetchUserPreferenceCookieConsents,
  fetchUserSettingsCookieConsents,
  saveLocally,
  saveRemotely,
} = CookieConsentsManager;

function callCookieHandler(config, cookieConsentLut) {
  if (typeof config.cookieHandler === "string") {
    if (typeof window[config.cookieHandler] === "function") {
      window[config.cookieHandler](cookieConsentLut);
    } else {
      console.error(`Cookie handler function "${config.cookieHandler}" is missing`);
    }
  } else {
    config.cookieHandler(cookieConsentLut);
  }
}

function callTargetUrl(config, cookieConsentLut) {
  const result = {
    time: new Date().toISOString(),
    code: 200,
    result: cookieConsentLut,
  };

  fetch(config.targetUrl,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(result),
      mode: "no-cors",
    });
}

function refresh() {
  clearAccessToken();
  clearLocallySaved();
  window.location.reload();
}

export default class CookieKitContainer extends React.PureComponent {
  static propTypes = {
    config: ConfigShape.isRequired,
  };

  constructor(props) {
    // console.log("CookieKitContainer#constructor");
    super(props);

    const cookieConsents = cookieTypes.map(type => ({
      type,
      checked: false,
    }));

    const consentsSource = "unknown";

    this.state = {
      consentsSource,
      consentStatus: consentStatuses.open,
      cookieConsents,
      countryCode: "US",
    };
  }

  // async componentDidMount() {
  //   console.log("CookieKitContainer#componentDidMount");

  //   const [userSettingsCookieConsents, countryCode] = Promise.all([
  //     fetchCountryCode(),
  //     fetchUserSettingsCookieConsents(),
  //   ]);

  //   this.setState({ countryCode });
  //   if (userSettingsCookieConsents) {
  //     this.setState({
  //       consentsSource: "userSettings",
  //       cookieConsents: userSettingsCookieConsents,
  //     });
  //   } else {
  //     const accessToken = getAccessToken();
  //     if (accessToken) {
  //       const { origin } = window.location;
  //       const userPreferenceCookieConsents = await fetchUserPreferenceCookieConsents(accessToken, origin);
  //       if (userPreferenceCookieConsents) {
  //         this.setState({
  //           consentsSource: "userPreference",
  //           cookieConsents: userPreferenceCookieConsents,
  //         });
  //       } else {
  //         const campaignName = window.location.host;
  //         const crowdIntelligenceCookieConsents = await fetchCrowdIntelligenceCookieConsents(accessToken, campaignName);
  //         if (crowdIntelligenceCookieConsents) {
  //           this.setState({
  //             consentsSource: "crowdIntelligence",
  //             cookieConsents: crowdIntelligenceCookieConsents,
  //           });
  //         }
  //       }
  //     }
  //   }
  // }

  componentDidMount() {
    // console.log("CookieKitContainer#componentDidMount");
    // console.dir(this.props);
    // console.dir(this.state);

    Promise.all([
      fetchCountryCode(),
      fetchUserSettingsCookieConsents(),
    ]).then(([countryCode, userSettingsCookieConsents]) => {
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
                    }
                  });
              }
            });
        }
      }
    });
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

  // handleAuthentication = async (accessToken) => {
  //   console.log("CookieKitContainer#handleAuthentication");
  //   console.log("accessToken:", accessToken);
  //   saveAccessToken(accessToken);

  //   // TODO: Check that this is the logic we want to run. If so, then make it DRY.
  //   // It is duplicated above in componentDidMount.
  //   const { origin } = window.location;
  //   const userPreferenceCookieConsents = await fetchUserPreferenceCookieConsents(accessToken, origin);
  //   if (userPreferenceCookieConsents) {
  //     this.setState({
  //       consentsSource: "userPreference",
  //       cookieConsents: userPreferenceCookieConsents,
  //     });
  //   } else {
  //     const campaignName = window.location.host;
  //     const crowdIntelligenceCookieConsents = await fetchCrowdIntelligenceCookieConsents(accessToken, campaignName);
  //     if (crowdIntelligenceCookieConsents) {
  //       this.setState({
  //         consentsSource: "crowdIntelligence",
  //         cookieConsents: crowdIntelligenceCookieConsents,
  //       });
  //     }
  //   }
  // }

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
      });
  }

  handleConsentStatusChange = (nextConsentStatus) => {
    // console.log("CookieKitContainer#handleConsentStatusChange");
    // console.log("nextConsentStatus:", nextConsentStatus);
    this.setState({ consentStatus: nextConsentStatus });
  };

  handleCookieConsentsChange = (cookieConsentLut) => {
    // console.log("CookieKitContainer#handleCookieConsentsChange");
    // console.log("cookieConsentLut:", cookieConsentLut);
    const { config } = this.props;
    const { campaignReference } = config;

    const cookieConsents = cookieTypes.map(type => ({
      type,
      checked: !!cookieConsentLut[type],
    }));

    saveLocally(cookieConsents);

    // TODO: Handle the errors
    const accessToken = getAccessToken();
    saveRemotely(accessToken, cookieConsents, campaignReference)
      .catch(CookieKit.handleErrors);

    this.setState({
      consentStatus: consentStatuses.complete,
      cookieConsents,
    });

    if (config.cookieHandler) {
      callCookieHandler(config, cookieConsentLut);
    }

    if (config.targetUrl) {
      callTargetUrl(config, cookieConsentLut);
    }
  };

  render() {
    // console.log("CookieKitContainer#render");
    const { config } = this.props;
    const { consentsSource, consentStatus, cookieConsents, countryCode } = this.state;
    return (
      <CookieKit
        config={config}
        consentsSource={consentsSource}
        consentStatus={consentStatus}
        cookieConsents={cookieConsents}
        countryCode={countryCode}
        onAuthentication={this.handleAuthentication}
        onConsentStatusChange={this.handleConsentStatusChange}
        onCookieConsentsChange={this.handleCookieConsentsChange}
        onRefresh={refresh}
      />
    );
  }
}
