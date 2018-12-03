import ReactDOM from "react-dom";

import App from "../App";

import Config from "./Config";

import { cookieTypes, cssHref, defaultConfig, consentStatuses, configFields, requiredFields } from "../utils";

export default class CookieKit {
  _config = null;

  _consentStatus = consentStatuses.open;

  initialize(config) {
    if (!this.checkRequiredFields(config)) {
      return;
    }

    const defaultCookies = {};

    cookieTypes.forEach((cookie) => {
      defaultCookies[cookie.key] = {
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

    CONTAINER.className = "xb-cookie-kit";

    ReactDOM.render(<App />, CONTAINER);
    document.body.appendChild(CONTAINER);
  }

  checkRequiredFields(config) {
    if (!config) {
      return false;
    }

    const errors = [];

    requiredFields.forEach((field) => {
      if (!config[field]) {
        errors.push(`${field} field is required as initialization parameter`);
      }
    });

    if (!config.cookieHandler && !config.targetUrl) {
      errors.push("One of cookieHandler or targetUrl fields is required as initialization parameter");
    }

    if (errors.length) {
      errors.forEach(errorMessage => console.error(errorMessage));
      return false;
    }

    return true;
  }

  get cookies() {
    return this._cookies;
  }

  get config() {
    return this._config;
  }

  get consentStatus() {
    return this._consentStatus;
  }

  set consentStatus(value) {
    this._consentStatus = value;
  }

  getParam(field) {
    if (!configFields.includes(field)) {
      console.error(`${field} parameter is not valid.`);
      return;
    }
    return this._config[field];
  }

  setParam(field, value) {
    if (!configFields.includes(field)) {
      console.error(`${field} parameter is not valid.`);
      return;
    }
    this._config[field] = value;
  }

  getConsentStatus() {
    return this._consentStatus;
  }

  getCookieTypes() {
    const cookies = {};

    this._config.cookies.forEach((cookie) => {
      cookies[cookie.type] = cookie.checked;
    });
    return this._consentStatus === consentStatuses.complete ? cookies : {};
  }
}
