import { Component } from 'react';
import PropTypes from 'prop-types';
import ReactCountryFlag from 'react-country-flag';

import Campaign from '../model/Campaign';
import { cookieTypes, locales, tokenKey, links, xcoobeeCookiesKey } from '../utils';
import { renderText } from '../utils/locales/renderText'

export default class CookieKitPopup extends Component {
  static propTypes = {
    data: PropTypes.object,
    isOffline: PropTypes.bool,
    onClose: PropTypes.func
  };

  static defaultProps = {
    data: new Campaign(),
    isOffline: false,
    onClose: () => {}
  };

  constructor(props) {
    super(props);

    const { data, isOffline } = this.props;

    this.state = {
      checked: [],
      selectedLocale: 'EN',
      isShown: false,
      cookies: isOffline ? cookieTypes : cookieTypes.filter(type => data.dataTypes.includes(type.key)),
      isAuthorized: !!localStorage[tokenKey]
    };

    this.onMessage = this.onMessage.bind(this);
    window.addEventListener('message', this.onMessage);
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
    let checked = this.state.checked;

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
      this.setState({ checked: cookies.map(cookie => cookie.id) })
    }
  }

  handleLogin() {
    window.open(`${links.login}?targetUrl=${window.location.origin}`);
  }

  handleSubmit() {
    const { cookies, checked } = this.state;

    cookies.forEach(cookie => {
      if (checked.includes(cookie.id)) {
        Xcoobee.cookies[cookie.model].allowed = true;
      }
    });

    localStorage.setItem('xcoobeeCookies', JSON.stringify(Xcoobee.cookies));
    this.props.onClose(true);
  }

  render() {
    const { data, isOffline, onClose, countryCode } = this.props;
    const { checked, isAuthorized, selectedLocale, isShown, cookies } = this.state;

    return <div className="cookie-kit-popup">
      <div className="header">
        <div className="logo"><img src={Xcoobee.config.companyLogoUrl} /></div>
        <div className="title">{renderText("CookieKit.Title", selectedLocale)}</div>
        <div className="closeBtn" onClick={() => onClose()}>&#215;</div>
      </div>
      <div className="text-container">
        <div className="text">
          {renderText("CookieKit.PopupMessage", selectedLocale)}
        </div>
        <div className="locale-container">
          <div className="locale">
            <div className="block block-sm" onClick={() => this.setState({ isShown: !isShown })}>
              { selectedLocale }
            </div>
            <div className="block block-sm block-img">
              <div>
                <ReactCountryFlag code={countryCode} svg styleProps={{ width: '25px', height: '25px' }} />
              </div>
            </div>
          </div>
          { isShown && <div className="custom-select">
            { locales.map(locale => <div onClick={() => this.handleLocaleChange(locale)}>{locale}</div>) }
          </div> }
        </div>
      </div>
      <div className="cookie-list">
        { cookies.map(cookie => <div className="cookie">
          <div className="block block-lg">
            <div>
              {cookie.amount}
              <input id={`checkbox-${cookie.id}`}
                     type="checkbox"
                     checked={checked.includes(cookie.id)}
                     onChange={e => this.handleCookieCheck(e, cookie.id)}/>
              <label htmlFor={`checkbox-${cookie.id}`} className="check-box" />
            </div>
            <div>{`COOKIE${cookie.amount > 1 ? 'S' : ''}`}</div>
          </div>
          <div className="cookie-title">{renderText(cookie.localeKey, selectedLocale)}</div>
        </div>) }
      </div>
      <div className="check-all" onClick={() => this.handleCheckAll()}>
        {checked.length === cookies.length ?
          renderText("CookieKit.UncheckButton", selectedLocale) : renderText("CookieKit.CheckAllButton", selectedLocale)}
      </div>
      <div className="actions">
        <div>
          <a href={links.poweredBy} target="_blank">
            <div className="privacy-partner">
              {renderText("CookieKit.PoweredByText", selectedLocale)}}
              <img src={`${xcoobeeConfig.domain}/xcoobee-logo.svg`} />
            </div>
          </a>
        </div>
        <div className="button-container">
          <div className="button" onClick={() => this.handleSubmit()}>OK</div>
        </div>
      </div>
      <div className="links">
        { !isOffline && (isAuthorized ? <a href={links.manage}>{renderText("CookieKit.ManageLink", selectedLocale)}</a> :
          <a onClick={() => this.handleLogin()}>
            {renderText("CookieKit.LoginLink", selectedLocale)}
          </a>) }
        <a href={data.termsUrl}>{renderText("CookieKit.TermsLink", selectedLocale)}</a>
        <a href={data.privacyUrl}>{renderText("CookieKit.PolicyLink", selectedLocale)}</a>
      </div>
    </div>;
  }
}
