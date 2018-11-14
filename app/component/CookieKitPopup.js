import { Component } from "react";
import PropTypes from "prop-types";
import ReactCountryFlag from "react-country-flag";
import fetch from "isomorphic-fetch";

import Config from "../model/Config";

import { cookieTypes, locales, tokenKey, links, consentStatuses } from "../utils";
import renderText from "../utils/locales/renderText";
import graphQLRequest from "../utils/graphql";

export default class CookieKitPopup extends Component {
  static propTypes = {
    campaign: Config,
    isOffline: PropTypes.bool,
    countryCode: PropTypes.string,
    onClose: PropTypes.func,
    onLogin: PropTypes.func,
  };

  static defaultProps = {
    campaign: new Config(),
    isOffline: false,
    countryCode: "US",
    onClose: () => {
    },
    onLogin: () => {
    },
  };

  constructor(props) {
    super(props);

    const { campaign } = this.props;
    const checked = [];

    cookieTypes.forEach((type) => {
      if (campaign.cookies.filter(cookie => cookie.checked).map(cookie => cookie.type).includes(type.key)) {
        checked.push(type.id);
      }
    });

    this.state = {
      checked,
      selectedLocale: "EN",
      isShown: false,
      cookies: cookieTypes.filter(type => campaign.cookies.map(cookie => cookie.type).includes(type.key)),
      isAuthorized: !!localStorage[tokenKey],
    };

    this.onMessage = this.onMessage.bind(this);
    window.addEventListener("message", this.onMessage);
  }

  onMessage(event) {
    const { onLogin } = this.props;
    const { token } = event.data;

    if (token) {
      localStorage.setItem(tokenKey, token);
      this.setState({ isAuthorized: true });
      onLogin();
    }
  }

  handleLocaleChange(locale) {
    this.setState({ selectedLocale: locale, isShown: false });
  }

  handleCookieCheck(e, id) {
    let { checked } = this.state;

    if (e.target.checked) {
      checked.push(id);
    } else {
      checked = checked.filter(item => item !== id);
    }

    this.setState({ checked });
  }

  handleCheckAll() {
    const { checked, cookies } = this.state;

    if (cookies.length === checked.length) {
      this.setState({ checked: [] });
    } else {
      this.setState({ checked: cookies.map(cookie => cookie.id) });
    }
  }

  handleSubmit() {
    const { checked, isAuthorized } = this.state;
    const { campaign, onClose, isOffline } = this.props;

    const addConsentQuery = `mutation AddConsents($campaign_reference: String) {
      add_consents(campaign_reference: $campaign_reference) {
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

    campaign.cookies.forEach((cookie) => {
      const cookieType = cookieTypes.find(type => type.key === cookie.type);

      cookie.checked = cookieType && checked.includes(cookieType.id);
    });

    cookieTypes.forEach(type => cookies.push(checked.includes(type.id)));
    xcoobeeCookies.cookies = cookies;

    cookieTypes.filter(type => campaign.cookies.map(cookie => cookie.type).includes(type.key)).forEach((type) => {
      cookieObject[type.key] = checked.includes(type.id);
    });

    localStorage.setItem("xcoobeeCookies", JSON.stringify(xcoobeeCookies));

    if (campaign.cookieHandler) {
      if (typeof campaign.cookieHandler === "string" && typeof window[campaign.cookieHandler] === "function") {
        window[campaign.cookieHandler](cookieObject);
      } else {
        campaign.cookieHandler(cookieObject);
      }
    }

    if (campaign.targetUrl) {
      const result = {
        time: new Date().toUTCString(),
        code: 200,
        result: cookieObject,
      };

      fetch(campaign.targetUrl,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(result),
          mode: "no-cors",
        });
    }

    if (!isOffline && isAuthorized) {
      graphQLRequest(addConsentQuery, { campaign_reference: campaign.campaignReference }, localStorage[tokenKey])
        .then((res) => {
          if (!res || !res.add_consents) {
            return;
          }

          const consentCursor = res.add_consents[0].consent_cursor;
          const dataTypes = cookieTypes.filter(cookie => checked.includes(cookie.id)).map(cookie => cookie.key);
          const config = {
            consents: {
              consent_cursor: consentCursor,
              response: "approved",
              is_data_request: false,
              data: {
                data_types: dataTypes,
              },
            },
          };

          graphQLRequest(modifyConsentQuery, { config }, localStorage[tokenKey]);
        });
    }

    XcooBee.kit.consentStatus = consentStatuses.complete;
    onClose(xcoobeeCookies);
  }

  renderTextMessage(JSON) {
    const { selectedLocale } = this.state;

    switch (selectedLocale) {
      case "EN":
        return JSON["en-us"];
      case "DE":
        return JSON["de-de"] || JSON["en-us"];
      case "ES":
        return JSON["es-419"] || JSON["en-us"];
      case "FR":
        return JSON["fr-fr"] || JSON["en-us"];
      default:
        return JSON["en-us"];
    }
  }

  render() {
    const { campaign, isOffline, onClose, countryCode } = this.props;
    const { checked, isAuthorized, selectedLocale, isShown, cookies } = this.state;

    const width = window.innerWidth || document.body.clientWidth;
    const flagSize = width > 400 ? "25px" : "15px";

    return (
      <div className="cookie-kit-popup">
        <div className="header">
          <div className="logo">
            {
              !isOffline && campaign.companyLogo && (
                <img
                  src={XcooBee.kit.config.companyLogo}
                  alt="company-logo"
                />
              )
            }
          </div>
          <div className="title">{renderText("CookieKit.Title", selectedLocale)}</div>
          <button
            type="button"
            className="closeBtn"
            onClick={onClose}
          >
            <img
              src={`${xcoobeeConfig.domain}/close-icon.svg`}
              alt="close-icon"
            />
          </button>
        </div>
        <div className="text-container">
          <div className="text">
            { typeof campaign.textMessage === "string"
              ? campaign.textMessage : this.renderTextMessage(campaign.textMessage) }
          </div>
          <div className="locale-container">
            <div className="locale">
              <button
                type="button"
                className="block block-sm"
                onClick={() => this.setState({ isShown: !isShown })}
              >
                { selectedLocale }
              </button>
              <div className="block block-sm">
                <div>
                  <ReactCountryFlag code={countryCode} svg styleProps={{ width: flagSize, height: flagSize }} />
                </div>
              </div>
            </div>
            { isShown && (
              <div className="custom-select">
                { locales.map(locale => (
                  <button
                    type="button"
                    onClick={() => this.handleLocaleChange(locale)}
                  >
                    {locale}
                  </button>))}
              </div>
            )}
          </div>
        </div>
        <div className="cookie-list">
          { cookies.map(cookie => (
            <div className="cookie">
              <div className="block block-lg">
                <div>
                  <input
                    id={`checkbox-${cookie.id}`}
                    type="checkbox"
                    checked={checked.includes(cookie.id)}
                    onChange={e => this.handleCookieCheck(e, cookie.id)}
                  />
                  <label
                    htmlFor={`checkbox-${cookie.id}`}
                    className="check-box"
                  />
                </div>
                <div className="cookie-title">
                  <a
                    href={cookie.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {renderText(cookie.localeKey, selectedLocale)}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="check-all"
          onClick={() => this.handleCheckAll()}
        >
          {checked.length === cookies.length
            ? renderText("CookieKit.UncheckButton", selectedLocale)
            : renderText("CookieKit.CheckAllButton", selectedLocale)}
        </button>
        <div className="actions">
          <div>
            <a
              href={links.poweredBy}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="privacy-partner">
                {renderText("CookieKit.PoweredByText", selectedLocale)}
                <img
                  src={`${xcoobeeConfig.domain}/xcoobee-logo.svg`}
                  alt="xcoobee-logo"
                />
              </div>
            </a>
          </div>
          <div className="button-container">
            <button
              type="button"
              className="button"
              onClick={() => this.handleSubmit()}
            >
              OK
            </button>
          </div>
        </div>
        <div className="links">
          { !isOffline && (isAuthorized
            ? (
              <a
                href={links.manage}
                target="_blank"
                rel="noopener noreferrer"
              >
                {renderText("CookieKit.ManageLink", selectedLocale)}
              </a>
            )
            : (
              <button
                type="button"
                onClick={() => window.open(`${links.login}?targetUrl=${window.location.origin}`)}
              >
                {renderText("CookieKit.LoginLink", selectedLocale)}
              </button>
            )
          )}
          <a
            href={campaign.termsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {renderText("CookieKit.TermsLink", selectedLocale)}
          </a>
          <a
            href={campaign.privacyUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {renderText("CookieKit.PolicyLink", selectedLocale)}
          </a>
        </div>
      </div>
    );
  }
}
