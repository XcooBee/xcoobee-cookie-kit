import PropTypes from "prop-types";
import React from "react";
import ReactCountryFlag from "react-country-flag";

import xcoobeeConfig from "../config/xcoobeeConfig";

import CookieConsentShape from "../lib/CookieConsentShape";

import {
  cookieDefns as allAvailCookieDefns,
  cookieTypes,
  locales,
  links,
} from "../utils";
import renderText from "../utils/locales/renderText";

const BLOCK = "xb-cookie-kit-popup";

export default class CookieKitPopup extends React.PureComponent {
  static propTypes = {
    accessToken: PropTypes.string,
    companyLogo: PropTypes.string,
    cookieConsents: PropTypes.arrayOf(CookieConsentShape.isRequired).isRequired,
    countryCode: PropTypes.string,
    hideBrandTag: PropTypes.bool.isRequired,
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
    accessToken: null,
    companyLogo: null,
    countryCode: null,
  };

  constructor(props) {
    // console.log('CookieKitPopup#constructor');
    super(props);

    const { cookieConsents } = this.props;
    const consentSettings = {};
    cookieConsents.forEach((cookieConsent) => {
      consentSettings[cookieConsent.type] = cookieConsent.checked;
    });

    this.state = {
      consentSettings,
      selectedLocale: "EN",
      isShown: false,
    };

    window.addEventListener("message", this.onMessage);
  }

  componentWillUnmount() {
    // console.log('CookieKitPopup#componentWillUnmount');
    window.removeEventListener("message", this.onMessage);
  }

  onMessage = (event) => {
    // console.log('CookieKitPopup#onMessage');
    const { onLogin } = this.props;
    const { token } = event.data;

    if (token) {
      onLogin(token);
    }
  }

  handleLocaleChange = (locale) => {
    // console.log('CookieKitPopup#handleLocaleChange');
    this.setState({ selectedLocale: locale, isShown: false });
  }

  handleCookieCheck = (e, type) => {
    // console.log('CookieKitPopup#handleCookieCheck');
    const { consentSettings } = this.state;
    const checked = {
      ...consentSettings,
    };

    checked[type] = e.target.checked;

    this.setState({ consentSettings: checked });
  }

  handleCheckAll = () => {
    // console.log('CookieKitPopup#handleCheckAll');
    const { consentSettings } = this.state;

    const isAllChecked = Object.values(consentSettings).every(checked => checked);

    if (isAllChecked) {
      const noneChecked = {};
      Object.keys(consentSettings).forEach((cookieName) => {
        noneChecked[cookieName] = false;
      });
      this.setState({ consentSettings: noneChecked });
    } else {
      const allChecked = {};
      Object.keys(consentSettings).forEach((cookieName) => {
        allChecked[cookieName] = true;
      });
      this.setState({ consentSettings: allChecked });
    }
  }

  handleSubmit = () => {
    // console.log('CookieKitPopup#handleSubmit');
    const { onSubmit } = this.props;
    const { consentSettings } = this.state;

    onSubmit(consentSettings);
  }

  renderTextMessage(JSON) {
    // console.log('CookieKitPopup#renderTextMessage');
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
    // console.log('CookieKitPopup#render');
    const {
      accessToken,
      companyLogo,
      countryCode,
      hideBrandTag,
      isConnected,
      onClose,
      privacyUrl,
      requestDataTypes,
      termsUrl,
      textMessage,
    } = this.props;
    const { consentSettings, isShown, selectedLocale } = this.state;

    // console.log("countryCode:", countryCode);

    const appearsToBeLoggedIn = !!accessToken;
    const targetUrl = encodeURIComponent(window.location.origin);

    const isAllChecked = Object.values(consentSettings).every(checked => checked);

    const cookieDefns = allAvailCookieDefns.filter(
      defn => requestDataTypes.includes(defn.type),
    );

    return (
      <div className={BLOCK}>
        <div className={`${BLOCK}__header`}>
          <div className={`${BLOCK}__logo`}>
            {
              isConnected && companyLogo && (
                <img
                  className={`${BLOCK}__company-logo`}
                  src={companyLogo}
                  alt="Company logo"
                />
              )
            }
          </div>
          <div className={`${BLOCK}__title`}>{renderText("CookieKit.Title", selectedLocale)}</div>
          <button
            type="button"
            className={`xb-cookie-kit__button ${BLOCK}__close-button`}
            onClick={onClose}
          >
            <img
              className={`${BLOCK}__close-button-icon`}
              src={`${xcoobeeConfig.domain}/close-icon.svg`}
              alt="close-icon"
            />
          </button>
        </div>
        <div className={`${BLOCK}__text-container`}>
          <div className={`${BLOCK}__text`}>
            { typeof textMessage === "string"
              ? textMessage : this.renderTextMessage(textMessage) }
          </div>
          <div className={`${BLOCK}__locale-container`}>
            <div className={`${BLOCK}__locale`}>
              <button
                type="button"
                className={`xb-cookie-kit__button ${BLOCK}__language-picker`}
                onClick={() => this.setState({ isShown: !isShown })}
              >
                { selectedLocale }
              </button>
              { countryCode && (
                <div className={`${BLOCK}__block ${BLOCK}__block--sm`}>
                  <div className={`${BLOCK}__flag`}>
                    <ReactCountryFlag code={countryCode} svg />
                  </div>
                </div>
              )}
            </div>
            { isShown && (
              <div className={`${BLOCK}__custom-select`}>
                { locales.map(locale => (
                  <button
                    className={`xb-cookie-kit__button ${BLOCK}__language-picker-button`}
                    type="button"
                    onClick={() => this.handleLocaleChange(locale)}
                  >
                    {locale}
                  </button>))}
              </div>
            )}
          </div>
        </div>
        <div className={`${BLOCK}__cookie-list`}>
          { cookieDefns.map(cookieDefn => (
            <div className={`${BLOCK}__cookie`}>
              <div className={`${BLOCK}__block ${BLOCK}__block--lg`}>
                <div>
                  <input
                    id={`xbCheckbox_${cookieDefn.id}`}
                    type="checkbox"
                    checked={consentSettings[cookieDefn.type]}
                    onChange={e => this.handleCookieCheck(e, cookieDefn.type)}
                  />
                  <label
                    htmlFor={`xbCheckbox_${cookieDefn.id}`}
                    className={`${BLOCK}__checkbox`}
                  />
                </div>
                <div className={`${BLOCK}__cookie-title`}>
                  <a
                    className={`${BLOCK}__cookie-title-link`}
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
          className={`xb-cookie-kit__button ${BLOCK}__check-all`}
          onClick={this.handleCheckAll}
        >
          {isAllChecked
            ? renderText("CookieKit.UncheckButton", selectedLocale)
            : renderText("CookieKit.CheckAllButton", selectedLocale)}
        </button>
        <div className={`${BLOCK}__actions`}>
          { !hideBrandTag && (
            <div className={`${BLOCK}__privacy-partner-container`}>
              <a
                className={`${BLOCK}__privacy-partner-link`}
                href={links.poweredBy}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className={`${BLOCK}__privacy-partner`}>
                  {renderText("CookieKit.PoweredByText", selectedLocale)}
                  <img
                    className={`${BLOCK}__privacy-partner-logo`}
                    src={`${xcoobeeConfig.domain}/xcoobee-logo.svg`}
                    alt="XcooBee logo"
                  />
                </div>
              </a>
            </div>
          )}
          <div className={`${BLOCK}__button-container`}>
            <button
              type="button"
              className={`xb-cookie-kit__button ${BLOCK}__button`}
              onClick={this.handleSubmit}
            >
              {renderText("CookieKit.OkButton", selectedLocale)}
            </button>
          </div>
        </div>
        <div className={`${BLOCK}__links`}>
          { isConnected && (appearsToBeLoggedIn
            ? (
              <a
                className={`${BLOCK}__link`}
                href={`${xcoobeeConfig.origin}${links.manage}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {renderText("CookieKit.ManageLink", selectedLocale)}
              </a>
            )
            : (
              <button
                className={`xb-cookie-kit__button ${BLOCK}__link`}
                type="button"
                onClick={() => window.open(`${xcoobeeConfig.origin}${links.login}?targetUrl=${targetUrl}`)}
              >
                {renderText("CookieKit.LoginLink", selectedLocale)}
              </button>
            )
          )}
          <a
            className={`${BLOCK}__link`}
            href={termsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {renderText("CookieKit.TermsLink", selectedLocale)}
          </a>
          <a
            className={`${BLOCK}__link`}
            href={privacyUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {renderText("CookieKit.PolicyLink", selectedLocale)}
          </a>
        </div>
        { !hideBrandTag && (
          <div className={`${BLOCK}__powered-by`}>
            Powered by
            <a
              className={`${BLOCK}__powered-by-link`}
              href={links.poweredBy}
              target="_blank"
              rel="noopener noreferrer"
            >
              XcooBee
            </a>
          </div>
        )}
      </div>
    );
  }
}
