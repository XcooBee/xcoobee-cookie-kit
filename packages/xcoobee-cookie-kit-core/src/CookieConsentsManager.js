import { cookieDefns as allAvailCookieDefns } from "./configs";

import graphQLRequestFactory from "./graphql";

function fetchUsersSitesCookieConsents(graphQLRequest, accessToken, userCursor, origin) {
  // console.log("fetchUsersSitesCookieConsents fetching...");
  const query = `query getUsersSitesCookieConsents($userCursor: String!, $campaignName: String) {
    cookie_consents(user_cursor: $userCursor, campaign_name: $campaignName) {
      site
      cookies
    }
  }`;

  return graphQLRequest(query, { userCursor, campaignName: origin }, accessToken)
    .then((res) => {
      const usersSitesCookieConsents = res.cookie_consents;
      // console.log("fetchUsersSitesCookieConsents fetched.");
      return usersSitesCookieConsents;
    });
}

function fetchUsersSiteCookieConsents(graphQLRequest, accessToken, origin, xcoobeeId, userCursor) {
  // console.log("fetchUsersSiteCookieConsents fetching...");

  return fetchUsersSitesCookieConsents(graphQLRequest, accessToken, userCursor, origin)
    .then((usersSitesCookieConsents) => {
      let siteCookieConsents = null;

      if (Array.isArray(usersSitesCookieConsents) && usersSitesCookieConsents.length) {
        [siteCookieConsents] = usersSitesCookieConsents;
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

function fetchUsersDefaultCookieConsents(userSettings) {
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

function fetchUserSettings(graphQLRequest, accessToken) {
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

function fetchCountryCode() {
  // console.log("CookieConsentsManager#fetchCountryCode fetching...");
  return fetch("http://ip-api.com/json")
    .then(res => res.json())
    .then((res) => {
      // console.log("CookieConsentsManager#fetchCountryCode fetched.");
      const countryCode = res ? res.countryCode : "US";
      return countryCode;
    });
}

function fetchCrowdAiCookieConsents(graphQLRequest, accessToken, campaignName) {
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

function saveRemotely(graphQLRequest, accessToken, cookieConsents, campaignReference) {
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

export default function (xbApiUrl) {
  const graphQLRequest = graphQLRequestFactory(xbApiUrl);
  return {
    fetchCountryCode,
    fetchCrowdAiCookieConsents: (...args) => {
      return fetchCrowdAiCookieConsents(graphQLRequest, ...args);
    },
    fetchUsersDefaultCookieConsents,
    fetchUserSettings: (...args) => {
      return fetchUserSettings(graphQLRequest, ...args);
    },
    fetchUsersSiteCookieConsents: (...args) => {
      return fetchUsersSiteCookieConsents(graphQLRequest, ...args);
    },
    saveRemotely: (...args) => {
      return saveRemotely(graphQLRequest, ...args);
    },
  };
}
