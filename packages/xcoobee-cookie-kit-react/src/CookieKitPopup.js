import React from "react";
import PropTypes from "prop-types";
import ReactCountryFlag from "react-country-flag";
import Enums from "xcoobee-enums";

import {
  cookieDefns as allAvailCookieDefns,
  cookieTypes,
  locales,
  links,
} from "xcoobee-cookie-kit-core/src/configs";
import renderText from "xcoobee-cookie-kit-core/src/renderText";
import { getLocale, saveLocale, getCountryCode, saveCountryCode } from "xcoobee-cookie-kit-core/src/LocaleManager";

import closeIcon from "./assets/close-icon.svg";
import xbLogo from "./assets/xcoobee-logo.svg";

import CookieConsentShape from "./lib/CookieConsentShape";

import { xbOrigin } from "./configs";

const BLOCK = "xb-cookie-kit-popup";

const OPTION = "loginstatus";

const COUNTRY_DATA = Enums.getEnum("country-data");

export default class CookieKitPopup extends React.PureComponent {
  static propTypes = {
    companyLogo: PropTypes.string,
    cookieConsents: PropTypes.arrayOf(CookieConsentShape.isRequired).isRequired,
    hideBrandTag: PropTypes.bool.isRequired,
    isConnected: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onLogin: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    loginStatus: PropTypes.bool,
    privacyUrl: PropTypes.string.isRequired,
    requestDataTypes: PropTypes.arrayOf(
      PropTypes.oneOf(cookieTypes).isRequired,
    ).isRequired,
    termsUrl: PropTypes.string.isRequired,
    textMessage: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.shape({
        "de-de": PropTypes.string,
        "en-us": PropTypes.string,
        "es-419": PropTypes.string,
        "fr-fr": PropTypes.string,
      }).isRequired,
    ]).isRequired,
  };

  static defaultProps = {
    companyLogo: null,
    loginStatus: false,
  };

  constructor(props) {
    // console.log('CookieKitPopup#constructor');
    super(props);

    const { cookieConsents, requestDataTypes } = this.props;
    const consentSettings = {};

    cookieConsents.filter(cookieConsent => requestDataTypes.includes(cookieConsent.type)).forEach((cookieConsent) => {
      consentSettings[cookieConsent.type] = cookieConsent.checked;
    });

    this.state = {
      consentSettings,
      countryCode: getCountryCode() || "EU",
      selectedLocale: getLocale() || "EN",
      isLocaleSelectShown: false,
      isCountrySelectShown: false,
    };

    window.addEventListener("message", this.onMessage);
  }

  componentWillUnmount() {
    // console.log('CookieKitPopup#componentWillUnmount');
    window.removeEventListener("message", this.onMessage);
  }

  onMessage = (event) => {
    if (!event.data || typeof event.data !== "string") {
      return;
    }
    const { onLogin } = this.props;

    const loginStatus = JSON.parse(event.data)[OPTION];

    if (loginStatus) {
      onLogin();
    }
  };

  handleLocaleChange = (locale) => {
    // console.log('CookieKitPopup#handleLocaleChange');
    this.setState({ selectedLocale: locale, isLocaleSelectShown: false });
    saveLocale(locale);
  };

  handleCountryChange = (countryCode) => {
    // console.log('CookieKitPopup#handleCountryChange');
    this.setState({ countryCode, isCountrySelectShown: false });
    saveCountryCode(countryCode);
  };

  handleCountrySelectToggle = (e) => {
    // console.log('CookieKitPopup#handleCountrySelectToggle');
    const { isCountrySelectShown } = this.state;

    e.stopPropagation();
    this.setState({ isCountrySelectShown: !isCountrySelectShown, isLocaleSelectShown: false });
  };

  handleLocaleSelectToggle = (e) => {
    // console.log('CookieKitPopup#hhandleLocaleSelectToggle');
    const { isLocaleSelectShown } = this.state;

    e.stopPropagation();
    this.setState({ isLocaleSelectShown: !isLocaleSelectShown, isCountrySelectShown: false });
  };

  handleCookieCheck = (e, type) => {
    // console.log('CookieKitPopup#handleCookieCheck');
    const { consentSettings } = this.state;
    const checked = {
      ...consentSettings,
    };

    checked[type] = e.target.checked;

    this.setState({ consentSettings: checked });
  };

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
  };

  handleSubmit = () => {
    // console.log('CookieKitPopup#handleSubmit');
    const { onSubmit } = this.props;
    const { consentSettings } = this.state;

    onSubmit(consentSettings);
  };

  renderTextMessage(textMessage) {
    // console.log('CookieKitPopup#renderTextMessage');
    const { selectedLocale } = this.state;

    switch (selectedLocale) {
      case "EN":
        return textMessage["en-us"];
      case "DE":
        return textMessage["de-de"] || textMessage["en-us"];
      case "ES":
        return textMessage["es-419"] || textMessage["en-us"];
      case "FR":
        return textMessage["fr-fr"] || textMessage["en-us"];
      default:
        return textMessage["en-us"];
    }
  }

  render() {
    // console.log('CookieKitPopup#render');
    const {
      companyLogo,
      hideBrandTag,
      loginStatus,
      isConnected,
      onClose,
      privacyUrl,
      requestDataTypes,
      termsUrl,
      textMessage,
    } = this.props;
    const { consentSettings, countryCode, isCountrySelectShown, isLocaleSelectShown, selectedLocale } = this.state;

    // console.log("countryCode:", countryCode);

    const appearsToBeLoggedIn = loginStatus;
    const targetUrl = encodeURIComponent(window.location.origin);

    const isAllChecked = Object.values(consentSettings).every(checked => checked);

    const cookieDefns = allAvailCookieDefns.filter(
      defn => requestDataTypes.includes(defn.type),
    );

    const countries = COUNTRY_DATA.map(country => country["alpha-2"]);

    const loginModalFeatures = "left=400, top=100, width=500, height=600";

    return (
      <div
        className={BLOCK}
        onClick={() => this.setState({ isCountrySelectShown: false, isLocaleSelectShown: false })}
      >
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
              src={closeIcon}
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
                onClick={e => this.handleLocaleSelectToggle(e)}
              >
                { selectedLocale }
              </button>
              { countryCode && (
                <button
                  type="button"
                  className={`xb-cookie-kit__button ${BLOCK}__block ${BLOCK}__block--sm ${BLOCK}__country-picker`}
                  onClick={e => this.handleCountrySelectToggle(e)}
                >
                  <div className={`${BLOCK}__flag`}>
                    <ReactCountryFlag code={countryCode} svg />
                  </div>
                </button>
              )}
            </div>
            { isLocaleSelectShown && (
              <div className={`${BLOCK}__custom-select`}>
                { locales.map(locale => (
                  <button
                    key={locale}
                    className={`xb-cookie-kit__button ${BLOCK}__language-picker-button`}
                    type="button"
                    onClick={() => this.handleLocaleChange(locale)}
                  >
                    {locale}
                  </button>
                ))}
              </div>
            )}
            { isCountrySelectShown && (
              <div className={`${BLOCK}__country-picker-select`}>
                { countries.map(cCode => (
                  <button
                    type="button"
                    key={`country-flag-${cCode}`}
                    className={`xb-cookie-kit__button ${BLOCK}__country-picker-button`}
                    onClick={() => this.handleCountryChange(cCode)}
                  >
                    <div className={`${BLOCK}__flag`}>
                      <ReactCountryFlag code={cCode} svg />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={`${BLOCK}__cookie-list`}>
          { cookieDefns.map(cookieDefn => (
            <div key={cookieDefn.type} className={`${BLOCK}__cookie`}>
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
                <div
                  title="More info"
                  className={`${BLOCK}__cookie-title`}
                >
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
                    src={xbLogo}
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
                href={`${xbOrigin}${links.manage}`}
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
                onClick={() => window.open(`${xbOrigin}${links.login}?targetUrl=${targetUrl}`, "", loginModalFeatures)}
              >
                {renderText("CookieKit.LoginLink", selectedLocale)}
              </button>
            )
          )}
          <a
            className={`${BLOCK}__link`}
            href={privacyUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {renderText("CookieKit.PolicyLink", selectedLocale)}
          </a>
          <a
            className={`${BLOCK}__link`}
            href={termsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {renderText("CookieKit.TermsLink", selectedLocale)}
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
