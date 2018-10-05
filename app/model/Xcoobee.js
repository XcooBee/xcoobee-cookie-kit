import ReactDOM from 'react-dom';

import { App } from '../App';
import XcoobeeCookies from './XcoobeeCookies';

import { defaultConfig, cookieTypes } from '../utils'

export default class Xcoobee {
  _cookies = new XcoobeeCookies();
  __config = null;

  get cookies() {
    return this._cookies;
  }

  get config() {
    return this.__config;
  }

  initialize(config) {
    const defaultCookies = {};

    cookieTypes.forEach(cookie => {
      defaultCookies[cookie.model] = {
        name: cookie.key
      };
    });

    this.__config = config || defaultConfig;
    this._cookies = new XcoobeeCookies(defaultCookies);

    const CONTAINER = document.createElement('div');

    CONTAINER.id = 'xcoobee-cookie-kit';
    ReactDOM.render(<App />, CONTAINER);
    document.body.appendChild(CONTAINER);
  }
}
