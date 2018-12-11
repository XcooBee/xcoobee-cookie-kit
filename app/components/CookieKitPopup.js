import PropTypes from "prop-types";
import React from "react";
import ReactCountryFlag from "react-country-flag";

import AuthenticationManager from "../lib/AuthenticationManager";
import CookieConsentShape from "../lib/CookieConsentShape";

import {
  cookieDefns as allAvailCookieDefns,
  cookieTypes,
  locales,
  links,
} from "../utils";
import renderText from "../utils/locales/renderText";

export default class CookieKitPopup extends React.PureComponent {
  static propTypes = {
    companyLogo: PropTypes.string,
    cookieConsents: PropTypes.arrayOf(CookieConsentShape.isRequired).isRequired,
    countryCode: PropTypes.string,
    isConnected: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onLogin: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    privacyUrl: PropTypes.string.isRequired,
    requestDataTypes: PropTypes.arrayOf(
      PropTypes.oneOf(cookieTypes).isRequired,
    ).isRequired,
    termsUrl: PropTypes.string.isRequired,
    textMessage: PropTypes.string.isRequired,
  };

  static defaultProps = {
    companyLogo: null,
    countryCode: "US",
  };

  constructor(props) {
    super(props);

    const { cookieConsents } = this.props;
    const cookieConsentLut = {};
    cookieConsents.forEach((cookieConsent) => {
      cookieConsentLut[cookieConsent.type] = cookieConsent.checked;
    });

    this.state = {
      cookieConsentLut,
      selectedLocale: "EN",
      isShown: false,
    };

    window.addEventListener("message", this.onMessage);
  }

  componentWillUnmount() {
    window.removeEventListener("message", this.onMessage);
  }

  onMessage = (event) => {
    const { onLogin } = this.props;
    const { token } = event.data;

    if (token) {
      onLogin(token);
    }
  }

  handleLocaleChange = (locale) => {
    this.setState({ selectedLocale: locale, isShown: false });
  }

  handleCookieCheck = (e, type) => {
    const { cookieConsentLut } = this.state;
    const checked = {
      ...cookieConsentLut,
    };

    checked[type] = e.target.checked;

    this.setState({ cookieConsentLut: checked });
  }

  handleCheckAll = () => {
    const { cookieConsentLut } = this.state;

    const isAllChecked = Object.values(cookieConsentLut).every(checked => checked);

    if (isAllChecked) {
      const noneChecked = {};
      Object.keys(cookieConsentLut).forEach((cookieName) => {
        noneChecked[cookieName] = false;
      });
      this.setState({ cookieConsentLut: noneChecked });
    } else {
      const allChecked = {};
      Object.keys(cookieConsentLut).forEach((cookieName) => {
        allChecked[cookieName] = true;
      });
      this.setState({ cookieConsentLut: allChecked });
    }
  }

  handleSubmit = () => {
    const { onSubmit } = this.props;
    const { cookieConsentLut } = this.state;

    onSubmit(cookieConsentLut);
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
    const {
      companyLogo,
      countryCode,
      isConnected,
      onClose,
      privacyUrl,
      requestDataTypes,
      termsUrl,
      textMessage,
    } = this.props;
    const { cookieConsentLut, isShown, selectedLocale } = this.state;
    const isAuthorized = AuthenticationManager.getAccessToken();

    // TODO: Move the following to CSS. Use media query.
    const width = window.innerWidth || document.body.clientWidth;
    const flagSize = width > 400 ? "25px" : "20px";

    const isAllChecked = Object.values(cookieConsentLut).every(checked => checked);

    const cookieDefns = allAvailCookieDefns.filter(
      defn => requestDataTypes.includes(defn.type),
    );

    return (
      <div className="xb-cookie-kit-popup">
        <div className="xb-cookie-kit-popup__header">
          <div className="xb-cookie-kit-popup__logo">
            {
              isConnected && companyLogo && (
                <img
                  className="xb-cookie-kit-popup__company-logo"
                  src={companyLogo}
                  alt="Company logo"
                />
              )
            }
          </div>
          <div className="xb-cookie-kit-popup__title">{renderText("CookieKit.Title", selectedLocale)}</div>
          <button
            type="button"
            className="xb-cookie-kit__button xb-cookie-kit-popup__close-button"
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
            { typeof textMessage === "string"
              ? textMessage : this.renderTextMessage(textMessage) }
          </div>
          <div className="xb-cookie-kit-popup__locale-container">
            <div className="xb-cookie-kit-popup__locale">
              <button
                type="button"
                className="xb-cookie-kit__button xb-cookie-kit-popup__language-picker"
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
                    className="xb-cookie-kit__button xb-cookie-kit-popup__language-picker-button"
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
          { cookieDefns.map(cookieDefn => (
            <div className="xb-cookie-kit-popup__cookie">
              <div className="xb-cookie-kit-popup__block xb-cookie-kit-popup__block--lg">
                <div>
                  <input
                    id={`xbCheckbox_${cookieDefn.id}`}
                    type="checkbox"
                    checked={cookieConsentLut[cookieDefn.type]}
                    onChange={e => this.handleCookieCheck(e, cookieDefn.type)}
                  />
                  <label
                    htmlFor={`xbCheckbox_${cookieDefn.id}`}
                    className="xb-cookie-kit-popup__checkbox"
                  />
                </div>
                <div className="xb-cookie-kit-popup__cookie-title">
                  <a
                    className="xb-cookie-kit-popup__cookie-title-link"
                    href={cookieDefn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {renderText(cookieDefn.localeKey, selectedLocale)}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="xb-cookie-kit__button xb-cookie-kit-popup__check-all"
          onClick={this.handleCheckAll}
        >
          {isAllChecked
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
                  alt="XcooBee logo"
                />
              </div>
            </a>
          </div>
          <div className="xb-cookie-kit-popup__button-container">
            <button
              type="button"
              className="xb-cookie-kit__button xb-cookie-kit-popup__button"
              onClick={this.handleSubmit}
            >
              {renderText("CookieKit.OkButton", selectedLocale)}
            </button>
          </div>
        </div>
        <div className="xb-cookie-kit-popup__links">
          { isConnected && (isAuthorized
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
                className="xb-cookie-kit__button xb-cookie-kit-popup__link"
                type="button"
                onClick={() => window.open(`${links.login}?targetUrl=${window.location.origin}`)}
              >
                {renderText("CookieKit.LoginLink", selectedLocale)}
              </button>
            )
          )}
          <a
            className="xb-cookie-kit-popup__link"
            href={termsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {renderText("CookieKit.TermsLink", selectedLocale)}
          </a>
          <a
            className="xb-cookie-kit-popup__link"
            href={privacyUrl}
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
