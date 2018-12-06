import { Component } from "react";
import CryptoJS from "crypto-js";
import fetch from "isomorphic-fetch";

import CookieKitPopup from "./component/CookieKitPopup";
import {
  xcoobeeCookiesKey,
  animations,
  tokenKey,
  euCountries,
  cookieTypes,
  consentStatuses,
  expirationTime,
} from "./utils";
import graphQLRequest from "./utils/graphql";

export default class App extends Component {
  // Remove cookies preferences and auth token from local storage (for easier testing)
  static refresh() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(xcoobeeCookiesKey);
    window.location.reload();
  }

  static handleErrors(error) {
    if (Array.isArray(error)) {
      error.forEach((e) => { throw new Error(e.message); });
    } else if (error) {
      throw new Error(error.message);
    }
  }

  static callCookieHandler(cookieObject) {
    const { config } = XcooBee.kit;

    if (typeof config.cookieHandler === "string") {
      if (typeof window[config.cookieHandler] === "function") {
        window[config.cookieHandler](cookieObject);
      } else {
        console.error(`Cookie handler function "${config.cookieHandler}" is missing`);
      }
    } else {
      config.cookieHandler(cookieObject);
    }
  }

  static callTargetUrl(cookieObject) {
    const { config } = XcooBee.kit;

    const result = {
      time: new Date().toISOString(),
      code: 200,
      result: cookieObject,
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

  constructor(props) {
    super(props);

    this.state = {
      animation: animations.noAnimation,
      countryCode: "US",
      isOffline: !XcooBee.kit.config.campaignReference,
      isOpen: false,
      isShown: true,
      loading: true,
      pulsing: false,
      userOptions: [],
      crowdAI: false,
      checked: [],
    };

    this.timers = [];

    const timestamp = localStorage[xcoobeeCookiesKey] ? JSON.parse(localStorage[xcoobeeCookiesKey]).timestamp : null;

    if (timestamp && ((Date.now() - timestamp) < expirationTime)) {
      this.fetchLocation(false, false, true);
    } else {
      this.fetchUserSettings();
    }
  }

  componentWillUnmount() {
    this.timers.forEach(timer => clearTimeout(timer));
  }

  setAnimation(countryCode, blnCrowdAI, blnUserSettings, blnSavedPreferences) {
    const { userOptions } = this.state;
    const { config } = XcooBee.kit;

    if (blnSavedPreferences) {
      const cookieObject = {};

      config.cookies.forEach((cookie) => {
        const cookieType = cookieTypes.find(type => type.key === cookie.type);
        const checked = JSON.parse(localStorage[xcoobeeCookiesKey]).cookies[cookieType.id];

        cookie.checked = checked;
        cookieObject[cookie.type] = checked;
      });

      if (config.cookieHandler) {
        App.callCookieHandler(cookieObject);
      }

      if (config.targetUrl) {
        App.callTargetUrl(cookieObject);
      }

      return this.startPulsing(animations.userSettings);
    }
    if (blnUserSettings && localStorage[tokenKey]) {
      this.handleSubmit();

      return this.startPulsing(animations.userSettings);
    }
    if (blnCrowdAI && localStorage[tokenKey]) {
      this.handleSubmit();

      return this.startPulsing(animations.crowdIntelligence);
    }
    if (userOptions.length && localStorage[tokenKey]) {
      config.cookies.forEach((cookie) => {
        if (userOptions.includes(cookie.type)) {
          cookie.checked = true;
        }
      });
      this.handleSubmit();

      return this.startPulsing(animations.userPreference);
    }
    if (!euCountries.includes(countryCode) && config.displayOnlyForEU) {
      config.cookies.forEach((cookie) => {
        if (config.checkByDefaultTypes.includes(cookie.type)) {
          cookie.checked = true;
        }
      });
      this.handleSubmit();

      return this.startPulsing(animations.companyPreference);
    }

    const checked = [];

    cookieTypes.forEach((type) => {
      if (XcooBee.kit.config.cookies.filter(cookie => cookie.checked).map(cookie => cookie.type).includes(type.key)) {
        checked.push(type.id);
      }
    });
    this.setState({ checked, isOpen: true });

    return animations.noAnimation;
  }

  fetchUserSettings(afterLogin) {
    const { campaignReference } = XcooBee.kit.config;

    if (afterLogin) {
      this.setState({ loading: true });
    }

    if (campaignReference && localStorage[tokenKey]) {
      const query = `query UserConsentSettings {
        user { 
          cursor,
          xcoobee_id,
          settings { 
            consent { 
              accept_cookies,
              use_crowd_ai
            }
          }
        }
      }`;

      graphQLRequest(query, null, localStorage[tokenKey])
        .then((res) => {
          this.setState({ crowdAI: res.user.settings.consent && res.user.settings.consent.use_crowd_ai });
          if (res.user.settings.consent && res.user.settings.consent.accept_cookies) {
            this.setState({ userOptions: res.user.settings.consent.accept_cookies });
          }
          this.fetch100Sites(res.user.cursor, res.user.xcoobee_id);
        })
        .catch(App.handleErrors);
    } else {
      this.fetchLocation();
    }
  }

  fetch100Sites(userCursor, xcoobeeId) {
    const query = `query SystemUserQueries($user_cursor: String!) {
      cookie_consents(user_cursor: $user_cursor) {
        site,
        cookies
      }
    }`;

    graphQLRequest(query, { user_cursor: userCursor }, localStorage[tokenKey])
      .then((res) => {
        const siteSettings = res.cookie_consents
          .find(consent => consent.site === CryptoJS.SHA256(`${window.location.origin.toLowerCase()}${xcoobeeId}`)
            .toString(CryptoJS.enc.Base64));

        if (siteSettings && siteSettings.cookies.length) {
          const { config } = XcooBee.kit;

          config.cookies.forEach((cookie) => {
            if (siteSettings.cookies.includes(cookieTypes.find(type => type.key === cookie.type).dbKey)) {
              cookie.checked = true;
            }
          });
          this.fetchLocation(false, true);
        } else {
          this.fetchCrowdAI();
        }
      })
      .catch(App.handleErrors);
  }

  fetchCrowdAI() {
    const { crowdAI } = this.state;

    if (crowdAI) {
      const query = `query CrowdRating($campaign_name: String!) {
        crowd_rating(campaign_name: $campaign_name) {
          cookie_type value
        }
      }`;

      graphQLRequest(query, { campaign_name: window.location.host }, localStorage[tokenKey])
        .then((res) => {
          const crowdRating = res ? res.crowd_rating : null;

          if (crowdRating) {
            const { config } = XcooBee.kit;

            config.cookies.forEach((cookie) => {
              const ratedCookie = crowdRating.find(item => item.cookie_type.includes(cookie.type));

              if (ratedCookie && ratedCookie.value >= 0.8) {
                cookie.checked = true;
              } else {
                cookie.checked = false;
              }
            });
            this.fetchLocation(true);
          }
        })
        .catch(App.handleErrors);
    } else {
      this.fetchLocation();
    }
  }

  fetchLocation(blnCrowdAI, blnUserSettings, blnSavedPreferences) {
    fetch("http://ip-api.com/json")
      .then(res => res.json())
      .then((res) => {
        const countryCode = res ? res.countryCode : "US";

        this.setState({ countryCode, loading: false });
        this.setAnimation(countryCode, blnCrowdAI, blnUserSettings, blnSavedPreferences);
        this.startTimer();
      });
  }

  startPulsing(animation) {
    const checked = [];

    cookieTypes.forEach((type) => {
      if (XcooBee.kit.config.cookies.filter(cookie => cookie.checked).map(cookie => cookie.type).includes(type.key)) {
        checked.push(type.id);
      }
    });
    this.setState({ checked });

    XcooBee.kit.consentStatus = consentStatuses.complete;

    this.setState({ animation });
    this.timers.push(setTimeout(() => this.setState({ pulsing: true }), 1000));
    this.timers.push(setTimeout(() => this.setState({ pulsing: false }), 4500));
    this.timers.push(setTimeout(() => this.setState({ animation: animations.noAnimation }), 5000));
  }

  startTimer() {
    const timeOut = XcooBee.kit.config.expirationTime;

    if (timeOut && timeOut > 0) {
      this.timers.push(setTimeout(() => {
        XcooBee.kit.consentStatus = consentStatuses.closed;
        this.setState({ isShown: false });
      }, timeOut * 1000));
    }
  }

  handleOpen(animation) {
    const { loading } = this.state;

    if (animation !== animations.noAnimation || loading) {
      return;
    }

    this.setState({ isOpen: true });
    this.timers.forEach(timer => clearTimeout(timer));
  }

  handleClose() {
    this.setState({ isOpen: false });
    this.startTimer();

    if (XcooBee.kit.config.hideOnComplete) {
      this.setState({ isShown: false });
    }
  }

  handleLogin() {
    this.setState({ isOpen: false });
    this.fetchUserSettings(true);
  }

  handleSubmit() {
    const { isOffline } = this.state;
    const { config } = XcooBee.kit;

    const addConsentQuery = `mutation AddConsents($campaign_reference: String, $domain: String) {
      add_consents(campaign_reference: $campaign_reference, domain: $domain) {
        consent_cursor
      }
    }`;
    const modifyConsentQuery = `mutation ModifyConsents($config: ConsentConfig) {
      modify_consents(config: $config) {
        data {
            consent_cursor
          }
      }
    }`;

    const xcoobeeCookies = { timestamp: Date.now(), cookies: [] };
    const cookies = [];
    const cookieObject = {};

    cookieTypes.forEach((type) => {
      const cookie = config.cookies.find(item => item.type === type.key);

      if (cookie && cookie.checked) {
        cookies.push(true);
      } else {
        cookies.push(false);
      }
    });
    xcoobeeCookies.cookies = cookies;

    config.cookies.forEach((cookie) => {
      cookieObject[cookie.type] = cookie.checked;
    });

    localStorage.setItem("xcoobeeCookies", JSON.stringify(xcoobeeCookies));

    if (config.cookieHandler) {
      App.callCookieHandler(cookieObject);
    }

    if (config.targetUrl) {
      App.callTargetUrl(cookieObject);
    }

    if (!isOffline && !!localStorage[tokenKey]) {
      graphQLRequest(addConsentQuery, {
        campaign_reference: config.campaignReference,
        domain: window.location.origin,
      }, localStorage[tokenKey])
        .then((res) => {
          if (!res || !res.add_consents) {
            return;
          }

          const consentCursor = res.add_consents[0].consent_cursor;
          const dataTypes = config.cookies.filter(item => item.checked)
            .map(item => cookieTypes.find(type => type.key === item.type).dbKey);
          const data = {
            consents: {
              consent_cursor: consentCursor,
              response: "approved",
              is_data_request: false,
              data: {
                data_types: dataTypes,
              },
            },
          };

          graphQLRequest(modifyConsentQuery, { config: data }, localStorage[tokenKey])
            .catch(App.handleErrors);
        })
        .catch(App.handleErrors);
    }

    const checked = [];

    cookieTypes.forEach((type) => {
      if (XcooBee.kit.config.cookies.filter(cookie => cookie.checked).map(cookie => cookie.type).includes(type.key)) {
        checked.push(type.id);
      }
    });
    this.setState({ checked });

    XcooBee.kit.consentStatus = consentStatuses.complete;
    this.handleClose();
  }

  render() {
    const { isShown, isOpen, animation, pulsing, isOffline, countryCode, loading, checked } = this.state;
    const isHide = XcooBee.kit.config.hideOnComplete && XcooBee.kit.consentStatus === consentStatuses.complete;

    return !loading && !isHide && (
      <div
        className={`xb-cookie-kit ${XcooBee.kit.config.position} ${!isShown ? "transparent" : ""}`}
        style={{ width: isOpen ? "auto" : "4vw" }}
      >
        {
          isOpen
            ? (
              <CookieKitPopup
                campaign={XcooBee.kit.config}
                onClose={() => this.handleClose()}
                onSubmit={() => this.handleSubmit()}
                onLogin={() => this.handleLogin()}
                isOffline={isOffline}
                countryCode={countryCode}
                checked={checked}
              />
            )
            : (
              <button
                type="button"
                onClick={() => this.handleOpen(animation)}
              >
                {/* eslint-disable-next-line */}
                <div className={`xb-cookie-kit__cookie-icon xb-cookie-kit__cookie-icon--${animation ? `${animation}` : "default"} ${pulsing ? "xb-cookie-kit__pulsing" : ""}`} />
              </button>
            )
        }
        {
          (localStorage[tokenKey] || localStorage[xcoobeeCookiesKey]) && XcooBee.kit.config.testMode && (
            <button
              type="button"
              className="xb-cookie-kit__refresh-button"
              onClick={() => App.refresh()}
            >
              Refresh
            </button>
          )
        }
      </div>
    );
  }
}
