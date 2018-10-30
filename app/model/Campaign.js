import Cookie from "./Cookie";

export default class Campaign {
  _reference = null;

  _privacyUrl = null;

  _termsUrl = false;

  _position = "left_bottom";

  _cookies = [];

  constructor(config) {
    if (!config) {
      return;
    }

    this._reference = config.campaignReference;
    this._privacyUrl = config.privacyUrl;
    this._termsUrl = config.termsUrl;
    this._position = config.position;
    this._cookies = config.cookiesDisplayOptions.map(item => new Cookie(item));
  }

  get reference() {
    return this._reference;
  }

  get privacyUrl() {
    return this._privacyUrl;
  }

  get termsUrl() {
    return this._termsUrl;
  }

  get position() {
    return this._position;
  }

  get cookies() {
    return this._cookies;
  }
}
