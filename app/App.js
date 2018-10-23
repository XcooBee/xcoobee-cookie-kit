import { Component } from "react";
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} from "graphql";

import CookieKitPopup from "./component/CookieKitPopup";
import Campaign from "./model/Campaign";
import { xcoobeeCookiesKey, animations, tokenKey, euCountries } from "./utils";
import { graphQLRequest } from "./utils/graphql";

const testCampaign = {
  id: `${Date.now()}-${Math.random()}`,
  name: "https://lviv.com/",
  position: "left_bottom",
  description: "",
  privacyUrl: "https://lviv.com/policy",
  termsUrl: "https://lviv.com/terms",
  customCss: "css",
  dataTypes: ["application_cookie", "usage_cookie", "statistics_cookie"]
};

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isShown: true,
      isOpen: false,
      isOffline: !Xcoobee.config.campaignId,
      isKnown: !!localStorage[xcoobeeCookiesKey],
      animation: animations.noAnimation,
      pulsing: false,
      countryCode: "US"
    };

    fetch("http://ip-api.com/json")
      .then(res => res.json())
      .then(res => {
        this.setState({ countryCode: res.countryCode });
        this.setAnimation(res.countryCode);
      });

    setTimeout(() => this.setState({ isShown: false, isOpen: false }), Xcoobee.config.expirationTime * 1000 || 60000);
  }

  setAnimation(countryCode) {
    if (euCountries.includes(countryCode)) {
      this.startPulsing(animations.euTraffic);
    } else if (!!localStorage[xcoobeeCookiesKey]) {
      this.startPulsing(animations.knownSite);
    } else if (!!localStorage[tokenKey]) {
      this.startPulsing(animations.defaultOptions);
    } else {
      return animations.noAnimation;
    }
  }

  startPulsing(animation) {
    this.setState({ animation });
    setTimeout(() => this.setState({ pulsing: true }), 1000);
    setTimeout(() => this.setState({ pulsing: false }), 4500);
  }

  fetchCampaign() {
    const query = `
            query FetchWizardCampaign($campaign_cursor: String, $reference: String) {
                campaign(campaign_cursor: $campaign_cursor, reference: $reference) {
                    ...consentCampaignFields
                }
            }`;

    return graphQLRequest(query, {
      campaign_cursor: { type: GraphQLString },
      reference: { type: GraphQLString }
    })
      .then(res => console.log(res));
  }

  render() {
    const { isShown, isOpen, isOffline, animation, isKnown, pulsing, countryCode } = this.state;
    const position = isOffline ? Xcoobee.config.position : testCampaign.position;

    return isShown && <div className={`container ${position || "left_bottom"}`}
                           style={{ width: isOpen ? "auto" : "80px" }}>
        { animation ?
          <div className={`animated-cookie-icon ${animation ? `${animation}` : ""} ${pulsing ? "pulsing" : ""}`} /> :
          isOpen ?
            <CookieKitPopup data={isOffline ? Xcoobee.config : new Campaign(testCampaign)}
                            onClose={submit => this.setState({ isOpen: false, isShown: !submit })}
                            isOffline={isOffline} countryCode={countryCode} /> :
            <img src={`${xcoobeeConfig.domain}/cookie.svg`}
                 className="cookie-icon"
                 onClick={() => this.setState({ isOpen: true })} /> }
      </div>;
  }
}
