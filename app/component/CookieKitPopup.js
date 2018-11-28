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
      <div className="cookie__kit__popup">
        <div className="header">
          <div className="logo">
            {
              !isOffline && campaign.companyLogo && (
                <img
                  className="company__logo"
                  src={XcooBee.kit.config.companyLogo}
                  alt="company-logo"
                />
              )
            }
          </div>
          <div className="title">{renderText("CookieKit.Title", selectedLocale)}</div>
          <button
            type="button"
            className="close__button"
            onClick={onClose}
          >
            <img
              className="close__button__icon"
              src={`${xcoobeeConfig.domain}/close-icon.svg`}
              alt="close-icon"
            />
          </button>
        </div>
        <div className="text__container">
          <div className="text">
            { typeof campaign.textMessage === "string"
              ? campaign.textMessage : this.renderTextMessage(campaign.textMessage) }
          </div>
          <div className="locale__container">
            <div className="locale">
              <button
                type="button"
                className="block block--sm language__picker"
                onClick={() => this.setState({ isShown: !isShown })}
              >
                { selectedLocale }
              </button>
              <div className="block block--sm">
                <div>
                  <ReactCountryFlag code={countryCode} svg styleProps={{ width: flagSize, height: flagSize }} />
                </div>
              </div>
            </div>
            { isShown && (
              <div className="custom__select">
                { locales.map(locale => (
                  <button
                    className="language__picker__button"
                    type="button"
                    onClick={() => this.handleLocaleChange(locale)}
                  >
                    {locale}
                  </button>))}
              </div>
            )}
          </div>
        </div>
        <div className="cookie__list">
          { cookies.map(cookie => (
            <div className="cookie">
              <div className="block block--lg">
                <div>
                  <input
                    id={`checkbox-${cookie.id}`}
                    type="checkbox"
                    checked={checked.includes(cookie.id)}
                    onChange={e => this.handleCookieCheck(e, cookie.id)}
                  />
                  <label
                    htmlFor={`checkbox-${cookie.id}`}
                    className="check__box"
                  />
                </div>
                <div className="cookie__title">
                  <a
                    className="cookie__title__link"
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
          className="check__all"
          onClick={() => this.handleCheckAll()}
        >
          {checked.length === cookies.length
            ? renderText("CookieKit.UncheckButton", selectedLocale)
            : renderText("CookieKit.CheckAllButton", selectedLocale)}
        </button>
        <div className="actions">
          <div className="privacy__partner__container">
            <a
              className="privacy__partner__link"
              href={links.poweredBy}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="privacy__partner">
                {renderText("CookieKit.PoweredByText", selectedLocale)}
                <img
                  className="privacy__partner__logo"
                  src={`${xcoobeeConfig.domain}/xcoobee-logo.svg`}
                  alt="xcoobee-logo"
                />
              </div>
            </a>
          </div>
          <div className="button__container">
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
                className="link"
                href={links.manage}
                target="_blank"
                rel="noopener noreferrer"
              >
                {renderText("CookieKit.ManageLink", selectedLocale)}
              </a>
            )
            : (
              <button
                className="link"
                type="button"
                onClick={() => window.open(`${links.login}?targetUrl=${window.location.origin}`)}
              >
                {renderText("CookieKit.LoginLink", selectedLocale)}
              </button>
            )
          )}
          <a
            className="link"
            href={campaign.termsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {renderText("CookieKit.TermsLink", selectedLocale)}
          </a>
          <a
            className="link"
            href={campaign.privacyUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {renderText("CookieKit.PolicyLink", selectedLocale)}
          </a>
        </div>
        <div className="powered__by">Powered by XcooBee</div>
      </div>
    );
  }
}
