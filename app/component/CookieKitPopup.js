import { Component } from "react";
import PropTypes from "prop-types";
import ReactCountryFlag from "react-country-flag";

import Campaign from "../model/Campaign";

import { cookieTypes, locales, tokenKey, links } from "../utils";
import renderText from "../utils/locales/renderText";
import graphQLRequest from "../utils/graphql";

export default class CookieKitPopup extends Component {
  static propTypes = {
    data: Campaign,
    isOffline: PropTypes.bool,
    countryCode: PropTypes.string,
    onClose: PropTypes.func,
  };

  static defaultProps = {
    data: new Campaign(),
    isOffline: false,
    countryCode: "US",
    onClose: () => {
    },
  };

  constructor(props) {
    super(props);

    const { data, isOffline } = this.props;
    const checked = [];

    cookieTypes.forEach((type) => {
      if (data.cookies.filter(cookie => cookie.checked).map(cookie => cookie.type).includes(type.key)) {
        checked.push(type.id);
      }
    });

    this.state = {
      checked,
      selectedLocale: "EN",
      isShown: false,
      cookies: isOffline
        ? cookieTypes : cookieTypes.filter(type => data.cookies.map(cookie => cookie.type).includes(type.key)),
      isAuthorized: !!localStorage[tokenKey],
    };

    this.onMessage = this.onMessage.bind(this);
    window.addEventListener("message", this.onMessage);
  }

  onMessage(event) {
    const { token } = event.data;

    if (token) {
      localStorage.setItem(tokenKey, token);
      this.setState({ isAuthorized: true });
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
    const { data, onClose, isOffline } = this.props;

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
    const xcoobeeCookies = [];

    cookieTypes.forEach(type => xcoobeeCookies.push(checked.includes(type.id)));
    localStorage.setItem("xcoobeeCookies", JSON.stringify(xcoobeeCookies));

    if (!isOffline && isAuthorized) {
      graphQLRequest(addConsentQuery, { campaign_reference: data.reference }, localStorage[tokenKey])
        .then((res) => {
          if (!res) {
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

    onClose(xcoobeeCookies);
  }

  render() {
    const { data, isOffline, onClose, countryCode } = this.props;
    const { checked, isAuthorized, selectedLocale, isShown, cookies } = this.state;

    return (
      <div className="cookie-kit-popup">
        <div className="header">
          <div className="logo">
            {
              !isOffline && (
                <img
                  src={Xcoobee.config.companyLogoUrl}
                  alt="company-logo"
                />
              )
            }
          </div>
          <div className="title">{renderText("CookieKit.Title", selectedLocale)}</div>
          <button
            type="button"
            className="closeBtn"
            onClick={() => onClose()}
          >
            &#215;
          </button>
        </div>
        <div className="text-container">
          <div className="text">
            {Xcoobee.config.textMessage || renderText("CookieKit.PopupMessage", selectedLocale)}
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
              <div className="block block-sm block-img">
                <div>
                  <ReactCountryFlag code={countryCode} svg styleProps={{ width: "25px", height: "25px" }} />
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
                <div>СOOKIE</div>
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
            href={data.termsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {renderText("CookieKit.TermsLink", selectedLocale)}
          </a>
          <a
            href={data.privacyUrl}
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
