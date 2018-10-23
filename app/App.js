import { Component } from "react";

import CookieKitPopup from "./component/CookieKitPopup";
import Campaign from "./model/Campaign";
import { xcoobeeCookiesKey, animations, tokenKey, euCountries } from "./utils";

const testCampaign = {
  id: `${Date.now()}-${Math.random()}`,
  name: "https://lviv.com/",
  position: "left_bottom",
  description: "",
  privacyUrl: "https://lviv.com/policy",
  termsUrl: "https://lviv.com/terms",
  customCss: "css",
  dataTypes: ["application_cookie", "usage_cookie", "statistics_cookie"],
};

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isShown: true,
      isOpen: false,
      isOffline: !Xcoobee.config.campaignId,
      animation: animations.noAnimation,
      pulsing: false,
      countryCode: "US",
    };

    fetch("http://ip-api.com/json")
      .then(res => res.json())
      .then((res) => {
        this.setState({ countryCode: res.countryCode });
        this.setAnimation(res.countryCode);
      });

    setTimeout(() => this.setState({ isShown: false, isOpen: false }), Xcoobee.config.expirationTime * 1000 || 60000);
  }

  setAnimation(countryCode) {
    if (euCountries.includes(countryCode)) {
      return this.startPulsing(animations.euTraffic);
    }
    if (localStorage[xcoobeeCookiesKey]) {
      return this.startPulsing(animations.knownSite);
    }
    if (localStorage[tokenKey]) {
      return this.startPulsing(animations.defaultOptions);
    }
    return animations.noAnimation;
  }

  startPulsing(animation) {
    this.setState({ animation });
    setTimeout(() => this.setState({ pulsing: true }), 1000);
    setTimeout(() => this.setState({ pulsing: false }), 4500);
  }

  renderCookieKitPopUp() {
    const { isOpen, isOffline, countryCode } = this.state;

    return isOpen
      ? (
        <CookieKitPopup
          data={isOffline ? Xcoobee.config : new Campaign(testCampaign)}
          onClose={submit => this.setState({ isOpen: false, isShown: !submit })}
          isOffline={isOffline}
          countryCode={countryCode}
        />
      )
      : (
        <button
          type="button"
          className="cookie-icon-container"
          onClick={() => this.setState({ isOpen: true })}
        >
          <img
            src={`${xcoobeeConfig.domain}/cookie.svg`}
            alt="cookie"
            className="cookie-icon"
          />
        </button>
      );
  }

  render() {
    const { isShown, isOpen, isOffline, animation, pulsing } = this.state;
    const position = isOffline ? Xcoobee.config.position : testCampaign.position;

    return isShown && (
      <div
        className={`container ${position || "left_bottom"}`}
        style={{ width: isOpen ? "auto" : "80px" }}
      >
        {
          animation
            ? <div className={`animated-cookie-icon ${animation ? `${animation}` : ""} ${pulsing ? "pulsing" : ""}`} />
            : this.renderCookieKitPopUp()
        }
      </div>
    );
  }
}
