import { Component } from "react";

import CookieKitPopup from "./component/CookieKitPopup";
import Campaign from "./model/Campaign";
import { xcoobeeCookiesKey, animations, tokenKey, euCountries, cookieTypes } from "./utils";
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
      loading: true,
      isShown: true,
      isOpen: false,
      isOffline: !Xcoobee.config.campaignReference,
      animation: animations.noAnimation,
      pulsing: false,
      countryCode: "US",
      campaign: new Campaign(Xcoobee.config),
    };

    this.timer = null;

    this.fetchCrowdAI();
  }

  setAnimation(countryCode, crowdAI) {
    const { campaign } = this.state;
    const savedPreferences = localStorage[xcoobeeCookiesKey];

    if (crowdAI) {
      return this.startPulsing(animations.crowdIntelligence);
    }
    if (savedPreferences) {
      campaign.cookies.forEach((cookie) => {
        const cookieType = cookieTypes.find(type => type.key === cookie.type);

        cookie.checked = JSON.parse(savedPreferences)[cookieType.id];
      });

      return this.startPulsing(animations.knownSite);
    }
    if (!euCountries.includes(countryCode) && !localStorage[tokenKey]) {
      return this.startPulsing(animations.euTraffic);
    }
    if (localStorage[tokenKey] && Xcoobee.config.campaignReference) {
      return this.startPulsing(animations.defaultOptions);
    }
    return animations.noAnimation;
  }

  fetchCrowdAI() {
    const { campaignName, campaignReference } = Xcoobee.config;

    if (campaignName && campaignReference && localStorage[tokenKey]) {
      const query = `query CrowdRating($campaign_name: String!) {
        crowd_rating(campaign_name: $campaign_name) {
          cookie_type value
        }
      }`;

      graphQLRequest(query, { campaign_name: campaignName }, localStorage[tokenKey])
        .then((res) => {
          const { campaign } = this.state;

          campaign.cookies.forEach((cookie) => {
            cookie.checked = res.crowd_rating.find(item => item.cookie_type === cookie.type).value >= 0.8;
          });
          this.fetchLocation(true);
        });
    } else {
      this.fetchLocation();
    }
  }

  fetchLocation(crowdAI) {
    fetch("http://ip-api.com/json")
      .then(res => res.json())
      .then((res) => {
        this.setState({ countryCode: res.countryCode, loading: false });
        this.setAnimation(res.countryCode, crowdAI);
        this.startTimer();
      });
  }

  startPulsing(animation) {
    this.setState({ animation });
    setTimeout(() => this.setState({ pulsing: true }), 1000);
    setTimeout(() => this.setState({ pulsing: false }), 4500);
    setTimeout(() => this.setState({ animation: animation.noAnimation }), 6000);
  }

  startTimer() {
    const timeOut = Xcoobee.config.expirationTime;

    if (timeOut && timeOut > 0) {
      this.timer = setTimeout(() => this.setState({ isShown: false }), timeOut * 1000);
    }
  }

  handleOpen(animation) {
    if (animation) {
      return;
    }

    this.setState({ isOpen: true });
    clearTimeout(this.timer);
  }

  handleClose(xcoobeeCookies) {
    const { campaign } = this.state;

    if (xcoobeeCookies) {
      campaign.cookies.forEach((cookie) => {
        const cookieType = cookieTypes.find(type => type.key === cookie.type);

        cookie.checked = xcoobeeCookies[cookieType.id];
      });
    }
    this.setState({ isOpen: false });
    this.startTimer();
  }

  render() {
    const { isShown, isOpen, animation, pulsing, isOffline, countryCode, campaign, loading } = this.state;

    return !loading && (
      <div
        className={`container ${Xcoobee.config.position || "left_bottom"} ${!isShown ? "transparent" : ""}`}
        style={{ width: isOpen ? "auto" : "80px" }}
      >
        {
          isOpen
            ? (
              <CookieKitPopup
                data={campaign}
                onClose={cookies => this.handleClose(cookies)}
                isOffline={isOffline}
                countryCode={countryCode}
              />
            )
            : (
              <button
                type="button"
                onClick={() => this.handleOpen(pulsing)}
              >
                <div className={`cookie-icon ${animation ? `${animation}` : "default"} ${pulsing ? "pulsing" : ""}`} />
              </button>
            )
        }
        {
          (localStorage[tokenKey] || localStorage[xcoobeeCookiesKey]) && (
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
