import { Component } from "react";
import CryptoJS from "crypto-js";

import CookieKitPopup from "./component/CookieKitPopup";
import {
  xcoobeeCookiesKey,
  animations,
  tokenKey,
  euCountries,
  cookieTypes,
  requiredFields,
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

  constructor(props) {
    super(props);

    this.state = {
      animation: animations.noAnimation,
      countryCode: "US",
      isOffline: !XcooBee.kit.config.campaignReference,
      isOpen: false,
      isShown: !XcooBee.kit.config.hideOnComplete || XcooBee.kit.consentStatus !== consentStatuses.complete,
      loading: true,
      pulsing: false,
      userOptions: [],
      crowdAI: false,
    };

    this.timer = null;
    this.errors = false;

    this.checkRequiredFields();

    const timestamp = localStorage[xcoobeeCookiesKey] ? JSON.parse(localStorage[xcoobeeCookiesKey]).timestamp : null;

    if (timestamp && ((Date.now() - timestamp) < expirationTime)) {
      this.fetchLocation(false, false, true);
    } else {
      this.fetchUserSettings();
    }
  }

  setAnimation(countryCode, crowdAI, userSettings, savedPreferences) {
    const { userOptions } = this.state;
    const { config } = XcooBee.kit;

    if (savedPreferences) {
      config.cookies.forEach((cookie) => {
        const cookieType = cookieTypes.find(type => type.key === cookie.type);

        cookie.checked = JSON.parse(localStorage[xcoobeeCookiesKey]).cookies[cookieType.id];
      });

      return this.startPulsing(animations.userSettings);
    }
    if (userSettings && localStorage[tokenKey]) {
      return this.startPulsing(animations.userSettings);
    }
    if (crowdAI && localStorage[tokenKey]) {
      return this.startPulsing(animations.crowdIntelligence);
    }
    if (userOptions.length && localStorage[tokenKey]) {
      config.cookies.forEach((cookie) => {
        if (userOptions.includes(cookie.type)) {
          cookie.checked = true;
        }
      });

      return this.startPulsing(animations.userPreference);
    }
    if (!euCountries.includes(countryCode) && config.displayOnlyForEU) {
      config.cookies.forEach((cookie) => {
        if (config.checkByDefaultTypes.includes(cookie.type)) {
          cookie.checked = true;
        }
      });

      return this.startPulsing(animations.companyPreference);
    }
    this.setState({ isOpen: true });
    return animations.noAnimation;
  }

  checkRequiredFields() {
    requiredFields.forEach((field) => {
      if (!XcooBee.kit.config[field]) {
        this.errors = true;
        console.error(`${field} field is required as initialization parameter`);
      }
    });

    if (!XcooBee.kit.config.cookieHandler && !XcooBee.kit.config.targetUrl) {
      this.errors = true;
      console.error("One of cookieHandler or targetUrl fields is required as initialization parameter");
    }
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
        });
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
            if (siteSettings.cookies.includes(cookie.type)) {
              cookie.checked = true;
            }
          });
          this.fetchLocation(false, true);
        } else {
          this.fetchCrowdAI();
        }
      });
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
              cookie.checked = crowdRating.find(item => item.cookie_type === cookie.type).value >= 0.8;
            });
            this.fetchLocation(true);
          }
        });
    } else {
      this.fetchLocation();
    }
  }

  fetchLocation(crowdAI, userSettings, savedPreferences) {
    fetch("http://ip-api.com/json")
      .then(res => res.json())
      .then((res) => {
        this.setState({ countryCode: res.countryCode, loading: false });
        this.setAnimation(res.countryCode, crowdAI, userSettings, savedPreferences);
        this.startTimer();
      });
  }

  startPulsing(animation) {
    XcooBee.kit.consentStatus = consentStatuses.complete;

    this.setState({ animation });
    setTimeout(() => this.setState({ pulsing: true }), 1000);
    setTimeout(() => this.setState({ pulsing: false }), 4500);
    setTimeout(() => this.setState({ animation: animations.noAnimation }), 5000);
  }

  startTimer() {
    const timeOut = XcooBee.kit.config.expirationTime;

    if (timeOut && timeOut > 0) {
      this.timer = setTimeout(() => {
        XcooBee.kit.consentStatus = consentStatuses.closed;
        this.setState({ isShown: false });
      }, timeOut * 1000);
    }
  }

  handleOpen(animation) {
    const { loading } = this.state;

    if (this.errors || animation !== animations.noAnimation || loading) {
      return;
    }

    this.setState({ isOpen: true });
    clearTimeout(this.timer);
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

  render() {
    const { isShown, isOpen, animation, pulsing, isOffline, countryCode, loading } = this.state;

    return !loading && (
      <div
        className={`container ${XcooBee.kit.config.position || "left_bottom"} ${!isShown ? "transparent" : ""}`}
        style={{ width: isOpen ? "auto" : "80px" }}
      >
        {
          isOpen
            ? (
              <CookieKitPopup
                campaign={XcooBee.kit.config}
                onClose={() => this.handleClose()}
                onLogin={() => this.handleLogin()}
                isOffline={isOffline}
                countryCode={countryCode}
              />
            )
            : (
              <button
                type="button"
                onClick={() => this.handleOpen(animation)}
              >
                <div className={`cookie-icon ${animation ? `${animation}` : "default"} ${pulsing ? "pulsing" : ""}`} />
              </button>
            )
        }
        {
          (localStorage[tokenKey] || localStorage[xcoobeeCookiesKey]) && XcooBee.kit.config.testMode && (
            <button
              type="button"
              className="refresh-button"
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
