import { Component } from "react";

import CookieKitPopup from "./component/CookieKitPopup";
import {
  xcoobeeCookiesKey,
  animations,
  tokenKey,
  euCountries,
  cookieTypes,
  requiredFields,
  consentStatuses,
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
      isShown: true,
      loading: true,
      pulsing: false,
    };

    this.timer = null;
    this.errors = false;

    this.checkRequiredFields();
    this.fetchUserSettings();
  }

  setAnimation(countryCode, crowdAI, userSettings) {
    const { config } = XcooBee.kit;
    const savedPreferences = localStorage[xcoobeeCookiesKey];

    if (savedPreferences) {
      config.cookies.forEach((cookie) => {
        const cookieType = cookieTypes.find(type => type.key === cookie.type);

        cookie.checked = JSON.parse(savedPreferences)[cookieType.id];
      });

      return this.startPulsing(animations.knownSite);
    }
    if (userSettings && localStorage[tokenKey]) {
      return this.startPulsing(animations.userSettings);
    }
    if (crowdAI && localStorage[tokenKey]) {
      return this.startPulsing(animations.crowdIntelligence);
    }
    if (!euCountries.includes(countryCode) && config.displayOnlyForEU) {
      return this.startPulsing(animations.companySettings);
    }
    return animations.noAnimation;
  }

  checkRequiredFields() {
    requiredFields.forEach((field) => {
      if (!XcooBee.kit.config[field]) {
        this.errors = true;
        console.error(`${field} field is required as initialization parameter`);
      }
    });
  }

  fetchUserSettings() {
    const { campaignReference } = XcooBee.kit.config;

    if (campaignReference && localStorage[tokenKey]) {
      const query = `query UserConsentSettings {
        user { 
          settings { 
            consent { 
              accept_cookies 
            }
          }
        }
      }`;

      graphQLRequest(query, null, localStorage[tokenKey])
        .then((res) => {
          if (res && res.user.settings.consent) {
            const { config } = XcooBee.kit;

            config.cookies.forEach(cookie => {
              if (res.user.settings.consent.accept_cookies.includes(cookie.type)) {
                cookie.checked = true;
              }
            });
            this.fetchLocation(false, true);
          } else {
            this.fetchCrowdAI();
          }
        });
    } else {
      this.fetchLocation();
    }
  }

  fetchCrowdAI() {
    const query = `query CrowdRating($campaign_name: String!) {
      crowd_rating(campaign_name: $campaign_name) {
        cookie_type value
      }
    }`;

    graphQLRequest(query, { campaign_name: window.location.host }, localStorage[tokenKey])
      .then((res) => {
        if (res && res.crowd_rating) {
          const { config } = XcooBee.kit;

          config.cookies.forEach((cookie) => {
            cookie.checked = res.crowd_rating.find(item => item.cookie_type === cookie.type).value >= 0.8;
          });
          this.fetchLocation(true);
        } else {
          console.error("Wrong campaign name.");
          this.fetchLocation();
        }
      });
  }

  fetchLocation(crowdAI, userSettings) {
    fetch("http://ip-api.com/json")
      .then(res => res.json())
      .then((res) => {
        this.setState({ countryCode: res.countryCode, loading: false });
        this.setAnimation(res.countryCode, crowdAI, userSettings);
        this.startTimer();
      });
  }

  startPulsing(animation) {
    XcooBee.kit.consentStatus = consentStatuses.complete;

    this.setState({ animation });
    setTimeout(() => this.setState({ pulsing: true }), 1000);
    setTimeout(() => this.setState({ pulsing: false }), 4500);
    setTimeout(() => this.setState({ animation: animation.noAnimation }), 5000);
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
    if (this.errors) {
      return;
    }

    this.setState({ isOpen: true });
    clearTimeout(this.timer);
  }

  handleClose(xcoobeeCookies) {
    const { config } = XcooBee.kit;

    if (xcoobeeCookies) {
      config.cookies.forEach((cookie) => {
        const cookieType = cookieTypes.find(type => type.key === cookie.type);

        cookie.checked = xcoobeeCookies[cookieType.id];
      });
    }
    this.setState({ isOpen: false });
    this.startTimer();
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
                onClose={cookies => this.handleClose(cookies)}
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
