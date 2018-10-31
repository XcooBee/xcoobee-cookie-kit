import Cookie from "./Cookie";

export default class Campaign {
  _reference = null;

  _name = null;

  _privacyUrl = null;

  _termsUrl = false;

  _position = "left_bottom";

  _cookies = [];

  _targetUrl = null;

  _companyLogo = null;

  _cookieHandler = () => null;

  _textMessage = "";

  constructor(config) {
    if (!config) {
      return;
    }

    this._reference = config.campaignReference;
    this._name = config.campaignName;
    this._privacyUrl = config.privacyUrl;
    this._termsUrl = config.termsUrl;
    this._position = config.position;
    this._targetUrl = config.targetUrl;
    this._companyLogo = config.companyLogo;
    this._textMessage = config.textMessage;
    this._cookieHandler = config.cookieHandler || (() => null);
    this._cookies = config.requestDataTypes.map(type => new Cookie({
      type,
      checked: config.checkByDefaultTypes.includes(type),
    }));
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

  get targetUrl() {
    return this._targetUrl;
  }

  get companyLogo() {
    return this._companyLogo;
  }

  get textMessage() {
    return this._textMessage;
  }

  get cookieHandler() {
    return this._cookieHandler;
  }
}
