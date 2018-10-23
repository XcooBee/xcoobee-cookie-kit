import { Component } from "react";
import PropTypes from "prop-types";
import ReactCountryFlag from "react-country-flag";

import Campaign from "../model/Campaign";
import { cookieTypes, locales, tokenKey, links } from "../utils";
import renderText from "../utils/locales/renderText";

export default class CookieKitPopup extends Component {
  static propTypes = {
    data: PropTypes.shape({
      id: PropTypes.any,
      name: PropTypes.string,
      position: PropTypes.string,
      description: PropTypes.string,
      privacyUrl: PropTypes.string,
      termsUrl: PropTypes.string,
      dataTypes: PropTypes.array,
    }),
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

    this.state = {
      checked: [],
      selectedLocale: "EN",
      isShown: false,
      cookies: isOffline ? cookieTypes : cookieTypes.filter(type => data.dataTypes.includes(type.key)),
      isAuthorized: !!localStorage[tokenKey],
    };

    this.onMessage = this.onMessage.bind(this);
    window.addEventListener("message", this.onMessage);
  }

  onMessage(event) {
    const { accessToken } = event.data;

    if (accessToken) {
      localStorage.setItem(tokenKey, accessToken);
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
    const { cookies, checked } = this.state;
    const { onClose } = this.props;

    cookies.forEach((cookie) => {
      if (checked.includes(cookie.id)) {
        Xcoobee.cookies[cookie.model].allowed = true;
      }
    });

    localStorage.setItem("xcoobeeCookies", JSON.stringify(Xcoobee.cookies));
    onClose(true);
  }

  render() {
    const { data, isOffline, onClose, countryCode } = this.props;
    const { checked, isAuthorized, selectedLocale, isShown, cookies } = this.state;

    return (
      <div className="cookie-kit-popup">
        <div className="header">
          <div className="logo">
            <img
              src={Xcoobee.config.companyLogoUrl}
              alt="company-logo"
            />
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
            {renderText("CookieKit.PopupMessage", selectedLocale)}
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
                  {cookie.amount}
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
                <div>{`COOKIE${cookie.amount > 1 ? "S" : ""}`}</div>
              </div>
              <div className="cookie-title">{renderText(cookie.localeKey, selectedLocale)}</div>
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
          { isOffline && (isAuthorized
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
