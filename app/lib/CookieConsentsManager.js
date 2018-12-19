import CryptoJS from "crypto-js";

import {
  cookieDefns as allAvailCookieDefns,
  // cookieTypes,
  // euCountries,
  expirationTime,
  xcoobeeCookiesKey,
} from "../utils";

import graphQLRequest from "../utils/graphql";

function fetchUsersSitesCookieConsents(accessToken, userCursor) {
  // console.log("fetchUsersSitesCookieConsents fetching...");
  const query = `query getUsersSitesCookieConsents($userCursor: String!) {
    cookie_consents(user_cursor: $userCursor) {
      site
      cookies
    }
  }`;

  return graphQLRequest(query, { userCursor }, accessToken)
    .then((res) => {
      const usersSitesCookieConsents = res.cookie_consents;
      // console.log("fetchUsersSitesCookieConsents fetched.");
      return usersSitesCookieConsents;
    });
}

export function fetchUsersSiteCookieConsents(accessToken, origin, xcoobeeId, userCursor) {
  // console.log("fetchUsersSiteCookieConsents fetching...");

  const message = `${origin.toLowerCase()}${xcoobeeId}`;
  const encodedSite = CryptoJS.SHA256(message).toString(CryptoJS.enc.Base64);

  return fetchUsersSitesCookieConsents(accessToken, userCursor)
    .then((usersSitesCookieConsents) => {
      let siteCookieConsents = null;

      if (Array.isArray(usersSitesCookieConsents)) {
        siteCookieConsents = usersSitesCookieConsents.find(consent => consent.site === encodedSite);
      }

      return siteCookieConsents;
    })
    .then((siteCookieConsents) => {
      let cookieConsents = null;

      if (siteCookieConsents
          && Array.isArray(siteCookieConsents.cookies)
          && siteCookieConsents.cookies.length > 0
      ) {
        cookieConsents = allAvailCookieDefns.map((cookieDefn) => {
          const checked = siteCookieConsents.cookies.includes(cookieDefn.dbKey);
          return {
            type: cookieDefn.type,
            checked,
          };
        });
      }

      // console.log("fetchUsersSiteCookieConsents fetched.");
      return cookieConsents;
    });
}

export function fetchUsersDefaultCookieConsents(userSettings) {
  // console.log("fetchUsersDefaultCookieConsents fetching...");
  let cookieConsents = null;
  if (userSettings.acceptCookies.length > 0) {
    cookieConsents = allAvailCookieDefns.map((cookieDefn) => {
      const checked = userSettings.acceptCookies.includes(cookieDefn.dbKey);
      return {
        type: cookieDefn.type,
        checked,
      };
    });
  }
  // console.log("fetchUsersDefaultCookieConsents fetched.");
  return cookieConsents;
}

export function fetchUserSettings(accessToken) {
  // console.log("fetchUserSettings fetching...");
  const query = `query getUserCookieConsentPreferences {
    user {
      cursor
      xcoobee_id
      settings {
        consent {
          accept_cookies
          use_crowd_ai
        }
      }
    }
  }`;
  return graphQLRequest(query, null, accessToken)
    .then((res) => {
      const { user } = res;
      let userSettings = null;

      if (user) {
        userSettings = {
          acceptCookies: [],
          acceptCrowdAI: false,
          userCursor: user.cursor,
          xcoobeeId: user.xcoobee_id,
        };
        if (user.settings.consent) {
          userSettings.acceptCookies = user.settings.consent.accept_cookies || [];
          userSettings.acceptCrowdAI = user.settings.consent.use_crowd_ai;
        }
      }

      // console.log("fetchUserSettings fetched.");
      return userSettings;
    });
}

export function clearCached() {
  localStorage.removeItem(xcoobeeCookiesKey);
}

export function fetchCountryCode() {
  // console.log("CookieConsentsManager#fetchCountryCode fetching...");
  return fetch("http://ip-api.com/json")
    .then(res => res.json())
    .then((res) => {
      // console.log("CookieConsentsManager#fetchCountryCode fetched.");
      const countryCode = res ? res.countryCode : "US";
      return countryCode;
    });
}

export function fetchCrowdAiCookieConsents(accessToken, campaignName) {
  // console.log("CookieConsentsManager#fetchCrowdAiCookieConsents fetching...");

  const query = `query getCrowdRating($campaignName: String!) {
    crowd_rating(campaign_name: $campaignName) {
      cookie_type
      value
    }
  }`;

  const crowdAiCookieConsents = graphQLRequest(query, { campaignName }, accessToken)
    .then((res) => {
      let cookieConsents = null;
      const crowdRatings = res ? res.crowd_rating : null;

      if (Array.isArray(crowdRatings)) {
        cookieConsents = allAvailCookieDefns.map((cookieDefn) => {
          const ratedCookie = crowdRatings.find(item => item.cookie_type === cookieDefn.dbKey);
          const checked = ratedCookie && ratedCookie.value >= 0.8;
          return {
            type: cookieDefn.type,
            checked,
          };
        });
      }
      // console.log("CookieConsentsManager#fetchCrowdAiCookieConsents fetched.");
      return cookieConsents;
    });

  return crowdAiCookieConsents;
}

// export function fetchCrowdAiCookieConsents(accessToken, campaignName) {
//   // console.log("CookieConsentsManager#fetchCrowdAiCookieConsents fetching...");
//   return fetchUserSettings(accessToken)
//     .then((userSettings) => {
//       let crowdAiCookieConsents = null;

//       if (userSettings.acceptCrowdAI) {
//         const query = `query getCrowdRating($campaignName: String!) {
//           crowd_rating(campaign_name: $campaignName) {
//             cookie_type
//             value
//           }
//         }`;

//         crowdAiCookieConsents = graphQLRequest(query, { campaignName }, accessToken)
//           .then((res) => {
//             let cookieConsents = null;
//             const crowdRatings = res ? res.crowd_rating : null;

//             if (Array.isArray(crowdRatings)) {
//               cookieConsents = allAvailCookieDefns.map((cookieDefn) => {
//                 const ratedCookie = crowdRatings.find(item => item.cookie_type === cookieDefn.dbKey);
//                 const checked = ratedCookie && ratedCookie.value >= 0.8;
//                 return {
//                   type: cookieDefn.type,
//                   checked,
//                 };
//               });
//             }
//             return cookieConsents;
//           });
//       }

//       // console.log("CookieConsentsManager#fetchCrowdAiCookieConsents fetched.");
//       return crowdAiCookieConsents;
//     });
// }

export function fetchCachedCookieConsents() {
  // console.log("CookieConsentsManager#fetchCachedCookieConsents fetching...");
  let cookieConsents = null;

  if (localStorage[xcoobeeCookiesKey]) {
    try {
      const xcoobeeCookies = JSON.parse(localStorage[xcoobeeCookiesKey]);
      const { cookies: consents, timestamp } = xcoobeeCookies;

      // If the cached cookie consents have not expired, then extract it.
      if ((Date.now() - timestamp) < expirationTime) {
        cookieConsents = allAvailCookieDefns.map(cookieDefn => ({
          type: cookieDefn.type,
          checked: consents[cookieDefn.id],
        }));
      }
    } catch (err) {
      cookieConsents = null;
      console.error(err);
    }
  }

  // console.log("CookieConsentsManager#fetchCachedCookieConsents fetched.");
  return Promise.resolve(cookieConsents);
}

// export function fetchUsersDefaultsCookieConsents(accessToken, origin) {
//   // console.log("CookieConsentsManager#fetchUsersDefaultsCookieConsents fetching...");
//   return fetchUserSettings(accessToken)
//     .then((userSettings) => {
//       let usersDefaultsCookieConsents = null;

//       if (userSettings) {
//         usersDefaultsCookieConsents = fetchUsersSiteCookieConsents(
//           accessToken,
//           origin,
//           userSettings.xcoobeeId,
//           userSettings.userCursor,
//         )
//           .then((siteCookieConsents) => {
//             let cookieConsents = siteCookieConsents;

//             if (!cookieConsents) {
//               if (userSettings.acceptCookies.length > 0) {
//                 cookieConsents = allAvailCookieDefns.map((cookieDefn) => {
//                   const checked = userSettings.acceptCookies.includes(cookieDefn.dbKey);
//                   return {
//                     type: cookieDefn.type,
//                     checked,
//                   };
//                 });
//               }
//             }

//             return cookieConsents;
//           });
//       }

//       // console.log("CookieConsentsManager#fetchUsersDefaultsCookieConsents fetched.");
//       return usersDefaultsCookieConsents;
//     });
// }

// export function fetchHostsDefaultCookieConsents(countryCode, displayOnlyForEU, checkByDefaultTypes) {
//   // console.log("CookieConsentsManager#fetchHostsDefaultCookieConsents fetching...");
//   let hostsDefaultCookieConsents = null;

//   if (!euCountries.includes(countryCode) && displayOnlyForEU) {
//     hostsDefaultCookieConsents = cookieTypes.map(type => ({
//       type,
//       checked: checkByDefaultTypes.includes(type),
//     }));
//     // hostsDefaultCookieConsents = allAvailCookieDefns.map((cookieDefn) => {
//     //   const checked = checkByDefaultTypes.includes(cookieDefn.type);
//     //   return {
//     //     type: cookieDefn.type,
//     //     checked,
//     //   };
//     // });
//   }

//   // console.log("CookieConsentsManager#fetchHostsDefaultCookieConsents fetched.");
//   return hostsDefaultCookieConsents;
// }

export function cache(cookieConsents) {
  // console.log("CookieConsentsManager#cache caching...");
  // TODO: Save as a LUT instead of an array.
  const xcoobeeCookies = { timestamp: Date.now(), cookies: [] };
  allAvailCookieDefns.forEach((cookieDefn) => {
    const cookieConsent = cookieConsents.find(item => item.type === cookieDefn.type);

    if (cookieConsent && cookieConsent.checked) {
      xcoobeeCookies.cookies.push(true);
    } else {
      xcoobeeCookies.cookies.push(false);
    }
  });
  localStorage.setItem(xcoobeeCookiesKey, JSON.stringify(xcoobeeCookies));
  // console.log("CookieConsentsManager#cache cached.");
}

export function saveRemotely(accessToken, cookieConsents, campaignReference) {
  // console.log("CookieConsentsManager#saveRemotely saving...");
  let promise;
  if (campaignReference && accessToken) {
    const addConsentQuery = `mutation AddConsents($campaign_reference: String, $domain: String) {
      add_consents(campaign_reference: $campaign_reference, domain: $domain) {
        consent_cursor
      }
    }`;
    const domain = window.location.origin;
    promise = graphQLRequest(addConsentQuery, {
      campaign_reference: campaignReference,
      domain,
    }, accessToken)
      .then((res) => {
        if (!res || !res.add_consents) {
          return Promise.reject(Error("No response"));
        }

        const consentCursor = res.add_consents[0].consent_cursor;
        const dataTypes = cookieConsents.filter(item => item.checked)
          .map(item => allAvailCookieDefns.find(defn => defn.type === item.type).dbKey);
        const consentConfig = {
          consents: {
            consent_cursor: consentCursor,
            response: "approved",
            is_data_request: false,
            data: {
              data_types: dataTypes,
            },
          },
        };

        const modifyConsentsQuery = `mutation ModifyConsents($consentConfig: ConsentConfig) {
          modify_consents(config: $consentConfig) {
            data {
              consent_cursor
            }
          }
        }`;
        return graphQLRequest(modifyConsentsQuery, { consentConfig }, accessToken);
      })
      .catch((error) => {
        let msg;
        if (Array.isArray(error) && error.length > 0) {
          msg = error[0].message;
        } else {
          msg = error.message;
        }
        console.error([
          `Failed to save user's cookie consents for domain "${domain}"`,
          `using campaign "${campaignReference}"`,
          msg ? `due to "${msg}".` : ".",
        ].join(" "));
      });
  }
  promise = promise || Promise.resolve();
  // promise.then(() => {
  //   console.log("CookieConsentsManager#saveRemotely saved.");
  // });
  return promise;
}
