import XcoobeeCookie from "./XcoobeeCookie";

export default class XcoobeeCookies {
  _application = new XcoobeeCookie();

  _usage = new XcoobeeCookie();

  _statistics = new XcoobeeCookie();

  _advertising = new XcoobeeCookie();

  constructor(cookies = {}) {
    this._application = new XcoobeeCookie(cookies.application);
    this._usage = new XcoobeeCookie(cookies.usage);
    this._statistics = new XcoobeeCookie(cookies.statistics);
    this._advertising = new XcoobeeCookie(cookies.advertising);
  }

  get application() {
    return this._application;
  }

  get usage() {
    return this._usage;
  }

  get statistics() {
    return this._statistics;
  }

  get advertising() {
    return this._advertising;
  }
}
