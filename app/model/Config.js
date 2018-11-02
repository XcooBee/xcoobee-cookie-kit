import Cookie from "./Cookie";

export default class Config {
  _campaignName = null;

  _campaignReference = null;

  _checkByDefaultTypes = [];

  _companyLogo = null;

  _cookieHandler = () => null;

  _cookies = [];

  _expirationTime = 0;

  _position = "left_bottom";

  _privacyUrl = null;

  _requestDataTypes = [];

  _targetUrl = null;

  _termsUrl = false;

  _testMode = false;

  _textMessage = "";

  constructor(config) {
    if (!config) {
      return;
    }

    this._campaignName = config.campaignName;
    this._campaignReference = config.campaignReference;
    this._checkByDefaultTypes = config.checkByDefaultTypes;
    this._companyLogo = config.companyLogo;
    this._cookieHandler = config.cookieHandler || (() => null);
    this._cssAutoLoad = config.cssAutoLoad;
    this._expirationTime = config.expirationTime;
    this._position = config.position;
    this._privacyUrl = config.privacyUrl;
    this._requestDataTypes = config.requestDataTypes;
    this._targetUrl = config.targetUrl;
    this._termsUrl = config.termsUrl;
    this._testMode = config.testMode;
    this._textMessage = config.textMessage;

    this._cookies = config.requestDataTypes.map(type => new Cookie({
      type,
      checked: config.checkByDefaultTypes.includes(type),
    }));
  }

  get campaignName() {
    return this._campaignName;
  }

  get campaignReference() {
    return this._campaignReference;
  }

  get checkByDefaultTypes() {
    return this._checkByDefaultTypes;
  }

  get companyLogo() {
    return this._companyLogo;
  }

  get cookies() {
    return this._cookies;
  }

  get cookieHandler() {
    return this._cookieHandler;
  }

  get expirationTime() {
    return this._expirationTime;
  }

  get position() {
    return this._position;
  }

  get privacyUrl() {
    return this._privacyUrl;
  }

  get requestDataTypes() {
    return this._requestDataTypes;
  }

  get targetUrl() {
    return this._targetUrl;
  }

  get termsUrl() {
    return this._termsUrl;
  }

  get testMode() {
    return this._testMode;
  }

  get textMessage() {
    return this._textMessage;
  }

  set campaignName(value) {
    this._campaignName = value;
  }

  set campaignReference(value) {
    this._campaignReference = value;
  }

  set checkByDefaultTypes(value) {
    this._checkByDefaultTypes = value;
    this._cookies = this._requestDataTypes.map(type => new Cookie({
      type,
      checked: value.includes(type),
    }));
  }

  set companyLogo(value) {
    this._companyLogo = value;
  }

  set cookies(value) {
    this._cookies = value.map(item => new Cookie(item));
  }

  set cookieHandler(value) {
    this._cookieHandler = value;
  }

  set expirationTime(value) {
    this._expirationTime = value;
  }

  set position(value) {
    this._position = value;
  }

  set privacyUrl(value) {
    this._privacyUrl = value;
  }

  set requestDataTypes(value) {
    this._requestDataTypes = value;
    this._cookies = value.map(type => new Cookie({
      type,
      checked: this._checkByDefaultTypes.includes(type),
    }));
  }

  set targetUrl(value) {
    this._targetUrl = value;
  }

  set termsUrl(value) {
    this._termsUrl = value;
  }

  set testMode(value) {
    this._testMode = value;
  }

  set textMessage(value) {
    this._textMessage = value;
  }
}
