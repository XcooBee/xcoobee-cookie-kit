import { Component } from 'react';
import PropTypes from 'prop-types';

export default class CookieKitPopup extends Component {
  static propTypes = {
    isAuthorized: PropTypes.bool,
    isOffline: PropTypes.bool,
    onClose: PropTypes.func
  };

  static defaultProps = {
    isAuthorized: false,
    isOffline: false,
    onClose: () => {}
  };

  constructor(props) {
    super(props);

    this.state = {
      cookies: [
        { id: 0, name: 'necessary', amount: 1, checked: true },
        { id: 1, name: 'user', amount: 1, checked: false },
        { id: 2, name: 'statistics', amount: 2, checked: false },
        { id: 3, name: 'marketing', amount: 1, checked: false }
      ],
      checked: [],
      selectedLocale: 'EN',
      isShown: false
    };
  }

  componentDidMount() {
    this.setState({ checked: this.state.cookies.filter(cookie => cookie.checked).map(cookie => cookie.id) });
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
    const { cookies, checked } = this.state;

    if (cookies.length === checked.length) {
      this.setState({ checked: [] });
    } else {
      this.setState({ checked: cookies.map(cookie => cookie.id) })
    }
  }

  render() {
    const { isAuthorized, isOffline, onClose } = this.props;
    const { cookies, checked, selectedLocale, isShown } = this.state;
    const locales = ['EN', 'DE', 'FR', 'ES'];

    return <div className="cookie-kit-popup">
      <div className="header">
        <div className="logo"><img src="logo.svg" /></div>
        <div className="title">COOKIE PREFERENCES</div>
        <div className="closeBtn" onClick={() => onClose()}>&#215;</div>
      </div>
      <div className="text-container">
        <div className="text">
          This site uses cookies. Use this panel to adjust your preferences.
        </div>
        <div className="locale-container">
          <div className="locale">
            <div className="block block-sm" onClick={() => this.setState({ isShown: !isShown })}>
              { selectedLocale }
            </div>
            <div className="block block-sm block-img">
              <img src="https://cdn.countryflags.com/thumbs/united-states-of-america/flag-square-500.png" />
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
          {cookie.name.toUpperCase()}
        </div>) }
      </div>
      <div className="check-all" onClick={() => this.handleCheckAll()}>
        {checked.length === cookies.length ? 'Uncheck All' : 'Check All'}
      </div>
      <div className="actions">
        <div>
          <a href="https://www.xcoobee.com" target="_blank">
            <div className="privacy-partner">
              Powered by
              <img src="logo-full.svg" />
            </div>
          </a>
        </div>
        <div className="button-container">
          <div className="button">OK</div>
        </div>
      </div>
      <div className="links">
        { !isOffline && (isAuthorized ? <a href="">Manage</a> :
          <a href="https://testapp.xcoobee.net/auth/minlogin?targetUrl=http://localhost:3001"
             target="_blank">
            Login
          </a>) }
        <a href="">Terms</a>
        <a href="">Cookie Policy</a>
      </div>
    </div>;
  }
}
