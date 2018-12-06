import { Component } from "react";
import PropTypes from "prop-types";
import ReactCountryFlag from "react-country-flag";

import Config from "../model/Config";

import { cookieTypes, locales, tokenKey, links } from "../utils";
import renderText from "../utils/locales/renderText";

export default class CookieKitPopup extends Component {
  static propTypes = {
    campaign: Config,
    isOffline: PropTypes.bool,
    countryCode: PropTypes.string,
    onClose: PropTypes.func,
    onLogin: PropTypes.func,
    onSubmit: PropTypes.func,
    checked: PropTypes.arrayOf(PropTypes.number),
  };

  static defaultProps = {
    campaign: new Config(),
    isOffline: false,
    countryCode: "US",
    onClose: () => {
    },
    onLogin: () => {
    },
    onSubmit: () => {
    },
    checked: [],
  };

  constructor(props) {
    super(props);

    const { campaign, checked } = this.props;

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
    const { checked } = this.state;
    let selected = checked.slice();

    if (e.target.checked) {
      selected.push(id);
    } else {
      selected = checked.filter(item => item !== id);
    }

    this.setState({ checked: selected });
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
    const { campaign, onSubmit } = this.props;
    const { checked } = this.state;

    campaign.cookies.forEach((cookie) => {
      const cookieType = cookieTypes.find(type => type.key === cookie.type);

      cookie.checked = cookieType && checked.includes(cookieType.id);
    });
    onSubmit();
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
    const flagSize = width > 400 ? "25px" : "20px";

    return (
      <div className="xb-cookie-kit-popup">
        <div className="xb-cookie-kit-popup__header">
          <div className="xb-cookie-kit-popup__logo">
            {
              !isOffline && campaign.companyLogo && (
                <img
                  className="xb-cookie-kit-popup__company-logo"
                  src={XcooBee.kit.config.companyLogo}
                  alt="company-logo"
                />
              )
            }
          </div>
          <div className="xb-cookie-kit-popup__title">{renderText("CookieKit.Title", selectedLocale)}</div>
          <button
            type="button"
            className="xb-cookie-kit-popup__close-button"
            onClick={onClose}
          >
            <img
              className="xb-cookie-kit-popup__close-button-icon"
              src={`${xcoobeeConfig.domain}/close-icon.svg`}
              alt="close-icon"
            />
          </button>
        </div>
        <div className="xb-cookie-kit-popup__text-container">
          <div className="xb-cookie-kit-popup__text">
            { typeof campaign.textMessage === "string"
              ? campaign.textMessage : this.renderTextMessage(campaign.textMessage) }
          </div>
          <div className="xb-cookie-kit-popup__locale-container">
            <div className="xb-cookie-kit-popup__locale">
              <button
                type="button"
                className="xb-cookie-kit-popup__language-picker"
                onClick={() => this.setState({ isShown: !isShown })}
              >
                { selectedLocale }
              </button>
              <div className="xb-cookie-kit-popup__block xb-cookie-kit-popup__block--sm">
                <div>
                  <ReactCountryFlag code={countryCode} svg styleProps={{ width: flagSize, height: flagSize }} />
                </div>
              </div>
            </div>
            { isShown && (
              <div className="xb-cookie-kit-popup__custom-select">
                { locales.map(locale => (
                  <button
                    className="xb-cookie-kit-popup__language-picker-button"
                    type="button"
                    onClick={() => this.handleLocaleChange(locale)}
                  >
                    {locale}
                  </button>))}
              </div>
            )}
          </div>
        </div>
        <div className="xb-cookie-kit-popup__cookie-list">
          { cookies.map(cookie => (
            <div className="xb-cookie-kit-popup__cookie">
              <div className="xb-cookie-kit-popup__block xb-cookie-kit-popup__block--lg">
                <div>
                  <input
                    id={`checkbox-${cookie.id}`}
                    type="checkbox"
                    checked={checked.includes(cookie.id)}
                    onChange={e => this.handleCookieCheck(e, cookie.id)}
                  />
                  <label
                    htmlFor={`checkbox-${cookie.id}`}
                    className="xb-cookie-kit-popup__checkbox"
                  />
                </div>
                <div className="xb-cookie-kit-popup__cookie-title">
                  <a
                    className="xb-cookie-kit-popup__cookie-title-link"
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
          className="xb-cookie-kit-popup__check-all"
          onClick={() => this.handleCheckAll()}
        >
          {checked.length === cookies.length
            ? renderText("CookieKit.UncheckButton", selectedLocale)
            : renderText("CookieKit.CheckAllButton", selectedLocale)}
        </button>
        <div className="xb-cookie-kit-popup__actions">
          <div className="xb-cookie-kit-popup__privacy-partner-container">
            <a
              className="xb-cookie-kit-popup__privacy-partner-link"
              href={links.poweredBy}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="xb-cookie-kit-popup__privacy-partner">
                {renderText("CookieKit.PoweredByText", selectedLocale)}
                <img
                  className="xb-cookie-kit-popup__privacy-partner-logo"
                  src={`${xcoobeeConfig.domain}/xcoobee-logo.svg`}
                  alt="xcoobee-logo"
                />
              </div>
            </a>
          </div>
          <div className="xb-cookie-kit-popup__button-container">
            <button
              type="button"
              className="xb-cookie-kit-popup__button"
              onClick={() => this.handleSubmit()}
            >
              OK
            </button>
          </div>
        </div>
        <div className="xb-cookie-kit-popup__links">
          { !isOffline && (isAuthorized
            ? (
              <a
                className="xb-cookie-kit-popup__link"
                href={links.manage}
                target="_blank"
                rel="noopener noreferrer"
              >
                {renderText("CookieKit.ManageLink", selectedLocale)}
              </a>
            )
            : (
              <button
                className="xb-cookie-kit-popup__link"
                type="button"
                onClick={() => window.open(`${links.login}?targetUrl=${window.location.origin}`)}
              >
                {renderText("CookieKit.LoginLink", selectedLocale)}
              </button>
            )
          )}
          <a
            className="xb-cookie-kit-popup__link"
            href={campaign.termsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {renderText("CookieKit.TermsLink", selectedLocale)}
          </a>
          <a
            className="xb-cookie-kit-popup__link"
            href={campaign.privacyUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {renderText("CookieKit.PolicyLink", selectedLocale)}
          </a>
        </div>
        <div className="xb-cookie-kit-popup__powered-by">
          Powered by
          <a
            className="xb-cookie-kit-popup__powered-by-link"
            href={links.poweredBy}
            target="_blank"
            rel="noopener noreferrer"
          >
            XcooBee
          </a>
        </div>
      </div>
    );
  }
}
