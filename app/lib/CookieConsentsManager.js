/* eslint-disable no-console */
import CryptoJS from "crypto-js";

import {
  cookieDefns as allAvailCookieDefns,
  euCountries,
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

function fetchUsersSiteCookieConsents(accessToken, userCursor, encodedSite) {
  // console.log("fetchUsersSiteCookieConsents fetching...");
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

// TODO: See if we should cache the results of this query.
function fetchUserInfo(accessToken) {
  // console.log("fetchUserInfo fetching...");
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
      let userInfo = null;

      if (user) {
        userInfo = {
          acceptCookies: [],
          acceptCrowdAI: false,
          userCursor: user.cursor,
          xcoobeeId: user.xcoobee_id,
        };
        if (user.settings.consent) {
          userInfo.acceptCookies = user.settings.consent.accept_cookies || [];
          userInfo.acceptCrowdAI = user.settings.consent.use_crowd_ai;
        }
      }

      // console.log("fetchUserInfo fetched.");
      return userInfo;
    });
}

export function clearLocallySaved() {
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

export function fetchCrowdIntelligenceCookieConsents(accessToken, campaignName) {
  // console.log("CookieConsentsManager#fetchCrowdIntelligenceCookieConsents fetching...");
  return fetchUserInfo(accessToken)
    .then((userInfo) => {
      let crowdIntelligenceCookieConsents = null;

      if (userInfo.acceptCrowdAI) {
        const query = `query getCrowdRating($campaignName: String!) {
          crowd_rating(campaign_name: $campaignName) {
            cookie_type
            value
          }
        }`;

        crowdIntelligenceCookieConsents = graphQLRequest(query, { campaignName }, accessToken)
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
            return cookieConsents;
          });
      }

      // console.log("CookieConsentsManager#fetchCrowdIntelligenceCookieConsents fetched.");
      return crowdIntelligenceCookieConsents;
    });
}

export function fetchUserSettingsCookieConsents() {
  // console.log("CookieConsentsManager#fetchUserSettingsCookieConsents fetching...");
  let cookieConsents = null;

  if (localStorage[xcoobeeCookiesKey]) {
    try {
      const xcoobeeCookies = JSON.parse(localStorage[xcoobeeCookiesKey]);
      const { cookies: consents, timestamp } = xcoobeeCookies;

      // If the saved cookie consents have not expired, then extract it.
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

  // console.log("CookieConsentsManager#fetchUserSettingsCookieConsents fetched.");
  return Promise.resolve(cookieConsents);
}

export function fetchUserPreferenceCookieConsents(accessToken, origin) {
  // console.log("CookieConsentsManager#fetchUserPreferenceCookieConsents fetching...");
  return fetchUserInfo(accessToken)
    .then((userInfo) => {
      let userPreferenceCookieConsents = null;

      if (userInfo) {
        const message = `${origin.toLowerCase()}${userInfo.xcoobeeId}`;
        const encodedSite = CryptoJS.SHA256(message).toString(CryptoJS.enc.Base64);
        userPreferenceCookieConsents = fetchUsersSiteCookieConsents(accessToken, userInfo.userCursor, encodedSite)
          .then((siteCookieConsents) => {
            let cookieConsents = siteCookieConsents;

            if (cookieConsents) {
              if (userInfo.acceptCookies.length > 0) {
                cookieConsents = allAvailCookieDefns.map((cookieDefn) => {
                  const checked = userInfo.acceptCookies.includes(cookieDefn.dbKey);
                  return {
                    type: cookieDefn.type,
                    checked,
                  };
                });
              }
            }

            return cookieConsents;
          });
      }

      // console.log("CookieConsentsManager#fetchUserPreferenceCookieConsents fetched.");
      return userPreferenceCookieConsents;
    });
}

export function fetchCompanyPreferenceCookieConsents(countryCode, displayOnlyForEU, checkByDefaultTypes) {
  // console.log("CookieConsentsManager#fetchCompanyPreferenceCookieConsents fetching...");
  let companyPreferenceCookieConsents = null;

  if (!euCountries.includes(countryCode) && displayOnlyForEU) {
    companyPreferenceCookieConsents = allAvailCookieDefns.map((cookieDefn) => {
      const checked = checkByDefaultTypes.includes(cookieDefn.type);
      return {
        type: cookieDefn.type,
        checked,
      };
    });
  }

  // console.log("CookieConsentsManager#fetchCompanyPreferenceCookieConsents fetched.");
  return Promise.resolve(companyPreferenceCookieConsents);
}

export function saveLocally(cookieConsents) {
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
}

export function saveRemotely(accessToken, cookieConsents, campaignReference) {
  let promise;
  if (campaignReference && accessToken) {
    const addConsentQuery = `mutation AddConsents($campaign_reference: String, $domain: String) {
      add_consents(campaign_reference: $campaign_reference, domain: $domain) {
        consent_cursor
      }
    }`;
    promise = graphQLRequest(addConsentQuery, {
      campaign_reference: campaignReference,
      domain: window.location.origin,
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
      });
  }
  promise = promise || Promise.resolve();
  return promise;
}
