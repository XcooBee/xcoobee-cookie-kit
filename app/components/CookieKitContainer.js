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
  // fetchCrowdAiCookieConsents,
  fetchCrowdAiCookieConsents,
  // fetchHostsDefaultCookieConsents,
  // fetchUsersDefaultsCookieConsents,
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

    // const { checkByDefaultTypes } = props;
    // const cookieConsents = cookieTypes.map(type => ({
    //   type,
    //   checked: checkByDefaultTypes.includes(type),
    // }));

    // this.state = {
    //   consentsSource: "unknown",
    //   consentStatus: OPEN,
    //   cookieConsents,
    //   countryCode: "US",
    // };

    this.state = {
      accessToken: getAccessToken(),
      consentsSource: "unknown",
      consentStatus: OPEN,
      cookieConsents: null,
      countryCode: "US",
      initializing: true,
    };

    fetchCountryCode()
      .then(([countryCode]) => {
        this.setState({ countryCode });

        const cachedCookieConsents = cookieConsentsCache.get();
        if (cachedCookieConsents) {
          // console.log("Using cached cookie consents!");
          this.setCookieConsents("cached", cachedCookieConsents);
          return;
        }

        const {
          campaignReference,
          checkByDefaultTypes,
          displayOnlyForEU,
        } = this.props;

        const isConnected = !!campaignReference;
        const { accessToken } = this.state;

        if (isConnected && accessToken) {
          this.resolveConnectedCookieConsents().catch(handleErrors);
        } else {
          const hostsDefaultCookieConsents = cookieTypes.map(type => ({
            type,
            checked: checkByDefaultTypes.includes(type),
          }));
          if (displayOnlyForEU && !euCountries.includes(countryCode)) {
            this.setCookieConsents("hostsDefaults", hostsDefaultCookieConsents);
          } else {
            const consentsSource = "unknown";
            const cookieConsents = hostsDefaultCookieConsents;
            this.setState({ consentsSource, cookieConsents, initializing: false });
          }
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
  //   const promises = [
  //     fetchCountryCode(),
  //     fetchCachedCookieConsents(),
  //   ];

  //   Promise.all(promises)
  //     .then(([countryCode, cachedCookieConsents]) => {
  //       this.setState({ countryCode });

  //       if (cachedCookieConsents) {
  //         // console.log("Using cached cookie consents!");
  //         // const cookieConsents = cachedCookieConsents;
  //         // const consentStatus = COMPLETE;
  //         // const consentsSource = "cached";
  //         // this.setState({ consentsSource, consentStatus, cookieConsents });
  //         // this.callCallbacks(cookieConsents);
  //         this.setCookieConsents("cached", cachedCookieConsents);
  //         return;
  //       }

  //       const {
  //         campaignReference,
  //         checkByDefaultTypes,
  //         displayOnlyForEU,
  //       } = this.props;

  //       // let cookieConsents = null;
  //       // let consentsSource = "unknown";
  //       const isConnected = !!campaignReference;
  //       const { accessToken } = this.state;

  //       // If host is connected and user appears to be logged in, then get the user's
  //       // settings (these settings are not just their cookie consent defaults but also
  //       // includes whether they allow using crowd AI to determine cookie consents.)
  //       if (isConnected && accessToken) {
  //         this.resolveConnectedCookieConsents().catch(handleErrors);
  //         // fetchUserSettings(accessToken)
  //         //   .then((userSettings) => {
  //         //     if (userSettings) {
  //         //       // Check to see if user already has consent settings for the current site
  //         //       const { origin } = window.location;
  //         //       const { userCursor, xcoobeeId } = userSettings;
  //         //       fetchUsersSiteCookieConsents(accessToken, origin, xcoobeeId, userCursor)
  //         //         .then((usersSiteCookieConsents) => {
  //         //           if (usersSiteCookieConsents) {
  //         //             // const consentsSource = "usersSaved";
  //         //             // const consentStatus = COMPLETE;
  //         //             // const cookieConsents = usersSiteCookieConsents;
  //         //             // this.setState({ consentsSource, consentStatus, cookieConsents });
  //         //             // cookieConsentsCache.put(cookieConsents);
  //         //             // this.callCallbacks(cookieConsents);
  //         //             this.setCookieConsents("usersSaved", usersSiteCookieConsents);
  //         //             return;
  //         //           }

  //         //           let promise;
  //         //           if (userSettings.acceptCrowdAI) {
  //         //             const campaignName = window.location.host;
  //         //             promise = fetchCrowdAiCookieConsents(accessToken, campaignName);
  //         //           } else {
  //         //             promise = Promise.resolve();
  //         //           }
  //         //           promise.then((crowdAiCookieConsents) => {
  //         //             if (crowdAiCookieConsents) {
  //         //               // const cookieConsents = crowdAiCookieConsents;
  //         //               // const consentStatus = COMPLETE;
  //         //               // const consentsSource = "crowdAi";
  //         //               // this.setState({ consentsSource, consentStatus, cookieConsents });
  //         //               // cookieConsentsCache.put(cookieConsents);
  //         //               // this.callCallbacks(cookieConsents);
  //         //               this.setCookieConsents("crowdAi", crowdAiCookieConsents);
  //         //               return;
  //         //             }

  //         //             const usersDefaultCookieConsents = fetchUsersDefaultCookieConsents(userSettings);
  //         //             if (usersDefaultCookieConsents) {
  //         //               // const consentsSource = "usersDefaults";
  //         //               // const consentStatus = COMPLETE;
  //         //               // const cookieConsents = usersDefaultCookieConsents;
  //         //               // this.setState({ consentsSource, consentStatus, cookieConsents });
  //         //               // cookieConsentsCache.put(cookieConsents);
  //         //               // this.callCallbacks(cookieConsents);
  //         //               this.setCookieConsents("usersDefaults", usersDefaultCookieConsents);
  //         //               return;
  //         //             }

  //         //             const hostsDefaultCookieConsents = fetchHostsDefaultCookieConsents(
  //         //               countryCode,
  //         //               displayOnlyForEU,
  //         //               checkByDefaultTypes,
  //         //             );
  //         //             if (hostsDefaultCookieConsents) {
  //         //               // const consentsSource = "hostsDefaults";
  //         //               // const consentStatus = COMPLETE;
  //         //               // const cookieConsents = hostsDefaultCookieConsents;
  //         //               // this.setState({ consentsSource, consentStatus, cookieConsents });
  //         //               // cookieConsentsCache.put(cookieConsents);
  //         //               // this.callCallbacks(cookieConsents);
  //         //               this.setCookieConsents("hostsDefaults", hostsDefaultCookieConsents);
  //         //               return;
  //         //             }
  //         //             const consentsSource = "unknown";
  //         //             const cookieConsents = cookieTypes.map(type => ({
  //         //               type,
  //         //               checked: checkByDefaultTypes.includes(type),
  //         //             }));
  //         //             this.setState({ consentsSource, cookieConsents });
  //         //           });
  //         //         });
  //         //     } else {
  //         //       const hostsDefaultCookieConsents = fetchHostsDefaultCookieConsents(
  //         //         countryCode,
  //         //         displayOnlyForEU,
  //         //         checkByDefaultTypes,
  //         //       );
  //         //       if (hostsDefaultCookieConsents) {
  //         //         // const consentsSource = "hostsDefaults";
  //         //         // const consentStatus = COMPLETE;
  //         //         // const cookieConsents = hostsDefaultCookieConsents;
  //         //         // this.setState({ consentsSource, consentStatus, cookieConsents });
  //         //         // cookieConsentsCache.put(cookieConsents);
  //         //         // this.callCallbacks(cookieConsents);
  //         //         this.setCookieConsents("hostsDefaults", hostsDefaultCookieConsents);
  //         //         return;
  //         //       }
  //         //       const consentsSource = "unknown";
  //         //       const cookieConsents = cookieTypes.map(type => ({
  //         //         type,
  //         //         checked: checkByDefaultTypes.includes(type),
  //         //       }));
  //         //       this.setState({ consentsSource, cookieConsents });
  //         //     }
  //         //   })
  //         //   .catch(handleErrors);
  //       } else {
  //         const hostsDefaultCookieConsents = cookieTypes.map(type => ({
  //           type,
  //           checked: checkByDefaultTypes.includes(type),
  //         }));
  //         if (!euCountries.includes(countryCode) && displayOnlyForEU) {
  //           this.setCookieConsents("hostsDefaults", hostsDefaultCookieConsents);
  //         } else {
  //           // const consentsSource = "unknown";
  //           const cookieConsents = hostsDefaultCookieConsents;
  //           this.setState({ cookieConsents });
  //         }
  //         // const hostsDefaultCookieConsents = fetchHostsDefaultCookieConsents(
  //         //   countryCode,
  //         //   displayOnlyForEU,
  //         //   checkByDefaultTypes,
  //         // );
  //         // if (hostsDefaultCookieConsents) {
  //         //   // const consentsSource = "hostsDefaults";
  //         //   // const consentStatus = COMPLETE;
  //         //   // const cookieConsents = hostsDefaultCookieConsents;
  //         //   // this.setState({ consentsSource, consentStatus, cookieConsents });
  //         //   // cookieConsentsCache.put(cookieConsents);
  //         //   // this.callCallbacks(cookieConsents);
  //         //   this.setCookieConsents("hostsDefaults", hostsDefaultCookieConsents);
  //         // } else {
  //         //   const consentsSource = "unknown";
  //         //   const cookieConsents = cookieTypes.map(type => ({
  //         //     type,
  //         //     checked: checkByDefaultTypes.includes(type),
  //         //   }));
  //         //   this.setState({ consentsSource, cookieConsents });
  //         // }
  //       }
  //     })
  //     .catch(handleErrors);
  // }

  // componentDidMount() {
  //   // console.log("CookieKitContainer#componentDidMount");
  //   // console.dir(this.props);
  //   // console.dir(this.state);
  //   const {
  //     campaignReference,
  //     checkByDefaultTypes,
  //     cookieHandler,
  //     displayOnlyForEU,
  //     targetUrl,
  //   } = this.props;

  //   const promises = [
  //     fetchCountryCode(),
  //     fetchCachedCookieConsents(),
  //   ];

  //   Promise.all(promises)
  //     .then(async ([countryCode, cachedCookieConsents]) => {
  //       this.setState({ countryCode });
  //       if (cachedCookieConsents) {
  //         // console.log("Using cached cookie consents!");
  //         this.setState({
  //           consentsSource: "cached",
  //           cookieConsents: cachedCookieConsents,
  //         });
  //         // TODO: Call callback mechanism
  //       } else {
  //         let cookieConsents = null;
  //         let consentsSource = "unknown";
  //         const isConnected = !!campaignReference;
  //         let accessToken = getAccessToken();

  //         // If host is connected and user appears to be logged in, then get the user's
  //         // settings (these settings are not just their cookie consent defaults but also
  //         // includes whether they allow using crowd AI to determine cookie consents.)
  //         if (isConnected && accessToken) {
  //           let userSettings;
  //           try {
  //             userSettings = await fetchUserSettings(accessToken);
  //           } catch (err) {
  //             if (err instanceof NotAuthorizedError) {
  //               clearAccessToken();
  //               accessToken = undefined;
  //             }
  //           }

  //           if (userSettings && accessToken) {
  //             // Check to see if user already has consent settings for the current site
  //             const { origin } = window.location;
  //             const { userCursor, xcoobeeId } = userSettings;
  //             cookieConsents = await fetchUsersSiteCookieConsents(accessToken, origin, xcoobeeId, userCursor);
  //             if (cookieConsents) {
  //               consentsSource = "usersSaved";
  //             } else {
  //               if (userSettings.acceptCrowdAI) {
  //                 const campaignName = window.location.host;
  //                 cookieConsents = await fetchCrowdAiCookieConsents(accessToken, campaignName);
  //                 if (cookieConsents) {
  //                   consentsSource = "crowdAi";
  //                 }
  //               }
  //               if (!cookieConsents) {
  //                 cookieConsents = fetchUsersDefaultCookieConsents(userSettings);
  //                 if (cookieConsents) {
  //                   consentsSource = "usersDefaults";
  //                 }
  //               }
  //             }
  //           }
  //         }
  //         if (!cookieConsents) {
  //           cookieConsents = fetchHostsDefaultCookieConsents(countryCode, displayOnlyForEU, checkByDefaultTypes);
  //           if (cookieConsents) {
  //             consentsSource = "hostsDefaults";
  //           }
  //         }
  //         if (cookieConsents) {
  //           this.setState({ consentsSource, cookieConsents });
  //           const consentSettings = {};
  //           cookieConsents.forEach((consent) => {
  //             consentSettings[consent.type] = consent.checked;
  //           });

  //           if (cookieHandler) {
  //             callCookieHandler(cookieHandler, consentSettings);
  //           }

  //           if (targetUrl) {
  //             callTargetUrl(targetUrl, consentSettings);
  //           }
  //         }
  //       }
  //     });

  //   // const promises = [
  //   //   fetchCountryCode(),
  //   //   fetchCachedCookieConsents(),
  //   // ];

  //   // Promise.all(promises)
  //   //   .then(([countryCode, cachedCookieConsents]) => {
  //   //     this.setState({ countryCode });
  //   //     if (cachedCookieConsents) {
  //   //       // console.log("Using cached cookie consents!");
  //   //       this.setState({
  //   //         consentsSource: "cached",
  //   //         cookieConsents: cachedCookieConsents,
  //   //       });
  //   //     } else {
  //   //       if (accessToken) {
  //   //         const { origin } = window.location;

  //   //         fetchUsersDefaultsCookieConsents(accessToken, origin)
  //   //           .then((usersDefaultsCookieConsents) => {
  //   //             if (usersDefaultsCookieConsents) {
  //   //               this.setState({
  //   //                 consentsSource: "usersDefaults",
  //   //                 cookieConsents: usersDefaultsCookieConsents,
  //   //               });
  //   //             } else {
  //   //               const campaignName = window.location.host;

  //   //               fetchCrowdAiCookieConsents(accessToken, campaignName)
  //   //                 .then((crowdAiCookieConsents) => {
  //   //                   if (crowdAiCookieConsents) {
  //   //                     this.setState({
  //   //                       consentsSource: "crowdAi",
  //   //                       cookieConsents: crowdAiCookieConsents,
  //   //                     });
  //   //                   } else {
  //   //                     fetchHostsDefaultCookieConsents(countryCode, displayOnlyForEU, checkByDefaultTypes)
  //   //                       .then((hostsDefaultCookieConsents) => {
  //   //                         if (hostsDefaultCookieConsents) {
  //   //                           this.setState({
  //   //                             consentsSource: "hostsDefaults",
  //   //                             cookieConsents: hostsDefaultCookieConsents,
  //   //                           });
  //   //                         }
  //   //                       });
  //   //                   }
  //   //                 });
  //   //             }
  //   //           })
  //   //           .catch(handleErrors);
  //   //       } else {
  //   //         fetchHostsDefaultCookieConsents(countryCode, displayOnlyForEU, checkByDefaultTypes)
  //   //           .then((hostsDefaultCookieConsents) => {
  //   //             if (hostsDefaultCookieConsents) {
  //   //               this.setState({
  //   //                 consentsSource: "hostsDefaults",
  //   //                 cookieConsents: hostsDefaultCookieConsents,
  //   //               });
  //   //             }
  //   //           });
  //   //       }
  //   //     }
  //   //   })
  //   //   .catch(handleErrors);
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

    const {
      campaignReference,
    } = this.props;

    const isConnected = !!campaignReference;

    if (isConnected) {
      this.resolveConnectedCookieConsents().catch(handleErrors);
    }

    // const {
    //   campaignReference,
    //   checkByDefaultTypes,
    //   cookieHandler,
    //   displayOnlyForEU,
    //   targetUrl,
    // } = this.props;
    // const { countryCode } = this.state;

    // let cookieConsents = null;
    // let consentsSource = "unknown";
    // const isConnected = !!campaignReference;

    // if (isConnected && accessToken) {
    //   let userSettings;
    //   try {
    //     userSettings = await fetchUserSettings(accessToken);
    //   } catch (err) {
    //     if (err instanceof NotAuthorizedError) {
    //       clearAccessToken();
    //       accessToken = undefined;
    //     }
    //   }

    //   if (userSettings && accessToken) {
    //     // Check to see if user already has consent settings for the current site
    //     const { origin } = window.location;
    //     const { userCursor, xcoobeeId } = userSettings;
    //     cookieConsents = await fetchUsersSiteCookieConsents(accessToken, origin, xcoobeeId, userCursor);
    //     if (cookieConsents) {
    //       consentsSource = "usersSaved";
    //     } else {
    //       if (userSettings.acceptCrowdAI) {
    //         const campaignName = window.location.host;
    //         cookieConsents = await fetchCrowdAiCookieConsents(accessToken, campaignName);
    //         if (cookieConsents) {
    //           consentsSource = "crowdAi";
    //         }
    //       }
    //       if (!cookieConsents) {
    //         cookieConsents = fetchUsersDefaultCookieConsents(userSettings);
    //         if (cookieConsents) {
    //           consentsSource = "usersDefaults";
    //         }
    //       }
    //     }
    //   }
    // }
    // if (!cookieConsents) {
    //   cookieConsents = fetchHostsDefaultCookieConsents(countryCode, displayOnlyForEU, checkByDefaultTypes);
    //   if (cookieConsents) {
    //     consentsSource = "hostsDefaults";
    //   }
    // }
    // if (cookieConsents) {
    //   this.setState({ consentsSource, cookieConsents });
    //   cookieConsentsCache.put(cookieConsents);
    //   this.callCallbacks(cookieConsents);
    // } else {
    //   // TODO: Determine if we should be doing something in this case. For example,
    //   // should we open the popup?
    // }

    // // TODO: Check that this is the logic we want to run. If so, then make it DRY.
    // // It is duplicated above in componentDidMount.
    // const { origin } = window.location;


    // fetchUsersDefaultsCookieConsents(accessToken, origin)
    //   .then((usersDefaultsCookieConsents) => {
    //     if (usersDefaultsCookieConsents) {
    //       this.setState({
    //         consentsSource: "usersDefaults",
    //         cookieConsents: usersDefaultsCookieConsents,
    //       });
    //     } else {
    //       const campaignName = window.location.host;
    //       fetchCrowdAiCookieConsents(accessToken, campaignName)
    //         .then((crowdAiCookieConsents) => {
    //           if (crowdAiCookieConsents) {
    //             this.setState({
    //               consentsSource: "crowdAi",
    //               cookieConsents: crowdAiCookieConsents,
    //             });
    //           }
    //         });
    //     }
    //   })
    //   .catch(handleErrors);
  }

  // handleAuthentication = async (accessToken) => {
  //   // console.log("CookieKitContainer#handleAuthentication");
  //   // console.log("accessToken:", accessToken);
  //   saveAccessToken(accessToken);

  //   const {
  //     campaignReference,
  //     checkByDefaultTypes,
  //     cookieHandler,
  //     displayOnlyForEU,
  //     targetUrl,
  //   } = this.props;
  //   const { countryCode } = this.state;

  //   let cookieConsents = null;
  //   let consentsSource = "unknown";
  //   const isConnected = !!campaignReference;

  //   if (isConnected && accessToken) {
  //     let userSettings;
  //     try {
  //       userSettings = await fetchUserSettings(accessToken);
  //     } catch (err) {
  //       if (err instanceof NotAuthorizedError) {
  //         clearAccessToken();
  //         accessToken = undefined;
  //       }
  //     }

  //     if (userSettings && accessToken) {
  //       // Check to see if user already has consent settings for the current site
  //       const { origin } = window.location;
  //       const { userCursor, xcoobeeId } = userSettings;
  //       cookieConsents = await fetchUsersSiteCookieConsents(accessToken, origin, xcoobeeId, userCursor);
  //       if (cookieConsents) {
  //         consentsSource = "usersSaved";
  //       } else {
  //         if (userSettings.acceptCrowdAI) {
  //           const campaignName = window.location.host;
  //           cookieConsents = await fetchCrowdAiCookieConsents(accessToken, campaignName);
  //           if (cookieConsents) {
  //             consentsSource = "crowdAi";
  //           }
  //         }
  //         if (!cookieConsents) {
  //           cookieConsents = fetchUsersDefaultCookieConsents(userSettings);
  //           if (cookieConsents) {
  //             consentsSource = "usersDefaults";
  //           }
  //         }
  //       }
  //     }
  //   }
  //   if (!cookieConsents) {
  //     cookieConsents = fetchHostsDefaultCookieConsents(countryCode, displayOnlyForEU, checkByDefaultTypes);
  //     if (cookieConsents) {
  //       consentsSource = "hostsDefaults";
  //     }
  //   }
  //   if (cookieConsents) {
  //     this.setState({ consentsSource, cookieConsents });

  //     cookieConsentsCache.put(cookieConsents);

  //     const consentSettings = {};
  //     cookieConsents.forEach((consent) => {
  //       consentSettings[consent.type] = consent.checked;
  //     });

  //     if (cookieHandler) {
  //       callCookieHandler(cookieHandler, consentSettings);
  //     }

  //     if (targetUrl) {
  //       callTargetUrl(targetUrl, consentSettings);
  //     }
  //   } else {
  //     // TODO: Determine if we should be doing something in this case. For example,
  //     // should we open the popup?
  //   }

  //   // // TODO: Check that this is the logic we want to run. If so, then make it DRY.
  //   // // It is duplicated above in componentDidMount.
  //   // const { origin } = window.location;


  //   // fetchUsersDefaultsCookieConsents(accessToken, origin)
  //   //   .then((usersDefaultsCookieConsents) => {
  //   //     if (usersDefaultsCookieConsents) {
  //   //       this.setState({
  //   //         consentsSource: "usersDefaults",
  //   //         cookieConsents: usersDefaultsCookieConsents,
  //   //       });
  //   //     } else {
  //   //       const campaignName = window.location.host;
  //   //       fetchCrowdAiCookieConsents(accessToken, campaignName)
  //   //         .then((crowdAiCookieConsents) => {
  //   //           if (crowdAiCookieConsents) {
  //   //             this.setState({
  //   //               consentsSource: "crowdAi",
  //   //               cookieConsents: crowdAiCookieConsents,
  //   //             });
  //   //           }
  //   //         });
  //   //     }
  //   //   })
  //   //   .catch(handleErrors);
  // }

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

    // cookieConsentsCache.put(cookieConsents);

    // this.setState({
    //   consentsSource: "usersSaved",
    //   consentStatus: COMPLETE,
    //   cookieConsents,
    // });

    // this.callCallbacks(cookieConsents);
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

  resolveConnectedCookieConsents() {
    // console.log("CookieKitContainer#resolveConnectedCookieConsents");
    const { accessToken, countryCode } = this.state;
    return fetchUserSettings(accessToken)
      .then((userSettings) => {
        const {
          checkByDefaultTypes,
          displayOnlyForEU,
        } = this.props;

        if (userSettings) {
          // Check to see if user already has consent settings for the current site
          const { origin } = window.location;
          const { userCursor, xcoobeeId } = userSettings;
          fetchUsersSiteCookieConsents(accessToken, origin, xcoobeeId, userCursor)
            .then((usersSiteCookieConsents) => {
              if (usersSiteCookieConsents) {
                // const consentsSource = "usersSaved";
                // const consentStatus = COMPLETE;
                // const cookieConsents = usersSiteCookieConsents;
                // this.setState({ consentsSource, consentStatus, cookieConsents });
                // cookieConsentsCache.put(cookieConsents);
                // this.callCallbacks(cookieConsents);
                this.setCookieConsents("usersSaved", usersSiteCookieConsents);
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
                  // const cookieConsents = crowdAiCookieConsents;
                  // const consentStatus = COMPLETE;
                  // const consentsSource = "crowdAi";
                  // this.setState({ consentsSource, consentStatus, cookieConsents });
                  // cookieConsentsCache.put(cookieConsents);
                  // this.callCallbacks(cookieConsents);
                  this.setCookieConsents("crowdAi", crowdAiCookieConsents);
                  return;
                }

                const usersDefaultCookieConsents = fetchUsersDefaultCookieConsents(userSettings);
                if (usersDefaultCookieConsents) {
                  // const consentsSource = "usersDefaults";
                  // const consentStatus = COMPLETE;
                  // const cookieConsents = usersDefaultCookieConsents;
                  // this.setState({ consentsSource, consentStatus, cookieConsents });
                  // cookieConsentsCache.put(cookieConsents);
                  // this.callCallbacks(cookieConsents);
                  this.setCookieConsents("usersDefaults", usersDefaultCookieConsents);
                  return;
                }

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

                // const hostsDefaultCookieConsents = fetchHostsDefaultCookieConsents(
                //   countryCode,
                //   displayOnlyForEU,
                //   checkByDefaultTypes,
                // );
                // if (hostsDefaultCookieConsents) {
                //   // const consentsSource = "hostsDefaults";
                //   // const consentStatus = COMPLETE;
                //   // const cookieConsents = hostsDefaultCookieConsents;
                //   // this.setState({ consentsSource, consentStatus, cookieConsents });
                //   // cookieConsentsCache.put(cookieConsents);
                //   // this.callCallbacks(cookieConsents);
                //   this.setCookieConsents("hostsDefaults", hostsDefaultCookieConsents);
                //   return;
                // }
                // const consentsSource = "unknown";
                // const cookieConsents = cookieTypes.map(type => ({
                //   type,
                //   checked: checkByDefaultTypes.includes(type),
                // }));
                // this.setState({ consentsSource, cookieConsents });
              });
            });
        } else {
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
          // const hostsDefaultCookieConsents = fetchHostsDefaultCookieConsents(
          //   countryCode,
          //   displayOnlyForEU,
          //   checkByDefaultTypes,
          // );
          // if (hostsDefaultCookieConsents) {
          //   // const consentsSource = "hostsDefaults";
          //   // const consentStatus = COMPLETE;
          //   // const cookieConsents = hostsDefaultCookieConsents;
          //   // this.setState({ consentsSource, consentStatus, cookieConsents });
          //   // cookieConsentsCache.put(cookieConsents);
          //   // this.callCallbacks(cookieConsents);
          //   this.setCookieConsents("hostsDefaults", hostsDefaultCookieConsents);
          //   return;
          // }
          // const consentsSource = "unknown";
          // const cookieConsents = cookieTypes.map(type => ({
          //   type,
          //   checked: checkByDefaultTypes.includes(type),
          // }));
          // this.setState({ consentsSource, cookieConsents });
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
