import ReactDOM from "react-dom";

import App from "../App";

import Config from "./Config";

import { cookieTypes, cssHref, defaultConfig, consentStatuses } from "../utils";

export default class CookieKit {
  _config = null;

  _consentStatus = consentStatuses.open;

  get cookies() {
    return this._cookies;
  }

  get config() {
    return this._config;
  }

  initialize(config) {
    const defaultCookies = {};

    cookieTypes.forEach((cookie) => {
      defaultCookies[cookie.model] = {
        name: cookie.key,
      };
    });

    const CONFIG = Object.assign(defaultConfig, config);

    this._config = new Config(CONFIG);

    if (CONFIG.cssAutoLoad) {
      const fileRef = document.createElement("link");

      fileRef.setAttribute("rel", "stylesheet");
      fileRef.setAttribute("type", "text/css");
      fileRef.setAttribute("href", `${xcoobeeConfig.domain}/${cssHref}`);

      document.head.appendChild(fileRef);
    }

    const CONTAINER = document.createElement("div");

    CONTAINER.id = "xcoobee-cookie-kit";

    ReactDOM.render(<App />, CONTAINER);
    document.body.appendChild(CONTAINER);
  }

  get consentStatus() {
    return this._consentStatus;
  }

  set consentStatus(value) {
    this._consentStatus = value;
  }

  getParam(field) {
    return this._config[field];
  }

  setParam(field, value) {
    this._config[field] = value;
  }

  getConsentStatus() {
    return this._consentStatus;
  }

  getCookieTypes() {
    return this._config.cookies.map(cookie => ({ [cookie.type]: cookie.checked }));
  }
}
