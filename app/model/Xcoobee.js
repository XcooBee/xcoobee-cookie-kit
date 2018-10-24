import ReactDOM from "react-dom";

import App from "../App";
import XcoobeeCookies from "./XcoobeeCookies";

import { cookieTypes, cssHref } from "../utils";

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

    cookieTypes.forEach((cookie) => {
      defaultCookies[cookie.model] = {
        name: cookie.key,
      };
    });

    this.__config = config;
    this._cookies = new XcoobeeCookies(defaultCookies);

    if (config && config.cssAutoLoad) {
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
}
